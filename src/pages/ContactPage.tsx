import { Link, useLocation } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "../components/contact/ContactForm";
import { usePageMeta } from "../hooks/usePageMeta";
import { profile } from "../config/site";
import { buildWhatsAppUrl, generalWhatsAppMessage, telLink } from "../utils/whatsapp";

export function ContactPage() {
  usePageMeta({
    title: "Contact",
    description: `Get in touch with ${profile.name} for property enquiries, viewing requests and valuations across Kuala Lumpur and Selangor.`,
  });

  // If arriving from a detail page with a subject, prefill the form.
  const location = useLocation();
  const prefilledSubject =
    (location.state as { subject?: string } | null)?.subject ?? "";

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>
          <p className="page-header__eyebrow u-eyebrow">Contact</p>
          <h1 className="page-header__title">Get in Touch</h1>
          <p className="page-header__desc">
            Have a question about a listing or want to arrange a viewing? Send an
            enquiry and I&apos;ll get back to you, or reach me directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-page">
          <div className="contact-page__info">
            <h2 className="u-section-title">{profile.name}</h2>
            <p className="contact-page__role">{profile.professionalTitle}</p>
            <p className="contact-page__bio">{profile.shortBio}</p>

            <ul className="contact-page__list" role="list">
              <li>
                <a href={telLink()}>
                  <Phone size={18} aria-hidden="true" /> {profile.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`}>
                  <Mail size={18} aria-hidden="true" /> {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppUrl(generalWhatsAppMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden="true" /> WhatsApp me
                </a>
              </li>
            </ul>

            <div className="contact-page__note">
              <strong>Prefer to talk?</strong>
              <span>
                Call or WhatsApp me directly — I usually respond within a few hours
                on business days.
              </span>
            </div>
          </div>

          <div className="contact-page__form">
            <h2 className="contact-page__form-title">Send an Enquiry</h2>
            <ContactForm subjectLabel={prefilledSubject || undefined} />
          </div>
        </div>
      </section>
    </>
  );
}
