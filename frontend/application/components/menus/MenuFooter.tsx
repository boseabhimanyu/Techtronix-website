import Link from "next/link";
import MenuLink from "./MenuLink";
import type { Menu } from "./menu-types";

interface MenuFooterProps {
  menu: Menu;
  isAdmin?: boolean;
}

export default function MenuFooter({ menu, isAdmin = false }: MenuFooterProps) {
  return (
    <footer className="glass-footer">
      <div className="footer-columns">
        {menu.items
          .filter((item) => item.displayStatus)
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <section key={item.id} className="footer-group">
              <h3>
                <MenuLink item={item} />
              </h3>
              <ul className="menu-list">
                {(item.children ?? [])
                  .filter((child) => child.displayStatus)
                  .sort((a, b) => a.order - b.order)
                  .map((child) => (
                    <li key={child.id}>
                      <MenuLink item={child} />
                    </li>
                  ))}
              </ul>
            </section>
          ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Techtronix</span>
        {isAdmin ? (
          <Link
            href="/dashboard"
            className="hover:text-cyan-400 transition-colors"
          >
            <span>All rights reserved.</span>
          </Link>
        ) : (
          <span>All rights reserved.</span>
        )}
      </div>
    </footer>
  );
}