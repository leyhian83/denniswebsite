/**
 * Lightweight SEO helper. Sets document title and meta description for
 * a page. Designed to be replaced later by a proper SEO package.
 */
import { useEffect } from "react";
import { SITE } from "../config/site";

interface SeoMeta {
  title?: string;
  description?: string;
}

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Register page metadata; returns the page title for convenience. */
export function usePageMeta(meta: SeoMeta) {
  useEffect(() => {
    const title = meta.title ? `${meta.title} · ${SITE.name}` : SITE.name;
    document.title = title;
    if (meta.description) {
      upsertMeta("description", meta.description);
    }
    return () => {
      document.title = SITE.name;
    };
  }, [meta.title, meta.description]);
}
