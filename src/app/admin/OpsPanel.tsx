"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Customer = {
  id: string; name: string; phone: string; email: string;
  street: string; city: string; state: string; zip: string;
  plan: "standard" | "premium"; units: number; filterSizes: string;
  cadenceDays: number; status: "active" | "paused" | "offboarded";
  lastSwap: string | null; nextSwap: string | null; notes: string;
  source: string; createdAt: string; overdue: boolean; dueSoon: boolean;
};

type FormLead = {
  id: string; name: string; email: string; phone: string;
  street: string; city: string; state: string; zip: string;
  hvacUnits: string; filterSize: string; schedule: string; plan: string; notes: string;
  submittedAt: string;
};

type OpsData = {
  customers: Customer[];
  formLeads: FormLead[];
  summary: { active: number; paused: number; dueSoon: number; overdue: number; monthlyRevenue: number; leads: number };
};

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none";

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(value: string | null) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

export default function OpsPanel({ token }: { token: string }) {
  const [data, setData] = useState<OpsData | null>(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<Partial<Customer> | null>(null);
  const [editorLead, setEditorLead] = useState<FormLead | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ops", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (res.ok) setData(await res.json());
    else setError("Could not load operations data.");
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function act(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ops", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) setError((await res.json()).error || "Action failed.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `breatheasy-ops-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openAdd() {
    setEditorLead(null);
    setEditor({ plan: "standard", units: 1, cadenceDays: 90, status: "active", filterSizes: "Measure at first visit" });
  }

  function openConvert(lead: FormLead) {
    setEditorLead(lead);
    setEditor({
      name: lead.name, phone: lead.phone, email: lead.email,
      street: lead.street, city: lead.city, state: lead.state || "GA", zip: lead.zip,
      plan: lead.plan === "Premium" ? "premium" : "standard",
      units: Number(lead.hvacUnits) || 1,
      filterSizes: lead.filterSize || "Measure at first visit",
      cadenceDays: lead.schedule === "Monthly" ? 30 : lead.schedule === "Every 2 months" ? 60 : 90,
      status: "active",
      notes: lead.notes || "",
      source: "form",
    });
  }

  async function submitEditor(e: FormEvent) {
    e.preventDefault();
    if (!editor) return;
    const isConvert = Boolean(editorLead) && !editor.id;
    await act({
      action: isConvert ? "convert" : editor.id ? "update" : "add",
      id: editor.id,
      markConvertedEmail: isConvert ? editorLead?.email : undefined,
      customer: editor,
      patch: editor,
    });
    setEditor(null);
    setEditorLead(null);
  }

  if (!data) {
    return <div className="p-10 text-center text-sm text-slate-500">{error || "Loading operations…"}</div>;
  }

  const cards = [
    { label: "Active subscribers", value: data.summary.active, tone: "text-cyan-700" },
    { label: "Due in 14 days", value: data.summary.dueSoon, tone: "text-amber-600" },
    { label: "Overdue", value: data.summary.overdue, tone: "text-red-600" },
    { label: "Monthly recurring", value: `$${data.summary.monthlyRevenue}`, tone: "text-emerald-700" },
    { label: "New form leads", value: data.summary.leads, tone: "text-violet-700" },
  ];

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={openAdd} className="rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm">+ Add customer</button>
          <button onClick={exportJson} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Export backup</button>
        </div>
        <span className="text-xs text-slate-400">{busy ? "Saving…" : `Updated ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-[#e2edef] bg-white p-5 shadow-sm">
            <div className={`text-3xl font-bold ${c.tone}`}>{c.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      {data.formLeads.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#e2edef] bg-white shadow-sm">
          <div className="border-b border-[#e2edef] px-5 py-4">
            <h3 className="font-semibold text-slate-900">New form leads ({data.formLeads.length})</h3>
            <p className="text-xs text-slate-500">From breatheasy.ac booking form. Convert to schedule their first swap.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {data.formLeads.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-semibold text-slate-900">{l.name} <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">{l.plan || "Standard"}</span></div>
                  <div className="text-sm text-slate-500">{l.phone || l.email} · {l.street ? `${l.street}, ${l.city}` : "no address"} · {l.filterSize || "size TBD"} · {new Date(l.submittedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => openConvert(l)} className="rounded-full bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-700">Convert to customer</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e2edef] bg-white shadow-sm">
        <div className="border-b border-[#e2edef] px-5 py-4">
          <h3 className="font-semibold text-slate-900">Customers ({data.customers.length})</h3>
        </div>
        {data.customers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            No customers yet. Add the first one, or convert a form lead above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Filters</th>
                  <th className="px-3 py-3">Last swap</th>
                  <th className="px-3 py-3">Next swap</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.customers.map((c) => {
                  const d = daysUntil(c.nextSwap);
                  return (
                    <tr key={c.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.street}{c.street && ", "}{c.city} {c.zip}</div>
                        <div className="text-xs text-slate-400">{c.phone}</div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.plan === "premium" ? "bg-violet-50 text-violet-700" : "bg-cyan-50 text-cyan-700"}`}>
                          {c.plan === "premium" ? "Premium $59" : "Standard $39"}
                        </span>
                        <div className="mt-1 text-xs text-slate-400">{c.units} unit{c.units > 1 ? "s" : ""} · every {c.cadenceDays}d</div>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-600">{c.filterSizes}</td>
                      <td className="px-3 py-4 text-xs text-slate-600">{fmtDate(c.lastSwap)}</td>
                      <td className="px-3 py-4 text-xs">
                        {c.nextSwap ? (
                          <span className={`font-bold ${c.overdue ? "text-red-600" : c.dueSoon ? "text-amber-600" : "text-slate-600"}`}>
                            {fmtDate(c.nextSwap)}
                            {c.overdue ? " · overdue" : d !== null ? ` · ${d}d` : ""}
                          </span>
                        ) : (
                          <button onClick={() => act({ action: "swap-done", id: c.id })} className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">Schedule first visit</button>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : c.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {c.status === "active" && c.nextSwap && (
                            <button disabled={busy} onClick={() => act({ action: "swap-done", id: c.id })} className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Swap done</button>
                          )}
                          <button disabled={busy} onClick={() => act({ action: "status", id: c.id, patch: { status: c.status === "active" ? "paused" : "active" } })} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 disabled:opacity-50">
                            {c.status === "active" ? "Pause" : "Activate"}
                          </button>
                          <button onClick={() => { setEditorLead(null); setEditor(c); }} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600">Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => { setEditor(null); setEditorLead(null); }}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-900">{editor.id ? "Edit customer" : editorLead ? `Convert ${editorLead.name}` : "Add customer"}</h3>
            <form onSubmit={submitEditor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required className={inputCls} placeholder="Full name" value={editor.name || ""} onChange={(e) => setEditor({ ...editor, name: e.target.value })} />
                <input className={inputCls} placeholder="Phone" value={editor.phone || ""} onChange={(e) => setEditor({ ...editor, phone: e.target.value })} />
                <input className={inputCls} placeholder="Email" type="email" value={editor.email || ""} onChange={(e) => setEditor({ ...editor, email: e.target.value })} />
                <input className={inputCls} placeholder="ZIP" value={editor.zip || ""} onChange={(e) => setEditor({ ...editor, zip: e.target.value })} />
                <input className={`${inputCls} col-span-2`} placeholder="Street address" value={editor.street || ""} onChange={(e) => setEditor({ ...editor, street: e.target.value })} />
                <input className={inputCls} placeholder="City" value={editor.city || ""} onChange={(e) => setEditor({ ...editor, city: e.target.value })} />
                <select className={inputCls} value={editor.plan || "standard"} onChange={(e) => setEditor({ ...editor, plan: e.target.value as "standard" | "premium" })}>
                  <option value="standard">Standard $39/mo</option>
                  <option value="premium">Premium $59/mo</option>
                </select>
                <input className={inputCls} type="number" min={1} placeholder="HVAC units" value={editor.units || 1} onChange={(e) => setEditor({ ...editor, units: Number(e.target.value) })} />
                <input className={inputCls} type="number" min={7} placeholder="Cadence days" value={editor.cadenceDays || 90} onChange={(e) => setEditor({ ...editor, cadenceDays: Number(e.target.value) })} />
                <input className={`${inputCls} col-span-2`} placeholder="Filter sizes (e.g. 16x25x1, 20x25x1)" value={editor.filterSizes || ""} onChange={(e) => setEditor({ ...editor, filterSizes: e.target.value })} />
                <input className={`${inputCls} col-span-2`} placeholder="Last swap date (optional, YYYY-MM-DD)" value={editor.lastSwap ? editor.lastSwap.slice(0, 10) : ""} onChange={(e) => setEditor({ ...editor, lastSwap: e.target.value || null })} />
                <textarea className={`${inputCls} col-span-2`} rows={2} placeholder="Notes" value={editor.notes || ""} onChange={(e) => setEditor({ ...editor, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditor(null); setEditorLead(null); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={busy} className="rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
