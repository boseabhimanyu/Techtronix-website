import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Determine current pathname using headers to check route protection
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("referer") || "";

  // Define routes that require admin privileges
  const adminOnlyRoutes = [
    "/dashboard/enquiry",
    "/dashboard/customers", 
    "/dashboard/pages", 
    "/dashboard/settings", 
    "/dashboard/menus"
  ];

  // If the user is trying to access an admin route but is not an admin, redirect them
  const isAdmin = user.role?.toLowerCase() === "admin";
  const isTryingAccessAdminRoute = adminOnlyRoutes.some((route) => pathname.includes(route));

  if (isTryingAccessAdminRoute && !isAdmin) {
    redirect("/dashboard");
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="min-h-screen">
      <header className="glass-strong sticky top-4 z-40 mx-4 rounded-2xl sm:mx-6 lg:mx-8">
        <div className="relative flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: Mobile Toggle & User Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Native CSS dropdown toggle for mobile (< lg) */}
            <details className="relative lg:hidden">
              <summary
                aria-label="Toggle navigation menu"
                className="glass flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl text-zinc-700 transition-colors hover:bg-white/60 hover:text-zinc-900 [&::-webkit-details-marker]:hidden"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </summary>

              {/* Mobile Popover Menu */}
              <div className="glass-strong absolute left-0 top-12 z-50 w-64 rounded-2xl p-3 shadow-xl backdrop-blur-xl border border-white/20">
                <nav className="space-y-1">
                  <Link
                    href="/"
                    className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Frontpage
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Dashboard
                  </Link>

                  <div className="ml-2 space-y-1 pl-2 border-l border-zinc-300/40">
                    <Link
                      href="/dashboard/profile"
                      className="block rounded-xl px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-white/50 hover:text-zinc-900"
                    >
                      My profile
                    </Link>
                    <Link
                      href="/dashboard/security"
                      className="block rounded-xl px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-white/50 hover:text-zinc-900"
                    >
                      Security
                    </Link>
                  </div>

                  {isAdmin && (
                    <>
                      <Link
                        href="/dashboard/enquiry"
                        className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                      >
                        Enquiries
                      </Link>
                      <Link
                        href="/dashboard/customers"
                        className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                      >
                        Customers
                      </Link>
                      <Link
                        href="/dashboard/pages"
                        className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                      >
                        Pages
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/dashboard/menus"
                        className="block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                      >
                        Menu Settings
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </details>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {fullName || user.username}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>

          {/* Center: Brand / Logo link to frontpage */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-shadow" />
              <span className="text-base sm:text-lg font-bold tracking-tight font-mono text-slate-800 dark:text-slate-100 group-hover:text-cyan-500 transition-colors">
                Techtronix
              </span>
            </Link>
          </div>

          {/* Right: Logout Action */}
          <div className="flex items-center shrink-0">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-2rem)] gap-4 p-4 sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
        {/* Desktop Sidebar */}
        <aside className="glass hidden w-60 shrink-0 rounded-2xl lg:block">
          <nav className="p-3">
            <div className="space-y-1">
              <Link
                href="/"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
              >
                Frontpage
              </Link>
              <Link
                href="/dashboard"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
              >
                Dashboard
              </Link>

              <div className="ml-3 space-y-1 pl-3">
                <Link
                  href="/dashboard/profile"
                  className="block rounded-xl px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-white/50 hover:text-zinc-900"
                >
                  My profile
                </Link>

                <Link
                  href="/dashboard/security"
                  className="block rounded-xl px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-white/50 hover:text-zinc-900"
                >
                  Security
                </Link>
              </div>

              {isAdmin && (
                <>
                  <Link
                    href="/dashboard/enquiry"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Enquiries
                  </Link>
                  <Link
                    href="/dashboard/customers"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Customers
                  </Link>
                  <Link
                    href="/dashboard/pages"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Pages
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/dashboard/menus"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/50"
                  >
                    Menu Settings
                  </Link>
                </>
              )}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}