import { MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../../config/site";
import { buildWhatsAppUrl, telLink } from "../../utils/whatsapp";

interface EnquiryCardProps {
  /** Heading of the item being enquired about. */
  title: string;
  /** Wa.app message tailored to property or project. */
  whatsappMessage: string;
  /** Optional extra rows shown above the CTA (e.g. price). */
  children?: React.ReactNode;
}

/** Sticky / prominent WhatsApp + Call + Enquire box used on detail pages. */
export function EnquiryCard({ title, whatsappMessage, children }: EnquiryCardProps) {
  return (
    <aside className="enquiry-card">
      {children && <div className="enquiry-card__content">{children}</div>}

      <h3 className="enquiry-card__title">Interested in this?</h3>
      <p className="enquiry-card__agent">
        {profile.name} · {profile.company}
      </p>

      <div className="enquiry-card__actions">
        <a
          className="btn btn--whatsapp enquiry-card__whatsapp"
          href={buildWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp
        </a>
        <a className="btn btn--outline" href={telLink()}>
          <Phone size={18} aria-hidden="true" /> Call
        </a>
        <Link className="btn btn--primary" to={`/contact`} state={{ subject: title }}>
          Enquire
        </Link>
      </div>

      <p className="enquiry-card__note">
        Prefer to talk? Call {profile.phone} or send me a message on WhatsApp.
      </p>
    </aside>
  );
}
