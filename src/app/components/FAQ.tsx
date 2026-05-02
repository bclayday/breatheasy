"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    question: "What areas do you serve?",
    answer:
      "We currently serve the Greater Atlanta metro area, including Atlanta, Alpharetta, Marietta, Decatur, Sandy Springs, Roswell, Johns Creek, Dunwoody, Kennesaw, and surrounding communities. Not sure if we cover your area? Enter your ZIP code in the booking form and we'll let you know!",
  },
  {
    question: "How do I know what filter size I need?",
    answer:
      "No worries! If you select 'Not sure - measure for me' in the booking form, we'll send a technician to measure your filters for free during your first visit. You can also find your current filter size printed on the side of your existing filter.",
  },
  {
    question: "What type of filters do you provide?",
    answer:
      "We provide high-quality MERV-rated filters ranging from MERV 8 to MERV 16, depending on your needs and HVAC system compatibility. Our standard filters are MERV 11, which capture most common household allergens. During your consultation, we'll recommend the best option for your home.",
  },
  {
    question: "How often should I change my air filter?",
    answer:
      "For most homes, we recommend changing filters every 1-3 months. Factors that affect this include pets, allergies, air quality, and how often your HVAC system runs. We'll help you find the right schedule during your consultation.",
  },
  {
    question: "What if I need to reschedule my service?",
    answer:
      "Life happens! You can easily reschedule your service through your online account or by calling us at (404) 555-0123. We ask for at least 24 hours notice when possible, but we'll always work with you to find a time that works.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. There are no long-term contracts or cancellation fees. You can cancel or pause your subscription at any time through your online account or by contacting us. We'll miss you, but we make it easy to come back whenever you're ready.",
  },
  {
    question: "How long does installation take?",
    answer:
      "Most filter installations take 5-15 minutes per unit. Our technicians are efficient and respectful of your time. For homes with multiple HVAC units, we'll complete all installations in a single visit.",
  },
  {
    question: "Do your technicians need access to my home?",
    answer:
      "Yes, for installation services, our technicians will need access to your HVAC units. If you won't be home, we can work with you on secure access options. All our technicians are background-checked and insured for your peace of mind.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    <section id="faq" className="py-20 md:py-32 section-gradient" ref={sectionRef}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-on-scroll">
          <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Common Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We&apos;ve got answers. If you don&apos;t see what you&apos;re
            looking for, give us a call.
          </p>
        </div>

        <div className="animate-on-scroll space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-cyan-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-on-scroll mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="tel:+14045550123"
            className="inline-flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 transition-colors"
          >
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call us at (404) 555-0123
          </a>
        </div>
      </div>
    </section>
  );
}
