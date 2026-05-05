import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface CustomerSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  homeType: string;
  hvacUnits: string;
  filterSize: string;
  schedule: string;
  plan: string;
  notes: string;
  submittedAt: string;
}

interface CustomersData {
  customers: CustomerSubmission[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "customers.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    // File doesn't exist, create it with empty array
    const dataDir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify({ customers: [] }, null, 2));
  }
}

async function readCustomers(): Promise<CustomersData> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeCustomers(data: CustomersData): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, "");
  const phoneRegex = /^[\d\-\(\)\+]{10,}$/;
  return phoneRegex.test(cleanPhone);
}

function validateZip(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "zip",
      "homeType",
      "filterSize",
      "schedule",
      "plan",
    ];

    const missingFields = requiredFields.filter(
      (field) => !body[field] || (typeof body[field] === "string" && !body[field].trim())
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!validatePhone(body.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate ZIP code format
    if (!validateZip(body.zip)) {
      return NextResponse.json(
        { error: "Invalid ZIP code format" },
        { status: 400 }
      );
    }

    // Validate plan selection
    const validPlans = ["standard", "premium"];
    if (!validPlans.includes(body.plan)) {
      return NextResponse.json(
        { error: "Invalid plan selection" },
        { status: 400 }
      );
    }

    // Validate schedule selection
    const validSchedules = ["monthly", "bi-monthly", "quarterly"];
    if (!validSchedules.includes(body.schedule)) {
      return NextResponse.json(
        { error: "Invalid schedule selection" },
        { status: 400 }
      );
    }

    // Validate home type
    const validHomeTypes = ["house", "apartment", "condo", "townhouse"];
    if (!validHomeTypes.includes(body.homeType)) {
      return NextResponse.json(
        { error: "Invalid home type" },
        { status: 400 }
      );
    }

    // Create customer submission
    const customer: CustomerSubmission = {
      id: generateId(),
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      street: body.street.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zip: body.zip.trim(),
      homeType: body.homeType,
      hvacUnits: body.hvacUnits || "1",
      filterSize: body.filterSize,
      schedule: body.schedule,
      plan: body.plan,
      notes: body.notes?.trim() || "",
      submittedAt: body.submittedAt || new Date().toISOString(),
    };

    // Read existing customers and add new one
    const data = await readCustomers();
    data.customers.push(customer);
    await writeCustomers(data);

    return NextResponse.json(
      {
        success: true,
        message: "Customer submission received successfully",
        customerId: customer.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing customer submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await readCustomers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
