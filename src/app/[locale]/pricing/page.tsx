"use client";

import { Check, Zap, ShieldCheck, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Basic Plan",
      price: "199",
      icon: <Zap className="text-blue-500" />,
      features: ["Access to 5 Courses", "Certified Certificates", "Limited Technical Support"],
      button: "Get Started",
      color: "border-slate-100"
    },
    {
      name: "Pro Plan",
      price: "499",
      icon: <ShieldCheck className="text-purple-500" />,
      features: [
        "Unlimited Access",
        "Downloadable PDF Resources",
        "Priority Technical Support",
        "Ad-Free Experience"
      ],
      button: "Most Popular",
      featured: true,
      color: "border-blue-600 shadow-2xl shadow-blue-100"
    },
    {
      name: "Institutional",
      price: "999",
      icon: <Crown className="text-amber-500" />,
      features: [
        "Up to 10 Student Accounts",
        "Private Dashboard",
        "Live Zoom Sessions",
        "Full Customization"
      ],
      button: "Contact Us",
      color: "border-slate-100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 text-left">
      <div className="max-w-6xl mx-auto text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-slate-800">Invest in Your Medical Future</h1>
        <p className="text-slate-500 text-xl font-medium">Choose the right plan and start your learning journey at Ain Shams University today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`bg-white p-10 rounded-[3rem] border-4 transition-all hover:-translate-y-2 flex flex-col ${plan.color}`}
          >
            <div className="mb-8">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-600">{plan.price}</span>
                <span className="text-slate-400 font-bold text-sm uppercase">EGP / Month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                  <Check className="text-green-500 shrink-0" size={18} />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className={`w-full py-4 rounded-2xl font-black text-center transition-all ${
                plan.featured
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {plan.button}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
