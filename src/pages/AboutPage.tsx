import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Award } from "lucide-react";
import { Button } from "../components/common/Button";
import { ResponsiveImage } from "../components/common/ResponsiveImage";
import { usePageMeta } from "../hooks/usePageMeta";
import { profile } from "../config/site";
import { buildWhatsAppUrl, generalWhatsAppMessage, telLink } from "../utils/whatsapp";

export function AboutPage() {
  usePageMeta({
    title: `About ${profile.name}`,
    description: `Learn about ${profile.name}, ${profile.professionalTitle}, and how they help buyers and investors across Malaysia.`,
  });

  const stats = [
    { value: "10+", label: "Years in property" },
    { value: "200+", label: "Happy clients" },
    { value: "RM 150M+", label: "Sales through my desk" },
    { value: "KL & Selangor", label: "Areas covered" },
  ];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About Me</span>
          </nav>
          <p className="page-header__eyebrow u-eyebrow">About</p>
          <h1 className="page-header__title">About Me</h1>
          <p className="page-header__desc">{profile.shortBio}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-page">
          <div className="about-page__media">
            <ResponsiveImage
              src={profile.profilePhoto}
              alt={`${profile.name}, ${profile.professionalTitle}`}
            />
            <div className="about-page__credentials">
              <p><Award size={15} aria-hidden="true" /> {profile.renNumber}</p>
              {profile.company && <p><BuildingIcon /> {profile.company}</p>}
            </div>
          </div>

          <div className="about-page__body">
            <h2 className="u-section-title">{profile.name}</h2>
            <p className="about-page__role">{profile.professionalTitle}</p>
            <p className="about-page__bio">{profile.longBio}</p>

            <ul className="about-page__stats" role="list">
              {stats.map((s) => (
                <li key={s.label} className="about-page__stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>

            <div className="about-page__contact">
              <Button to="/contact" variant="primary" size="lg">
                Get in touch
              </Button>
              <Button
                href={buildWhatsAppUrl(generalWhatsAppMessage())}
                variant="whatsapp"
                size="lg"
              >
                WhatsApp me
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow u-eyebrow">Contact</p>
              <h2 className="u-section-title">Ways to reach me</h2>
            </div>
          </div>
          <div className="contact-cards">
            <a className="contact-card" href={telLink()}>
              <Phone size={22} aria-hidden="true" />
              <span className="contact-card__label">Call</span>
              <span className="contact-card__value">{profile.phone}</span>
            </a>
            <a className="contact-card" href={`mailto:${profile.email}`}>
              <Mail size={22} aria-hidden="true" />
              <span className="contact-card__label">Email</span>
              <span className="contact-card__value">{profile.email}</span>
            </a>
            <div className="contact-card">
              <MapPin size={22} aria-hidden="true" />
              <span className="contact-card__label">Based in</span>
              <span className="contact-card__value">Kuala Lumpur &amp; Selangor</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}
