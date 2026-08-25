import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle, MapPin } from "lucide-react";
import { SITE, profile } from "../../config/site";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "../../utils/whatsapp";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Me" },
  { to: "/subsale", label: "Subsale" },
  { to: "/projects", label: "Projects" },
  { to: "/areas", label: "Areas" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="header">
      <nav className="header__inner container" aria-label="Primary">
        <Link to="/" className="header__brand" aria-label={`${SITE.name} home`}>
          <span className="header__brand-mark" aria-hidden="true">
            <MapPin size={18} strokeWidth={2.2} />
          </span>
          <span className="header__brand-text">
            <span className="header__brand-name">{SITE.name}</span>
            <span className="header__brand-tag">{SITE.tagline}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="header__links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="header__actions">
          <a
            className="btn btn--whatsapp btn--sm header__whatsapp"
            href={buildWhatsAppUrl(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} />
            <span className="header__cta-text">Enquire</span>
          </a>
          <button
            type="button"
            className="header__menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <ul className="mobile-menu__list" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mobile-menu__link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mobile-menu__footer">
          <a
            className="btn btn--whatsapp btn--lg mobile-menu__cta"
            href={buildWhatsAppUrl(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} /> WhatsApp {profile.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
