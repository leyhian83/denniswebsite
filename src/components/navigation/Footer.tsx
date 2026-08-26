import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { SITE, profile } from "../../config/site";
import {
  buildWhatsAppUrl,
  generalWhatsAppMessage,
  telLink,
} from "../../utils/whatsapp";
import { BrandLogo } from "../common/BrandLogo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__brand">
            <BrandLogo compact />
          </Link>
          <p className="footer__tagline">{SITE.tagline}</p>
          <p className="footer__ren">
            {profile.company} · {profile.renNumber}
          </p>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h3 className="footer__title">Explore</h3>
          <ul className="footer__list" role="list">
            <li><Link to="/subsale">Subsale Properties</Link></li>
            <li><Link to="/projects">New Projects</Link></li>
            <li><Link to="/areas">Areas</Link></li>
            <li><Link to="/about">About Me</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div className="footer__col">
          <h3 className="footer__title">Contact</h3>
          <ul className="footer__list footer__list--contact" role="list">
            <li>
              <a href={telLink()}>
                <Phone size={16} aria-hidden="true" /> {profile.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${profile.email}`}>
                <Mail size={16} aria-hidden="true" /> {profile.email}
              </a>
            </li>
            <li>
              <a
                href={buildWhatsAppUrl(generalWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp me
              </a>
            </li>
          </ul>
          <Link to="/login" className="btn btn--outline btn--sm footer__admin-button">
            Admin
          </Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </span>
        <span>
          <span className="footer__note">
            Prototype site — sample data shown for demonstration only.
          </span>
        </span>
      </div>
    </footer>
  );
}
