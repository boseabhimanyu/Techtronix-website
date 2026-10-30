import { MapPin, Globe, Clock, Check, ArrowRight, ShieldAlert, Monitor } from "lucide-react";
import { SITE_CONFIG } from "../../config/site";

export default function CoverageSection() {
  return (
    <section className="relative py-16 sm:py-24 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>Service Availability</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Service Modes & Coverage Areas
          </h2>

          <p className="mt-3 text-base text-slate-400">
            Whether you need on-site hardware maintenance at your door or instant remote software support across India.
          </p>
        </div>

        {/* 2-Column Split: Doorstep vs Remote */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          
          {/* Card 1: Doorstep Visits */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Local On-Site
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">
                Doorstep Computer Service
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Direct technician visit for tasks that require physical handling: thermal repasting, 
                deep dust cleaning, hardware diagnostic tests, and component replacements.
              </p>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Visit Windows: </span>
                    <span className="text-slate-400">Mon – Sat, 10:00 AM – 7:00 PM IST</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Primary Coverage: </span>
                    <span className="text-slate-400">City & Select Outer Suburbs (Confirm PIN code)</span>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Work executed in front of you (full hardware transparency)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Tools, thermal compound, and test gear brought on-site</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Nominal inspection charge adjustable against approved repairs</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800">
              <a
                href={SITE_CONFIG.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                <span>Check Your PIN Code on WhatsApp</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Remote Support */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-teal-400">
                  <Monitor className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-teal-500/30 bg-teal-950/50 px-3 py-1 text-xs font-semibold text-teal-300">
                  PAN-India Remote
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">
                Remote Diagnosis & Linux Mentoring
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Fast resolution for OS-level issues, application crashes, malware scans, 
                and structured 1-on-1 terminal training anywhere in India.
              </p>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Globe className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Availability: </span>
                    <span className="text-slate-400">All States & Union Territories (India)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">Access Tools: </span>
                    <span className="text-slate-400">Encrypted AnyDesk / TeamViewer / SSH sessions</span>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Immediate dispatch (no travel wait time)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>You monitor the active session on your display</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>UPI payment settled only upon successful problem resolution</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-800">
              <a
                href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
              >
                <span>Call for Remote Quick Connect</span>
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}