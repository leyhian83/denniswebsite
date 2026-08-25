import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SITE } from "./config/site";
import { Layout } from "./layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { PropertyListingPage } from "./pages/PropertyListingPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { AreasPage } from "./pages/AreasPage";
import { AreaDetailPage } from "./pages/AreaDetailPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter basename={SITE.basePath}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />

          {/* Subsale category / type listing */}
          <Route path="subsale" element={<PropertyListingPage />} />
          <Route
            path="subsale/:categorySeg"
            element={<PropertyListingPage />}
          />
          <Route
            path="subsale/:categorySeg/:typeSeg"
            element={<PropertyListingPage />}
          />

          {/* Property detail */}
          <Route path="properties/:slug" element={<PropertyDetailPage />} />

          {/* Projects */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/residential" element={<ProjectsPage />} />
          <Route path="projects/commercial" element={<ProjectsPage />} />
          <Route path="projects/industrial" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />

          {/* Areas */}
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/:stateSlug" element={<AreasPage />} />
          <Route path="areas/:stateSlug/:areaSlug" element={<AreaDetailPage />} />

          {/* Contact */}
          <Route path="contact" element={<ContactPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
