"use client";

import { useEffect, useRef } from "react";

const plans = [
  {
    name: "Standard",
    price: 39,
    description: "Full-service filter delivery and professional installation",
    features: [
      "Premium MERV-rated filters",
      "Filter delivery + professional installation every 3 months",
      "Background-checked technicians",
      "Free filter sizing consultation",
      "Text/email appointment reminders",
      "Cancel or pause anytime",
    ],
    notIncluded: [],
    cta: "Start Standard",
    popular: true,
  },
  {
    name: "Premium",
    price: 59,
    description: "Maximum convenience with monthly service and HVAC care",
    features: [
      "Everything in Standard, plus:",
      "Monthly professional installation",
      "Annual HVAC inspection included",
      "Priority scheduling (same-week visits)",
      "10% off add-on services",
      "Satisfaction guarantee",
    ],
    notIncluded: [],
    cta: "Start Premium",
    popular: false,
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-on-scroll">
          <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All plans include free filter sizing consultation. No hidden fees,
            no contracts, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`animate-on-scroll relative rounded-3xl p-8 ${
                plan.popular
                  ? "bg-gradient-to-br from-cyan-600 to-emerald-600 text-white shadow-2xl shadow-cyan-500/30 scale-105 z-10"
                  : "bg-white border border-gray-200 hover:border-cyan-200 hover:shadow-xl transition-all"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.popular ? "text-cyan-100" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className={`text-5xl font-bold ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}
                >
                  ${plan.price}
                </span>
                <span
                  className={plan.popular ? "text-cyan-100" : "text-gray-500"}
                >
                  /month
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? "text-cyan-200" : "text-emerald-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, featureIndex) => (
                  <li
                    key={`not-${featureIndex}`}
                    className="flex items-start gap-3 opacity-50"
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#booking"
                className={`block w-full py-3 px-6 rounded-full font-semibold text-center transition-all ${
                  plan.popular
                    ? "bg-white text-cyan-600 hover:bg-gray-100 shadow-lg"
                    : "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-700 hover:to-emerald-700 shadow-lg shadow-cyan-500/25"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-on-scroll">
          <p className="text-gray-500 text-sm">
            Prices shown are per HVAC unit. Multiple unit discounts available.
            <br />
            All plans include premium MERV-rated filters appropriate for your
            system.
          </p>
        </div>
      </div>
    </section>
  );
}
