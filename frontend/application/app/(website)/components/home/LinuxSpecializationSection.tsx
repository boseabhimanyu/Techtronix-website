import { Terminal, Shield, Laptop, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "../../config/site";

interface Distro {
  name: string;
  family: "Debian" | "RedHat" | "Independent";
  badge: string;
  useCase: string;
}

const SUPPORTED_DISTROS: Distro[] = [
  { name: "Debian", family: "Debian", badge: "Rock Solid", useCase: "Workstations & Home Servers" },
  { name: "Ubuntu / Mint", family: "Debian", badge: "Daily Driver", useCase: "General Desktop & Development" },
  { name: "Red Hat Enterprise (RHEL)", family: "RedHat", badge: "Enterprise", useCase: "Sysadmin & Lab Stacks" },
  { name: "Rocky Linux / Alma", family: "RedHat", badge: "CentOS Successor", useCase: "Production Dev Environments" },
  { name: "Fedora Workstation", family: "RedHat", badge: "Cutting Edge", useCase: "Modern GNOME & Kernel Features" },
  { name: "Arch Linux", family: "Independent", badge: "Power User", useCase: "Minimal & Custom Setups" },
];

export default function LinuxSpecializationSection() {
  return (
    <section className="relative py-16 sm:py-24 border-t border-slate-800/80 overflow-hidden">
      {/* Subtle Radial Glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Terminal className="h-3.5 w-3.5" />
            <span>Core Competency</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Linux & Dual-Boot Specialization
          </h2>

          <p className="mt-3 text-base text-slate-400">
            Beyond standard Windows installs. Clean, stable, and secure Unix/Linux environments 
            tailored for engineers, students, and businesses.
          </p>
        </div>

        {/* 3 Value Proposition Pillars */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Safe Dual-Booting</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Zero risk of wiping existing Windows drives. Expert manual partitioning, independent EFI 
              system partitions, and GRUB configuration that survives Windows Update cycles.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-cyan-400">
              <Laptop className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Developer Stacks Ready</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Out-of-the-box workstation configuration: Docker engine, KVM virtualization, proprietary 
              NVIDIA drivers, zsh/bash dotfiles, and VS Code toolchains.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">1-on-1 CLI & Admin Mentoring</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Hands-on remote or in-person sessions covering package managers (apt, dnf), systemd 
              services, permissions, SSH hardening, and terminal fundamentals.
            </p>
          </div>
        </div>

        {/* Supported Ecosystem Badges */}
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950/40 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h4 className="text-base font-bold text-white">Supported Linux Distributions</h4>
              <p className="text-xs text-slate-400 mt-0.5">Custom configurations for desktops, laptops, and home labs.</p>
            </div>
            <a
              href={SITE_CONFIG.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              <span>Consult on custom distro</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORTED_DISTROS.map((d) => (
              <div 
                key={d.name}
                className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{d.name}</span>
                    <span className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                      {d.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{d.useCase}</span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}