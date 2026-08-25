# Dennis Property — Web Property Prototype

A working, responsive property website prototype built for a private Malaysian
property consultant. It combines a premium property-portal feel (subsale
listings, filtering, search, area discovery) with personal-consultant pages
(About, Contact, WhatsApp enquiry) — all powered by **local JSON data**.

No database, no external CMS, no API keys. Every property and project lives in a
local JSON file, and every page is generated dynamically from that data.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

For a production build:

```bash
npm run build      # type-checks + bundles into /dist
npm run preview    # serve the production build locally
```

---

## What's inside

```
src/
├── components/        # navigation, property, project, filters, contact, common
├── pages/             # HomePage, AboutPage, Subsale, Listing, Detail, Projects,
│                      #   ProjectDetail, Areas, AreaDetail, Contact, 404
├── layouts/           # top-level Layout (header + footer + outlet)
├── services/          # data access layer — propertyService, projectService, areaService
├── hooks/             # usePageMeta (SEO title/description)
├── utils/             # formatting, WhatsApp deep-links
├── types/             # Property / Project / Area / Profile TypeScript interfaces
├── config/            # site config (reads the profile)
├── data/              # ★ your local "database" lives here
│   ├── properties.json
│   ├── projects.json
│   ├── areas.json
│   └── profile.json
└── styles/            # design tokens + component CSS (plain CSS, no framework)
public/media/          # property photos, project photos, video, profile photo
```

---

## The core idea: one record, many pages

A single `Property` record powers every place that property appears. Example:

```
properties.json  →  PropertyCard  →  PropertyListingPage  →  PropertyDetailPage
                        │
                        ├─ Subsale → Residential → Condominium
                        ├─ Areas → Kuala Lumpur → Mont Kiara
                        └─ Featured Properties (featured: true)
```

You never duplicate a property for a second navigation path. Adding, editing or
removing one JSON record updates the whole site.

---

## 🏠 Adding a new property

1. **Add its media** to a folder (optional but recommended):

   ```
   public/media/properties/my-new-property/
       cover.jpg
       living-room.jpg
       walkthrough.mp4    (optional)
   ```

2. **Add one object** to the `properties` array in
   `src/data/properties.json`.

3. **Set a unique `slug`** (used for the URL `/properties/my-new-property`).
   Keep it lowercase with hyphens, matching your media folder name.

4. **Set the image paths** in `photos` (e.g. `/media/properties/my-new-property/cover.jpg`).

5. **Save.** The property now automatically appears in:
   - `/subsale` and the matching category/type paths
   - `/areas/<state>/<area>` if its state + area match a configured area
   - Featured on the homepage if you set `"featured": true`
   - Search and filters, and its own `/properties/<slug>` detail page

A typical record:

```json
{
  "id": "p-013",
  "slug": "my-new-property",
  "title": "My New Property",
  "transactionType": "subsale",
  "category": "residential",
  "propertyType": "condominium",
  "state": "Selangor",
  "area": "Subang Jaya / Sunway",
  "subArea": "USJ",
  "address": "Jalan USJ 5, Selangor",
  "price": 720000,
  "currency": "MYR",
  "bedrooms": 3,
  "bathrooms": 2,
  "carParks": 1,
  "builtUpSqFt": 1100,
  "tenure": "Freehold",
  "furnishing": "Partially Furnished",
  "description": "A bright, well-kept condo…",
  "keyFeatures": ["Freehold", "Near MRT", "Gated"],
  "photos": [
    "/media/properties/my-new-property/cover.jpg",
    "/media/properties/my-new-property/living-room.jpg"
  ],
  "featured": false,
  "status": "available",
  "createdAt": "2025-08-01"
}
```

**Field notes**
- `category` — one of `residential` | `commercial` | `industrial`.
- `propertyType` — `condominium` / `landed` for residential, or e.g.
  `shop-office`, `warehouse` for others.
- Optional fields (`subArea`, `address`, `bedrooms`, `bathrooms`, `carParks`,
  `builtUpSqFt`, `landAreaSqFt`, `tenure`, `furnishing`, `videos`, `keyFeatures`)
  are **hidden on the detail page when empty**, so industrial listings don't show
  bedrooms and so on.
- `status` — `available` | `reserved` | `sold`. Only `available`/`reserved`
  show in listings.

---

## 🏢 Adding a new project

Same principle in `src/data/projects.json`:

1. Add images to `public/media/projects/<your-project>/`.
2. Add one object to the `projects` array.
3. Set the `slug` and photo paths.
4. Save. It appears under `/projects`, the matching category, and its own
   `/projects/<slug>` page.

Project records use the `Project` interface (different from `Property`):
name, developer, category, priceFrom/priceTo, tenure, completionDate,
projectStatus, unitTypes, facilities, floorPlans, videos. Empty sections are
hidden automatically. See `src/types/project.ts` for the full shape.

---

## 📍 Adding a new area

Areas are defined in `src/data/areas.json`. Each **state** (e.g. Kuala Lumpur,
Selangor) contains an `areas` array. Add a district:

```json
{
  "name": "Mont Kiara",
  "slug": "mont-kiara",
  "description": "An established upmarket township…"
}
```

- The `slug` becomes part of the URL: `/areas/kuala-lumpur/mont-kiara`.
- The `description` is shown on that area's page.
- **Property counts are computed at runtime** from `properties.json` — you never
  hard-code how many listings an area has.

A property appears on an area page when its `state` matches the state slug and
its `area` (or `subArea`) matches the area name. To add a listing to an existing
area you only edit `properties.json`, not `areas.json`.

---

## 👤 Changing personal details

Edit **`src/data/profile.json`** — one file, site-wide:

```json
{
  "name": "Adam Firdaus",
  "professionalTitle": "Senior Property Consultant · REN 12345-A",
  "shortBio": "…",
  "longBio": "…",
  "phone": "+6012-345 6789",
  "whatsappNumber": "60123456789",
  "email": "enquiry@dennisproperty.my",
  "profilePhoto": "/media/profile/avatar.jpg",
  "company": "Dennis Property",
  "renNumber": "REN 12345-A",
  "socials": [ { "label": "Facebook", "url": "https://facebook.com" } ]
}
```

Changes here flow everywhere: the header/footer, About page, Contact page,
WhatsApp CTAs, and enquiry cards. The **WhatsApp number is read from
`whatsappNumber`** (digits only, with country code, no `+`).

> Site name / tagline / currency live in `src/config/site.ts`.

---

## 🧭 Navigation routes

```
/                               Home (hero, featured, explore, contact CTA)
/about                          About Me
/subsale                        All subsale listings
/subsale/residential
/subsale/residential/condominium
/subsale/residential/landed
/subsale/commercial
/subsale/industrial
/properties/:slug               Property detail
/projects                       All projects
/projects/residential | commercial | industrial
/projects/:slug                 Project detail
/areas                          All areas (grouped by state)
/areas/:stateSlug               Areas in one state
/areas/:stateSlug/:areaSlug     Area detail with listings
/contact                        Contact form + details
/login                          Admin login (abc123 / qwerty12345)
/admin/add-project              Add a project (login required)
anything-else                   404 page
```

---

## 🔍 Search & filters

- Keyword search matches title, area, sub-area, state, property type, address
  and description (try "Mont Kiara", "condo", "Shah Alam").
- Filters (category, residential type, state, area, price range, bedrooms) all
  combine with each other and with search.
- Sort: Newest | Price low→high | Price high→low.
- On desktop filters sit in a sticky sidebar; on mobile they open in a bottom
  sheet via the "Filters" button.

---

## 📱 Responsive

The design intentionally reflows across mobile (390px), tablet (768–1024px) and
desktop (1440px):

- Sticky header → hamburger + full-screen slide-in mobile menu
- Property gallery: stacked + lightbox on mobile, 16:9 with thumbnails on desktop
- Filters sidebar on desktop, bottom-sheet on mobile
- Property/project detail: sticky enquiry sidebar on desktop, sticky bottom
  WhatsApp/Enquire bar on mobile

---

## 🎨 Design system

Everything derives from CSS variables in `src/styles/tokens.css`, following the **"Air" design language** (dark atmospheric canvas, full-bleed photography, compressed display type):

- **Palette** — Black Void `#000` / near-black canvas `#0a0a0a`, Haze `#f5f5f5` cards & inputs, Whiteout `#fff` text, Twilight Blue `#426188` (large heading accents) and Signal Blue `#2b7fff` (links & tags only — never the primary CTA)
- **Typography** — Anton (compressed, uppercase) for poster-scale headlines only, Inter medium-weight for the interface, Caveat for cursive accent words inside headlines
- **Radius ladder** — 4px inputs, 8px buttons, 12px cards/images; pills only for filter/toggle controls
- **Rules** — no gradients (photography + flat contrast carry depth), no glassmorphism, no new radii

Components use these tokens instead of ad-hoc values, so the whole site reads as one system. The visual language is **image-led and editorial**: strong property photography on a dark canvas with quiet, premium typography — deliberately avoiding "generic SaaS dashboard" aesthetics.

---

## 🔐 Admin: login + adding projects from the website

There is a prototype admin area so you can add new projects without touching code:

| Route | Purpose |
| --- | --- |
| `/login` | Admin sign-in (standalone page) |
| `/admin/add-project` | Protected form that adds a project to `src/data/projects.json` |

**Credentials (MVP):**

```
user ID:  abc123
password: qwerty12345
```

Both are stored in **`src/config/auth.ts`** — edit that one file to change them. The session lives in `sessionStorage` (a tab refresh stays logged in; closing the tab logs out). A discreet **Admin** link sits in the footer.

> ⚠️ This is client-side auth — fine as a prototype gate, but anyone with the source can read the credentials. Replace with a real backend login before going live.

### How the add-project form works

1. Visit `/login`, sign in, and you land on `/admin/add-project`.
2. Fill in the project (name, developer, category, location, price range, unit types, facilities, description…). Required fields are marked; validation happens on submit.
3. **Save project** posts the record to a tiny dev-only Vite middleware (`vite-plugin-project-write.ts`), which appends it to `src/data/projects.json`.
4. The project immediately appears on `/projects` and its auto-generated detail page `/projects/<slug>`. Photos default to `/media/projects/<slug>/cover.jpg`.

If the middleware is unavailable (e.g. a production build), the form falls back to showing the ready-to-paste JSON so you can still add the record manually.

---

## 🔌 Migrating to a database later

All pages fetch data through the service layer, never by importing JSON directly:

- `src/services/propertyService.ts`
- `src/services/projectService.ts`
- `src/services/areaService.ts`

To move to a real database (Supabase, PostgreSQL, a CMS, an API), you replace
the internals of these modules (swap the JSON import for async queries) without
rewriting any page or component. The component APIs (e.g. `getPropertyBySlug`,
`filterProperties`) are kept synchronous and simple so the swap stays small.

---

## Tools

- **React 19 + TypeScript + Vite** for the app shell
- **React Router v7** for routing
- **Lucide** for icons
- **Plain CSS + design tokens** (no UI framework, to keep the look bespoke)

---

## Prototype demo note

All property and project names in the sample data are **fictional**. Media
folders are scaffolded but images are optional — a neutral branded placeholder
is shown where a photo is missing. Replace the sample records and media folders
with your real listings to go live.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint (oxlint) |
| `node scripts/qa-verify.mjs` | Headless end-to-end sanity check (dev server must be running) |
| `node scripts/qa-admin.mjs` | Headless QA for login, add-project + Air restyle (dev server must be running) |
