import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "../components/common/Button";
import { FlaticonIcon } from "../components/common/FlaticonIcon";
import { PropertyCard } from "../components/property/PropertyCard";
import { ProjectCard } from "../components/project/ProjectCard";
import { ResponsiveImage, MediaPlaceholder } from "../components/common/ResponsiveImage";
import { usePageMeta } from "../hooks/usePageMeta";
import { profile, SITE } from "../config/site";
import { getFeaturedProperties } from "../services/propertyService";
import { getFeaturedProjects } from "../services/projectService";
import { buildWhatsAppUrl, generalWhatsAppMessage } from "../utils/whatsapp";

export function HomePage() {
  useHomeMotion();

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
          <ResponsiveImage
            src="https://picsum.photos/seed/dennis-property-hero/2400/1600"
            alt=""
            loading="eager"
            className="hero__image"
          />
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container hero__content">
          <p className="hero__kicker">Property advisory across Kuala Lumpur and Selangor</p>
          <h1 className="hero__title">
            Find a place to <em>belong</em> — with confidence.
          </h1>
          <ScrubbedCopy className="hero__intro">
            I help you make a clear, considered property decision — from the first
            viewing to the moment the keys are yours.
          </ScrubbedCopy>
          <div className="hero__actions">
            <Button to="/subsale" variant="primary" size="lg">
              Browse Properties
            </Button>
          <Button
            href={buildWhatsAppUrl(generalWhatsAppMessage())}
            variant="whatsapp"
            size="lg"
            icon={<MessageCircle size={18} aria-hidden="true" />}
          >
            WhatsApp me
          </Button>
          </div>
          <p className="hero__footnote">Independent guidance · New launches · Subsale · Investment</p>
        </div>
      </section>

      {/* Advisory story */}
      <section className="section home-story">
        <div className="container">
          <div className="story-intro motion-reveal">
            <div>
              <p className="u-eyebrow">A clearer way forward</p>
              <h2 className="u-section-title">Property decisions deserve more than a listing.</h2>
            </div>
            <p className="story-intro__copy">
              Good advice makes the search feel lighter. I bring the market context,
              local knowledge and calm attention needed to move with certainty.
            </p>
          </div>

          <div className="home-bento">
            <article className="home-bento__feature motion-reveal">
              <p className="u-eyebrow">Personal, precise, practical</p>
              <h3>From “maybe” to a decision you feel good about.</h3>
              <p>
                Every conversation is shaped around your priorities, not a generic
                checklist. We narrow the field, pressure-test the details and make
                the next step clear.
              </p>
              <Link to="/about" className="text-link">
                Meet Dennis <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <Link to="/areas" className="home-bento__image motion-reveal">
              <ResponsiveImage
                src="https://picsum.photos/seed/klcc-skyline/1400/1100"
                alt="City skyline at dusk"
              />
              <span>Know the neighbourhood, not just the postcode <ArrowRight size={17} aria-hidden="true" /></span>
            </Link>

            <div className="home-bento__rail motion-reveal">
              <p className="u-eyebrow">How I help</p>
              <div className="advisory-accordion" aria-label="Property advisory services">
                <AccordionItem icon="buy" title="Buy with clarity" copy="Compare the right homes, costs and trade-offs." />
                <AccordionItem icon="sell" title="Sell with confidence" copy="Position your property with a considered plan." />
                <AccordionItem icon="invest" title="Invest with context" copy="Look beyond the headline to the fundamentals." />
              </div>
            </div>
          </div>

          <GuidanceCarousel />
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
      <section className="section section--alt explore-section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__body">
              <p className="section-head__eyebrow u-eyebrow">Discover</p>
              <h2 className="u-section-title">
                Explore by <span>Property Type</span>
              </h2>
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
                <strong>KLCC</strong>
                <span>Prime project focus</span>
              </div>
              <div className="about-preview__meta-item">
                <strong>Setia Alam</strong>
                <span>Core market</span>
              </div>
              <div className="about-preview__meta-item">
                <strong>Setia Eco Park</strong>
                <span>Core market</span>
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
  children?: ReactNode;
}) {
  return (
    <div className={`explore-card${children ? " explore-card--nested" : ""}`}>
      <Link to={to} className="explore-tile">
        <MediaPlaceholder label={title} />
        <div className="explore-tile__overlay" aria-hidden="true" />
        <div className="explore-tile__label">
          <span className="explore-tile__title">{title}</span>
          <span className="explore-tile__sub">{sub}</span>
        </div>
        <span className="explore-tile__arrow" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </Link>
      {children}
    </div>
  );
}

const SERVICE_ICONS = {
  buy: "https://cdn-icons-png.flaticon.com/512/7000/7000070.png",
  sell: "https://cdn-icons-png.flaticon.com/512/12868/12868091.png",
  invest: "https://cdn-icons-png.flaticon.com/512/18093/18093374.png",
} as const;

function AccordionItem({
  title,
  copy,
  icon,
}: {
  title: string;
  copy: string;
  icon: keyof typeof SERVICE_ICONS;
}) {
  return (
    <div className="advisory-accordion__item" tabIndex={0}>
      <FlaticonIcon src={SERVICE_ICONS[icon]} label={title} className="advisory-accordion__icon" />
      <strong>{title}</strong>
      <span>{copy}</span>
      <ArrowRight size={17} aria-hidden="true" />
    </div>
  );
}

const GUIDANCE_SLIDES = [
  {
    title: "The right home is personal.",
    copy: "Start with how you want to live, then let the shortlist follow.",
  },
  {
    title: "The right price has context.",
    copy: "A confident offer comes from knowing the market and the details.",
  },
  {
    title: "The right move feels clear.",
    copy: "You should know what happens next at every point in the journey.",
  },
];

function GuidanceCarousel() {
  const [active, setActive] = useState(0);
  const slide = GUIDANCE_SLIDES[active];

  const move = (direction: number) => {
    setActive((current) => (current + direction + GUIDANCE_SLIDES.length) % GUIDANCE_SLIDES.length);
  };

  return (
    <div className="guidance-carousel motion-reveal">
      <div className="guidance-carousel__portrait">
        <ResponsiveImage
          src={profile.profilePhoto}
          alt={`${profile.name}, property advisor`}
        />
      </div>
      <div className="guidance-carousel__content">
        <p className="u-eyebrow">A thoughtful process</p>
        <blockquote>{slide.title}</blockquote>
        <p>{slide.copy}</p>
        <div className="guidance-carousel__controls">
          <span>{String(active + 1).padStart(2, "0")} / {String(GUIDANCE_SLIDES.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => move(-1)} aria-label="Previous guidance point">
            <ArrowRight size={18} className="is-previous" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next guidance point">
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrubbedCopy({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p className={className}>
      {children.split(/\s+/).map((word, index) => (
        <span className="scrub-word" key={`${word}-${index}`}>
          {word}{index < children.split(/\s+/).length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

function useHomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".motion-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.fromTo(
        ".scrub-word",
        { opacity: 0.32 },
        {
          opacity: 1,
          stagger: 0.06,
          scrollTrigger: {
            trigger: ".hero__intro",
            start: "top 86%",
            end: "bottom 62%",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        ".hero__media img",
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        },
      );
    });

    return () => context.revert();
  }, []);
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
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
      <Link to="/subsale/residential/landed" className="explore-tile">
        <MediaPlaceholder label="Landed" />
        <div className="explore-tile__overlay" aria-hidden="true" />
        <div className="explore-tile__label">
          <span className="explore-tile__title">Landed</span>
        </div>
        <ArrowRight size={14} aria-hidden="true" />
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
