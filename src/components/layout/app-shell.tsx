"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings2 } from "lucide-react";
import { cn, titleCase } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="wg-header text-white sticky top-0 z-50 shadow-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.25rem]">
            <div>
              <h1 className="font-display text-xl font-normal tracking-wide leading-none">
                KYR Metrics Dashboard
              </h1>
              <p className="font-body text-[11px] text-wg-muted mt-1">
                Weidert Group · Know Your Role
              </p>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all",
                      active
                        ? "bg-wg-orange text-white"
                        : "text-wg-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-wg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-wg-suede text-wg-muted py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="font-display text-white/90 text-sm tracking-widest">
            Weidert Group
          </span>
          <span>Internal Use Only · KYR Performance Tracking</span>
        </div>
      </footer>
    </div>
  );
}
