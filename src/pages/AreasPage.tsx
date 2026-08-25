import { Link, useParams } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { getAllAreasFlat, getAllStateGroups, getStateGroupBySlug } from "../services/areaService";
import { countPropertiesForArea } from "../services/propertyService";

export function AreasPage() {
  const { stateSlug } = useParams<{ stateSlug?: string }>();
  const focused = stateSlug ? getStateGroupBySlug(stateSlug) : undefined;

  usePageMeta(
    focused
      ? {
          title: `${focused.state} Areas`,
          description: `Discover properties across ${focused.state} by area.`,
        }
      : {
          title: "Explore Areas",
          description:
            "Discover properties across Kuala Lumpur and Selangor by area — from Mont Kiara and KLCC to Petaling Jaya and Shah Alam.",
        },
  );

  const states = focused ? [focused] : getAllStateGroups();
  const allAreas = getAllAreasFlat();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/areas">Areas</Link>
            {focused && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{focused.state}</span>
              </>
            )}
          </nav>
          <p className="page-header__eyebrow u-eyebrow">Locations</p>
          <h1 className="page-header__title">
            {focused ? `${focused.state} Areas` : "Explore by Area"}
          </h1>
          <p className="page-header__desc">
            {focused?.blurb ??
              "Browse available listings across the states and neighbourhoods I cover. Property counts update automatically as listings are added."}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {states.map((s) => {
            const districtAreas = allAreas.filter((a) => a.stateSlug === s.slug);
            return (
              <div key={s.slug} className="areas-index__state">
                <h2 className="areas-index__state-title">{s.state}</h2>
                {!focused && s.blurb && <p className="areas-index__state-blurb">{s.blurb}</p>}
                <div className="area-list">
                  {districtAreas.map((a) => {
                    const count = countPropertiesForArea(a.state, a.area);
                    return (
                      <Link
                        key={`${a.stateSlug}-${a.slug}`}
                        to={`/areas/${a.stateSlug}/${a.slug}`}
                        className="area-chip"
                      >
                        <span className="area-chip__name">{a.area}</span>
                        <span className="area-chip__state">
                          {count} listing{count === 1 ? "" : "s"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
