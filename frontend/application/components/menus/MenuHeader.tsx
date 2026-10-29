"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import MenuLink from "./MenuLink";
import type { Menu, MenuItem } from "./menu-types";

function HeaderItems({ items }: { items: MenuItem[] }) {
  return (
    <ul className="menu-list">
      {items
        .filter((item) => item.displayStatus)
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          const children = (item.children ?? [])
            .filter((child) => child.displayStatus)
            .sort((a, b) => a.order - b.order);

          return (
            <li key={item.id} className={children.length ? "has-children" : ""}>
              <MenuLink item={item} />
              {children.length > 0 && (
                <>
                
                <div className="header-dropdown">
                  <HeaderItems items={children} />
                </div>
                </>
              )}
            </li>
          );
        })}
    </ul>
  );
}

export default function MenuHeader({ menu }: { menu: Menu }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-header">
      {/* ================= TIER 1: CTA (LEFT) | LOGO (CENTER) | CTA (RIGHT) ================= */}
      <div className="header-top-bar">
        {/* Left CTA: Phone Dispatch / Status */}
        <div className="header-cta-left">
          <a href="tel:+18005550199" className="header-cta-call">
            <span className="live-indicator" />
            <span className="cta-call-text">
              <span className="cta-sub">Emergency IT Dispatch</span>
              <span className="cta-main">(800) 555-0199</span>
            </span>
          </a>
        </div>

        {/* Center: Square Logo with dedicated height */}
        <div className="header-logo-center">
          <Link href="/" className="brand-logo-wrapper" aria-label="Techtronix Home">
            <Image
              src="/logo.png"
              alt="Techtronix Logo"
              width={76}
              height={76}
              priority
              className="brand-logo-img"
            />
          </Link>
        </div>

        {/* Right CTA: Booking / Action Button + Mobile Toggle */}
        <div className="header-cta-right">
          <Link href="/#contact" className="header-book-btn">
            Book Repair
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            className="mobile-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ================= TIER 2: CENTERED DYNAMIC NAV ITEMS ================= */}
      <nav
        aria-label={menu?.name || "Main Navigation"}
        className={`top-nav ${open ? "open" : ""}`}
      >
        <HeaderItems items={menu?.items ?? []} />
      </nav>
    </header>
  );
}