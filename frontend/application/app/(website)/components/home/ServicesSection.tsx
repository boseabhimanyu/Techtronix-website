import Link from "next/link";
import { 
  Wrench, 
  Terminal, 
  Cpu, 
  Wifi, 
  ArrowRight, 
  Check, 
  Sparkles 
} from "lucide-react";

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
  startingPrice: string;
  deliverables: string[];
  ctaText: string;
  ctaHref: string;
}

const SERVICES: ServiceCardProps[] = [
  {
    icon: Wrench,
    title: "Hardware Repairs & Deep Service",
    badge: "Doorstep Available",
    description: "Thorough physical maintenance to prevent overheating, thermal throttling, and hardware burnout.",
    startingPrice: "₹499",
    deliverables: [
      "Complete interior dust extraction & fan cleaning",
      "Thermal paste replacement (CPU & GPU)",
      "Power supply (SMPS) & component diagnostics",
      "Cable management & airflow optimization"
    ],
    ctaText: "Book Service",
    ctaHref: "/contact?service=hardware",
  },
  {
    icon: Cpu,
    title: "Hardware Upgrades & Speed Boost",
    badge: "Instant 5x Speed",
    description: "Upgrade aging desktops to modern performance standards without buying an entirely new PC.",
    startingPrice: "₹299 + Part Cost",
    deliverables: [
      "SSD upgrade with zero data loss cloning",
      "RAM expansion & dual-channel setup",
      "Compatibility verification & bottleneck check",
      "Drive health & speed benchmarking"
    ],
    ctaText: "Check Compatibility",
    ctaHref: "/contact?service=upgrade",
  },
  {
    icon: Terminal,
    title: "OS Setup & Linux Systems",
    badge: "Debian & RHEL",
    description: "Clean installations, dual-boot setups, and tailored workstation environments for developers and office use.",
    startingPrice: "₹599",
    deliverables: [
      "Clean Windows & Linux distro installation",
      "Debian, Ubuntu, Fedora & RedHat ecosystems",
      "Driver configuration & essential utility setup",
      "Dual-boot configuration without partition errors"
    ],
    ctaText: "Request Setup",
    ctaHref: "/contact?service=os-install",
  },
  {
    icon: Wifi,
    title: "Remote Troubleshooting & Training",
    badge: "AnyDesk / Quick",
    description: "Instant remote assistance for software issues, plus 1-on-1 practical Linux command line training.",
    startingPrice: "₹399 / session",
    deliverables: [
      "Remote malware/adware & system error cleanup",
      "Application installation & troubleshooting",
      "Hands-on Linux CLI & system basics training",
      "Secure remote access (AnyDesk / TeamViewer)"
    ],
    ctaText: "Start Remote Session",
    ctaHref: "/contact?service=remote",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative py-16 sm:py-24 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Scope of Work</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Specialized Computer Services
          </h2>

          <p className="mt-3 text-base text-slate-400">
            Transparent pricing, no hidden costs. Work handled directly by an experienced hardware and systems technician.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition hover:border-slate-700/90 hover:bg-slate-850/80"
              >
                <div>
                  {/* Top Header: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/80 text-cyan-400 transition group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/30">
                      <Icon className="h-6 w-6" />
                    </div>

                    {service.badge && (
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {service.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <ul className="mt-5 space-y-2.5 border-t border-slate-800/80 pt-5 text-xs text-slate-300">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-cyan-400 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Pricing & CTA */}
                <div className="mt-6 border-t border-slate-800/80 pt-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Starts from
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {service.startingPrice}
                    </span>
                  </div>

                  <Link
                    href={service.ctaHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-300 active:scale-[0.98]"
                  >
                    <span>{service.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}