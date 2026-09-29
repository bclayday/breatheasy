"use client";

import { useState } from "react";
import BookingForm from "../components/BookingForm";
import FAQ from "../components/FAQ";

const stats = [
  { value: "35 mi", label: "Service radius around Atlanta" },
  { value: "2", label: "HVAC units covered in every plan" },
  { value: "0", label: "Ladders for you to climb" },
  { value: "2 min", label: "Average time to sign up" },
];

const problems = [
  {
    icon: "🧠",
    title: "The forgotten chore",
    body: "Air filters are supposed to change every 1 to 3 months. Most go 6 months or more. Nobody sets a reminder that actually works.",
  },
  {
    icon: "🚗",
    title: "The errand you keep skipping",
    body: "The store run, guessing the right size, hauling the ladder out of the garage. It is a 15 minute job that somehow never happens.",
  },
  {
    icon: "🌀",
    title: "The strain on your system",
    body: "A clogged filter makes your HVAC work harder to move air. Keeping it fresh is one of the simplest ways to treat your system right.",
  },
];

const steps = [
  {
    step: "1",
    title: "Pick your plan",
    body: "Standard at $39/mo or Premium at $59/mo. Both include delivery and installation for up to 2 HVAC units.",
  },
  {
    step: "2",
    title: "We handle everything",
    body: "A local technician arrives on your schedule, measures your filters on the first visit, and swaps them on cadence after that.",
  },
  {
    step: "3",
    title: "Never think about it again",
    body: "Fresh filters, a happier HVAC system, cleaner air moving through your home. Zero effort on your end, ever.",
  },
];

const plans = [
  {
    name: "Standard",
    price: "$39",
    features: [
      "Filter delivery + installation",
      "MERV 8-11 filters",
      "2 HVAC units included",
      "Scheduled swap cadence",
    ],
    featured: false,
  },
  {
    name: "Premium",
    price: "$59",
    features: [
      "Filter delivery + installation",
      "Upgraded MERV 13+ filters",
      "2 HVAC units included",
      "Priority scheduling",
    ],
    featured: true,
  },
];

export default function OfferPage() {
  const [formRef, setFormRef] = useState<HTMLElement | null>(null);

  const scrollToForm = () => {
    formRef?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-center text-sm font-medium py-3 px-4">
        Now serving Metro Atlanta and a 35-mile radius. Spots are limited at
        launch.
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-cyan-700 mb-6 shadow-sm border border-cyan-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            Air Filter Subscription, Atlanta
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Air Filters:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">
              Done For You
            </span>
            , From $39/mo
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            We deliver AND install your air filters on a schedule that matches
            your home. You never climb a ladder, never forget a swap, never
            think about it again.
          </p>
          <p className="text-base text-gray-500 mb-8 max-w-xl mx-auto">
            Filters, labor, and scheduling are all included. Local technicians
            serving the entire metro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-700 hover:to-emerald-700 transition-all shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-0.5"
            >
              Claim Your Spot
            </button>
            <a
              href="tel:+14704705493"
              className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg border border-gray-200"
            >
              Call (470) 470-5493
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Questions? Call or text a real human, or use the chat on our main
            site.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-gray-900 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
                {s.value}
              </div>
              <div className="text-sm text-gray-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Every homeowner knows these three. Breathe Easy exists to delete
            all of them.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((p) => (
              <div
                key={p.title}
                className="bg-gradient-to-b from-cyan-50 to-white rounded-2xl p-8 border border-cyan-100 shadow-sm"
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {p.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center px-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-700 hover:to-emerald-700 transition-all shadow-xl shadow-cyan-500/25 hover:-translate-y-0.5"
            >
              Start With Step 1
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Simple pricing, everything included
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Have more than 2 HVAC units? Add them for $10-20/mo each.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 border ${
                  p.featured
                    ? "bg-gray-900 text-white border-gray-900 shadow-2xl"
                    : "bg-white text-gray-900 border-gray-200 shadow-sm"
                }`}
              >
                {p.featured && (
                  <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold">{p.price}</span>
                  <span
                    className={p.featured ? "text-gray-300" : "text-gray-500"}
                  >
                    /mo
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start">
                      <span className="text-emerald-500 mr-2">✓</span>
                      <span
                        className={p.featured ? "text-gray-200" : "text-gray-600"}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    p.featured
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-400 hover:to-emerald-400"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Choose {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section ref={setFormRef} className="py-20 px-4 bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Claim your spot
            </h2>
            <p className="text-lg text-gray-600">
              Two minutes now, and this chore is off your list for good.
            </p>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
            Questions?
          </h2>
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center text-sm">
        <div className="max-w-4xl mx-auto">
          <p className="font-semibold text-white mb-2">Breathe Easy LLC</p>
          <p className="mb-4">
            Air filter delivery and installation for Metro Atlanta. Serving a
            35-mile radius around the city.
          </p>
          <p>
            <a href="/" className="text-cyan-400 hover:text-cyan-300">
              breatheasy.ac
            </a>{" "}
            · (470) 470-5493
          </p>
        </div>
      </footer>
    </main>
  );
}
