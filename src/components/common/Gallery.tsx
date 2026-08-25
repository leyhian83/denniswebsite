import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { ResponsiveImage } from "../common/ResponsiveImage";

interface GalleryProps {
  photos: string[];
  altTitle: string;
}

/** Photo gallery with thumbnail navigation and a full-view lightbox. */
export function Gallery({ photos, altTitle }: GalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = photos.length;
  const current = photos[active] ?? "";

  const prev = useCallback(() => {
    setActive((i) => (count <= 0 ? 0 : (i - 1 + count) % count));
  }, [count]);

  const next = useCallback(() => {
    setActive((i) => (count <= 0 ? 0 : (i + 1) % count));
  }, [count]);

  // Keyboard navigation inside the lightbox.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (count === 0) {
    return <ResponsiveImage src="" alt={`${altTitle} — awaiting photos`} />;
  }

  return (
    <div className="gallery">
      <button
        type="button"
        className="gallery__main"
        onClick={() => setLightbox(true)}
        aria-label="Open photo in full view"
      >
        <ResponsiveImage
          src={current}
          alt={`${altTitle} — photo ${active + 1} of ${count}`}
          className="gallery__main-img"
        />
        <span className="gallery__expand" aria-hidden="true">
          <Expand size={18} />
        </span>
      </button>

      {count > 1 && (
        <div className="gallery__thumbs" role="group" aria-label="Select a photo">
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`gallery__thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
            >
              <ResponsiveImage src={p} alt="" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Full image view"
        >
          <div className="gallery__lightbox-top">
            <span className="gallery__lightbox-count">
              {active + 1} / {count}
            </span>
            <button
              type="button"
              className="gallery__lightbox-btn"
              onClick={() => setLightbox(false)}
              aria-label="Close full view"
            >
              <X size={26} />
            </button>
          </div>

          <div className="gallery__lightbox-stage">
            {count > 1 && (
              <button
                type="button"
                className="gallery__lightbox-nav gallery__lightbox-nav--prev"
                onClick={prev}
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            <ResponsiveImage
              src={current}
              alt={`${altTitle} — photo ${active + 1}`}
              className="gallery__lightbox-img"
            />
            {count > 1 && (
              <button
                type="button"
                className="gallery__lightbox-nav gallery__lightbox-nav--next"
                onClick={next}
                aria-label="Next photo"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
