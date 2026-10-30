import Link from "next/link";
import { ArrowRight, PhoneCall, ShieldCheck, CheckCircle2, Terminal, Cpu } from "lucide-react";
import { SITE_CONFIG } from "./config/site";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      {/* Cyan Specular Radial Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.14),transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Service Delivery Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Doorstep & Remote Computer Support</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            Expert Desktop Repairs, Upgrades &{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Linux Systems
            </span>
          </h1>

          {/* Realistic, Direct Value Proposition */}
          <p className="mt-5 text-base text-slate-300 sm:text-lg sm:leading-relaxed">
            Professional computer care handled directly by a dedicated specialist.
            From SSD/RAM upgrades and thermal deep-cleaning to Windows/Linux setups
            and remote troubleshooting starting from{" "}
            <span className="font-semibold text-white">
              {SITE_CONFIG.business.formattedStartingRate}
            </span>.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={SITE_CONFIG.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
            >
              Book Service on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
            >
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              {SITE_CONFIG.contact.phone}
            </a>
          </div>

          {/* Authentic Core Competencies */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Doorstep Servicing</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Debian & RHEL Linux Systems</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-teal-400" />
              <span>SSD & RAM Speed Boosts</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Direct 1-on-1 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}