import { 
  MessageSquareCheck, 
  FileSearch, 
  Wrench, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import { SITE_CONFIG } from "../../config/site";

interface StepItem {
  step: string;
  title: string;
  tag: string;
  description: string;
  details: string[];
  icon: React.ElementType;
}

const WORKFLOW_STEPS: StepItem[] = [
  {
    step: "01",
    title: "Direct Request",
    tag: "Call or WhatsApp",
    description:
      "Share your issue, system symptoms, or upgrade goal directly with the technician without dealing with customer care bots.",
    details: [
      "Share device model & OS details",
      "Immediate preliminary check",
      "Doorstep or remote triage"
    ],
    icon: MessageSquareCheck,
  },
  {
    step: "02",
    title: "Diagnostics & Upfront Quote",
    tag: "Zero Hidden Costs",
    description:
      "Full hardware or software evaluation with an itemized price estimate before any repair or installation begins.",
    details: [
      "Component health review",
      "Fixed labour & part pricing in ₹",
      "Approval required before work"
    ],
    icon: FileSearch,
  },
  {
    step: "03",
    title: "Service Execution",
    tag: "Doorstep / Remote",
    description:
      "Thorough repair, thermal servicing, SSD upgrade, or clean OS deployment performed on-site or via secure remote session.",
    details: [
      "Genuine thermal pastes & clean handling",
      "Zero data loss cloning procedures",
      "Live terminal/session visibility"
    ],
    icon: Wrench,
  },
  {
    step: "04",
    title: "Post-Service QA & Handover",
    tag: "Verified Stable",
    description:
      "Stress testing, temperature benchmark checks, and driver verification before final sign-off and payment.",
    details: [
      "Thermal & load stress validation",
      "System responsiveness demo",
      "UPI / Cash / Bank transfer settlement"
    ],
    icon: ShieldCheck,
  },
];

export default function WorkflowSection() {
  return (
    <section className="relative py-16 sm:py-24 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <span>Clear Process</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How Service Delivery Works
          </h2>

          <p className="mt-3 text-base text-slate-400">
            Simple 4-step workflow designed around speed, total transparency, and verified stability.
          </p>
        </div>

        {/* 4-Step Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-slate-700/90 hover:bg-slate-850/80"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-slate-700 transition group-hover:text-cyan-400/80">
                      {item.step}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/80 text-cyan-400 transition group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <div className="mt-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                      {item.tag}
                    </span>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-white">
                      {item.title}
                    </h3>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>

                  {/* Step Details Bullet Points */}
                  <ul className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-800/80 pt-4">
                  <span className="text-[11px] font-medium text-slate-500">
                    Phase {item.step} of 04
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Consultation Callout */}
        <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 text-center backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <h4 className="text-base font-bold text-white">
              Unsure whether your desktop needs a repair or an upgrade?
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Message your current PC specifications for a quick hardware bottleneck assessment.
            </p>
          </div>

          <a
            href={SITE_CONFIG.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] sm:mt-0 shrink-0"
          >
            <span>Ask on WhatsApp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}