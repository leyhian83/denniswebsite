import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/navigation/Header";
import { Footer } from "../components/navigation/Footer";

export function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change (manual equivalent of ScrollRestoration,
  // which requires a data router in react-router v7).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
