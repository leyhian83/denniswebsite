import { Button } from "../components/common/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFoundPage() {
  usePageMeta({ title: "Page Not Found" });

  return (
    <section className="notfound">
      <div className="container notfound__inner">
        <p className="u-eyebrow">Error 404</p>
        <h1 className="notfound__title">Page not found</h1>
        <p className="notfound__text">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="notfound__actions">
          <Button to="/" variant="primary" size="lg">Back to Home</Button>
          <Button to="/subsale" variant="outline" size="lg">Browse Properties</Button>
        </div>
      </div>
    </section>
  );
}
