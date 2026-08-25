import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/common/Button";
import { PropertyCard } from "../components/property/PropertyCard";
import { ProjectCard } from "../components/project/ProjectCard";
import { ResponsiveImage, MediaPlaceholder } from "../components/common/ResponsiveImage";
import { usePageMeta } from "../hooks/usePageMeta";
import { profile, SITE } from "../config/site";
import { getFeaturedProperties } from "../services/propertyService";
import { getFeaturedProjects } from "../services/projectService";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "../utils/whatsapp";

export function HomePage() {
  usePageMeta({
    title: "Premium Property Portal",
    description: `${SITE.tagline}. Browse condominiums, landed homes, commercial and industrial properties across Kuala Lumpur and Selangor.`,
  });

  const featured = getFeaturedProperties(6);
  const featuredProjects = getFeaturedProjects(3);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__media">
          <MediaPlaceholder label="Hero background" />
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container hero__content">
          <span className="hero__eyebrow">Kuala Lumpur · Selangor</span>
          <h1 className="hero__title">
            Find a home with confidence — <em>guided</em> by expertise.
          </h1>
          <p className="hero__intro">
            I help you discover the right property — new launches, resale homes,
            and investment opportunities — with honest advice and a personal touch
            from viewing to key handover.
          </p>
          <div className="hero__actions">
            <Button to="/subsale" variant="primary" size="lg">
              Browse Properties
            </Button>
            <Button to="/projects" variant="ghost" size="lg">
              View Projects
            </Button>
            <Button
              href={buildWhatsAppUrl(generalWhatsAppMessage())}
              variant="whatsapp"
              size="lg"
            >
              Ask me a Question
            </Button>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__body">
              <p className="section-head__eyebrow u-eyebrow">Featured Listings</p>
              <h2 className="u-section-title">Featured Properties</h2>
            </div>
            <Button to="/subsale" variant="outline" className="section-head__action">
              View all <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
          <div className="property-grid">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore by type */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <div className="section-head__body">
              <p className="section-head__eyebrow u-eyebrow">Discover</p>
              <h2 className="u-section-title">Explore by Property Type</h2>
              <p className="section-head__desc">
                From serene condominiums to commercial storefronts — find the
                category that fits your goals.
              </p>
            </div>
          </div>

          <div className="explore-grid">
            <ExploreTile
              to="/subsale/residential"
              title="Residential"
              sub="Homes & condominiums"
            >
              <ResidentialNested />
            </ExploreTile>
            <ExploreTile
              to="/subsale/commercial"
              title="Commercial"
              sub="Shops, offices & more"
            />
            <ExploreTile
              to="/subsale/industrial"
              title="Industrial"
              sub="Warehouses & factories"
            />
          </div>
        </div>
      </section>

      {/* Explore by area */}
      <AreaSection />

      {/* Featured projects */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__body">
              <p className="section-head__eyebrow u-eyebrow">New Developments</p>
              <h2 className="u-section-title">Featured Projects</h2>
            </div>
            <Button to="/projects" variant="outline" className="section-head__action">
              All projects <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
          <div className="project-grid">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="section section--alt">
        <div className="container about-preview">
          <div className="about-preview__media">
            <ResponsiveImage
              src={profile.profilePhoto}
              alt={`${profile.name}, ${profile.professionalTitle}`}
              className="about-preview__img"
            />
          </div>
          <div className="about-preview__body">
            <p className="u-eyebrow">About Me</p>
            <h2 className="u-section-title">{profile.name}</h2>
            <p className="about-preview__bio">{profile.shortBio}</p>
            <div className="about-preview__meta">
              <div className="about-preview__meta-item">
                <strong>10+</strong>
                <span>Years in property</span>
              </div>
              <div className="about-preview__meta-item">
                <strong>200+</strong>
                <span>Happy clients</span>
              </div>
              <div className="about-preview__meta-item">
                <strong>KL &amp; Selangor</strong>
                <span>Coverage</span>
              </div>
            </div>
            <Button to="/about" variant="primary">
              About Me <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section">
        <div className="container">
          <div className="contact-cta">
            <p className="u-eyebrow contact-cta__eyebrow">Let&apos;s Talk</p>
            <h2 className="contact-cta__title">Ready to find your next property?</h2>
            <p className="contact-cta__text">
              Whether you&apos;re buying, selling or investing, I&apos;m here to help.
              Reach out on WhatsApp, give me a call, or send an enquiry.
            </p>
            <div className="contact-cta__actions">
              <Button
                href={buildWhatsAppUrl(generalWhatsAppMessage())}
                variant="whatsapp"
                size="lg"
              >
                WhatsApp {profile.phone}
              </Button>
              <Button to="/contact" variant="secondary" size="lg">
                Contact Form
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ExploreTile({
  to,
  title,
  sub,
  children,
}: {
  to: string;
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <Link to={to} className="explore-tile">
        <MediaPlaceholder label={title} />
        <div className="explore-tile__overlay" aria-hidden="true" />
        <div className="explore-tile__label">
          <span className="explore-tile__title">{title}</span>
          <span className="explore-tile__sub">{sub}</span>
        </div>
      </Link>
      {children}
    </div>
  );
}

function ResidentialNested() {
  return (
    <div className="explore-residential">
      <Link to="/subsale/residential/condominium" className="explore-tile">
        <MediaPlaceholder label="Condominium" />
        <div className="explore-tile__overlay" aria-hidden="true" />
        <div className="explore-tile__label">
          <span className="explore-tile__title">Condominium</span>
        </div>
      </Link>
      <Link to="/subsale/residential/landed" className="explore-tile">
        <MediaPlaceholder label="Landed" />
        <div className="explore-tile__overlay" aria-hidden="true" />
        <div className="explore-tile__label">
          <span className="explore-tile__title">Landed</span>
        </div>
      </Link>
    </div>
  );
}

function AreaSection() {
  const featuredAreas = [
    { state: "Kuala Lumpur", slug: "kuala-lumpur", name: "Mont Kiara" },
    { state: "Kuala Lumpur", slug: "kuala-lumpur", name: "KLCC" },
    { state: "Selangor", slug: "selangor", name: "Petaling Jaya" },
    { state: "Selangor", slug: "selangor", name: "Shah Alam" },
    { state: "Selangor", slug: "selangor", name: "Subang Jaya / Sunway" },
    { state: "Selangor", slug: "selangor", name: "Cheras" },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="section-head__body">
            <p className="section-head__eyebrow u-eyebrow">Locations</p>
            <h2 className="u-section-title">Explore by Area</h2>
            <p className="section-head__desc">
              Discover available listings across the areas I cover in Kuala Lumpur
              and Selangor.
            </p>
          </div>
          <Button to="/areas" variant="outline" className="section-head__action">
            All areas <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>

        <div className="area-list">
          {featuredAreas.map((a) => (
            <Link
              key={a.name}
              to={`/areas/${a.slug}/${slugify(a.name)}`}
              className="area-chip"
            >
              <span className="area-chip__name">{a.name}</span>
              <span className="area-chip__state">{a.state}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
