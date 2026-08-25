/**
 * Responsive <img> with graceful fallback.
 * Since prototype media paths may not exist yet, broken images render a
 * neutral branded placeholder instead of a broken icon.
 */
import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/** Neutral branded placeholder rendered when an image is missing. */
export function MediaPlaceholder({ label }: { label?: string }) {
  return (
    <div
      className="media-placeholder"
      role="img"
      aria-label={label ? `${label} (image coming soon)` : "Image placeholder"}
    >
      <svg
        viewBox="0 0 400 300"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="400" height="300" fill="#e7e3db" />
        <g fill="none" stroke="#b9b2a6" strokeWidth="2">
          <rect x="150" y="90" width="100" height="84" rx="4" />
          <path d="M150 150l30-24 26 20 28-22 46 38" fill="#d9d3c7" stroke="#b9b2a6" />
        </g>
        <circle cx="200" cy="118" r="7" fill="#cfc9bd" />
      </svg>
    </div>
  );
}

export function ResponsiveImage({
  src,
  alt,
  className,
  loading = "lazy",
}: ResponsiveImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <MediaPlaceholder label={alt} />;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
    />
  );
}
