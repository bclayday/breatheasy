"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface FormData {
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
}

interface FormErrors {
  [key: string]: string;
}

const filterSizeOptions = [
  "14x14x1",
  "14x20x1",
  "14x25x1",
  "16x20x1",
  "16x24x1",
  "16x25x1",
  "18x18x1",
  "18x20x1",
  "18x24x1",
  "20x20x1",
  "20x24x1",
  "20x25x1",
  "20x30x1",
  "24x24x1",
  "25x25x1",
  "Other",
  "Not sure - measure for me (free)",
];

export default function BookingForm() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "GA",
    zip: "",
    homeType: "",
    hvacUnits: "1",
    filterSize: "",
    schedule: "",
    plan: "",
    notes: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.zip.trim()) {
      newErrors.zip = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = "Please enter a valid ZIP code";
    }

    if (!formData.homeType) {
      newErrors.homeType = "Please select your home type";
    }

    if (!formData.filterSize) {
      newErrors.filterSize = "Please select your filter size";
    }

    if (!formData.schedule) {
      newErrors.schedule = "Please select your preferred schedule";
    }

    if (!formData.plan) {
      newErrors.plan = "Please select a plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "GA",
        zip: "",
        homeType: "",
        hvacUnits: "1",
        filterSize: "",
        schedule: "",
        plan: "",
        notes: "",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (fieldName: string) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:border-cyan-500 focus:ring-cyan-200"
    } focus:outline-none focus:ring-2 transition-all bg-white`;

  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <section
      id="booking"
      className="py-20 md:py-32 section-gradient"
      ref={sectionRef}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-on-scroll">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            Get Started
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Start Breathing Easier
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill out the form below and we&apos;ll get you set up with your
            perfect filter plan. Free consultation included.
          </p>
        </div>

        <div className="animate-on-scroll bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {submitStatus === "success" ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Breathe Easy!
              </h3>
              <p className="text-gray-600 mb-8">
                We&apos;ve received your information and will be in touch within 24
                hours to confirm your service details and schedule your first
                visit.
              </p>
              <button
                onClick={() => setSubmitStatus("idle")}
                className="text-cyan-600 font-medium hover:text-cyan-700 transition-colors"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-sm font-bold">
                    1
                  </span>
                  Contact Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className={labelClasses}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClasses("name")}
                      placeholder="John Smith"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClasses}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClasses("email")}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClasses}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClasses("phone")}
                      placeholder="(404) 555-1234"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-sm font-bold">
                    2
                  </span>
                  Service Address
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className={labelClasses}>
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className={inputClasses("street")}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="city" className={labelClasses}>
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={inputClasses("city")}
                      placeholder="Atlanta"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className={labelClasses}>
                        State
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={inputClasses("state")}
                      >
                        <option value="GA">Georgia</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="zip" className={labelClasses}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className={inputClasses("zip")}
                        placeholder="30301"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-sm text-red-500">{errors.zip}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-sm font-bold">
                    3
                  </span>
                  Home Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="homeType" className={labelClasses}>
                      Home Type *
                    </label>
                    <select
                      id="homeType"
                      name="homeType"
                      value={formData.homeType}
                      onChange={handleInputChange}
                      className={inputClasses("homeType")}
                    >
                      <option value="">Select type...</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                    </select>
                    {errors.homeType && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.homeType}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="hvacUnits" className={labelClasses}>
                      Number of HVAC units in your home
                    </label>
                    <select
                      id="hvacUnits"
                      name="hvacUnits"
                      value={formData.hvacUnits}
                      onChange={handleInputChange}
                      className={inputClasses("hvacUnits")}
                    >
                      <option value="1">1 unit</option>
                      <option value="2">2 units</option>
                      <option value="3">3 units</option>
                      <option value="4">4 units</option>
                      <option value="5">5 units</option>
                      <option value="6+">6+ units</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Up to 2 units included. 3rd unit +$10/mo, then +$5/mo per additional unit.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="filterSize" className={labelClasses}>
                      Current Filter Size *
                    </label>
                    <select
                      id="filterSize"
                      name="filterSize"
                      value={formData.filterSize}
                      onChange={handleInputChange}
                      className={inputClasses("filterSize")}
                    >
                      <option value="">Select size...</option>
                      {filterSizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    {errors.filterSize && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.filterSize}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-sm font-bold">
                    4
                  </span>
                  Choose Your Plan
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="schedule" className={labelClasses}>
                      Preferred Schedule *
                    </label>
                    <select
                      id="schedule"
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleInputChange}
                      className={inputClasses("schedule")}
                    >
                      <option value="">Select schedule...</option>
                      <option value="monthly">Monthly</option>
                      <option value="bi-monthly">Bi-monthly (every 2 months)</option>
                      <option value="quarterly">Quarterly (every 3 months)</option>
                    </select>
                    {errors.schedule && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.schedule}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="plan" className={labelClasses}>
                      Plan Selection *
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className={inputClasses("plan")}
                    >
                      <option value="">Select plan...</option>
                      <option value="standard">
                        Standard - $39/mo (Quarterly Installation)
                      </option>
                      <option value="premium">
                        Premium - $59/mo (Monthly Install + HVAC Inspection)
                      </option>
                    </select>
                    {errors.plan && (
                      <p className="mt-1 text-sm text-red-500">{errors.plan}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className={labelClasses}>
                  Special Instructions or Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className={inputClasses("notes")}
                  placeholder="Any special instructions, access codes, pet information, etc."
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                {submitStatus === "error" && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    Something went wrong. Please try again or call us at (404)
                    470-5493.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white py-4 px-8 rounded-full font-semibold text-lg hover:from-cyan-700 hover:to-emerald-700 transition-all shadow-xl shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Start My Subscription
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  By submitting, you agree to be contacted about your service.
                  No commitment until you confirm.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
