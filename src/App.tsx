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
import { LoginPage } from "./pages/LoginPage";
import { AddProjectPage } from "./pages/AddProjectPage";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter basename={SITE.basePath}>
      <Routes>
        {/* Standalone admin login (no site chrome) */}
        <Route path="login" element={<LoginPage />} />

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
          <Route path="projects/residential/:projectType" element={<ProjectsPage />} />
          <Route path="projects/commercial" element={<ProjectsPage />} />
          <Route path="projects/industrial" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />

          {/* Areas */}
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/:stateSlug" element={<AreasPage />} />
          <Route path="areas/:stateSlug/:areaSlug" element={<AreaDetailPage />} />

          {/* Contact */}
          <Route path="contact" element={<ContactPage />} />

          {/* Admin — add new projects (login required) */}
          <Route
            path="admin/add-project"
            element={
              <ProtectedRoute>
                <AddProjectPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
