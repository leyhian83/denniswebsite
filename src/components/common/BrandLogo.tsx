import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function BrandMark({ title, ...props }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M18 82V14h27c18 0 30 10 30 25S63 64 45 64H34"
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="8"
      />
      <path
        d="M34 14v68"
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth="8"
      />
      <path
        d="M48 28 29 41v35l19-12z"
        fill="var(--brand-logo-gold, #c9974a)"
      />
      <path
        d="m48 28 19 13v35L48 64z"
        fill="var(--brand-logo-gold-deep, #a97931)"
      />
      <path
        d="M48 28v36"
        fill="none"
        stroke="var(--brand-logo-ivory, #f5f1e9)"
        strokeWidth="2"
      />
      <path
        d="M26 82h44"
        fill="none"
        stroke="var(--brand-logo-gold, #c9974a)"
        strokeWidth="4"
      />
    </svg>
  );
}

type BrandLogoProps = {
  className?: string;
  showTagline?: boolean;
  compact?: boolean;
};

export function BrandLogo({
  className = "",
  showTagline = false,
  compact = false,
}: BrandLogoProps) {
  return (
    <span className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${className}`}>
      <BrandMark className="brand-logo__mark" title="Dennis Property mark" />
      <span className="brand-logo__lockup">
        <span className="brand-logo__name">Dennis</span>
        <span className="brand-logo__rule" aria-hidden="true" />
        <span className="brand-logo__descriptor">Property</span>
        {showTagline ? (
          <span className="brand-logo__tagline">Premium property advisory across Malaysia</span>
        ) : null}
      </span>
    </span>
  );
}
