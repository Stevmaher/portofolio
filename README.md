# Estevan Maher portfolio

The original dark, monochrome portfolio, upgraded in place with native HTML, CSS and JavaScript. No runtime dependencies, framework, tracking scripts or contact backend.

Live site: https://portofolio-five-gold-76.vercel.app/

## Preview

Serve the repository root with any static server, for example:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Do not use a filesystem URL for quality checks.

## Structure

- `index.html`: semantic sections, project cards and native-dialog case studies.
- `style.css`: shared design tokens, layouts, components and responsive rules.
- `script.js`: navigation, dialog focus/scroll management, form validation and the original portrait/code/roadmap interactions.
- `assets/`: local font, original portrait, social preview and optimized real project screenshots.
- `404.html`, `robots.txt`, `sitemap.xml`, icons: routing/SEO assets.
- `scripts/`: dependency-free static validation and optional production export.
- `tests/`: development-only browser, responsive and accessibility checks. Not required by the website or Vercel.

## Checks and optional export

Node 18+ is sufficient:

```sh
node scripts/check.mjs
node scripts/build.mjs
```

The optional build copies deployment files into `dist/`. The existing Vercel project continues to serve the repository root. There is deliberately no root `package.json` and no change to the deployment framework or output directory.

For browser checks, install the separate development tools:

```sh
npm --prefix tests install
cd tests
npx playwright install chromium
npm test
```

Python 3 is used to serve the local site during tests. Optionally set `CHROME_PATH` to an existing Chrome/Chromium executable. Tests cover the eight requested widths, browser errors, automated accessibility, project dialogs, keyboard close/focus return, mobile navigation and contact validation. Results and screenshots go to `.artifacts/`. The draft-link test intercepts the mailto action and sends no email.

For Lighthouse on the actual deployment:

```sh
cd tests
npx lighthouse https://portofolio-five-gold-76.vercel.app/ --output html --output json --output-path ../.artifacts/lighthouse-mobile
npx lighthouse https://portofolio-five-gold-76.vercel.app/ --preset desktop --output html --output json --output-path ../.artifacts/lighthouse-desktop
```

Lab scores vary with network, hardware, Chrome and Lighthouse versions. They are not field Core Web Vitals or evidence of real-user INP.

## Content and behavior

- Waad screenshots are from its sample-data preview. Its private repository is intentionally not linked.
- AXIOM is positioned as Al-Fatehoon animal merge analysis, not a generic puzzle solver. The screenshot is the real sign-in screen, clearly labeled. No assistant or guaranteed outcomes are claimed.
- VOYARA's verified stack is React, Tailwind CSS and Parcel. It is an inquiry-oriented landing page, not a booking engine.
- Unverified historical start dates are omitted. Self-directed development and education are separate, not represented as employment.
- The portfolio itself is English, with only the Waad name tagged as Arabic. No language toggle is implied.
- The form validates fields and asks the visitor's email application to create a draft. It does not send or store messages and never claims delivery. A working configured email application is required. The direct email link is always available.
- Native dialogs support Escape and keyboard focus containment. Close returns focus to the trigger and unlocks background scrolling. All section links remain standard URL anchors.
- The original large hero title, floating menu, flipping portrait journey, translucent project folders, staggered skills and roadmap identity are retained.
- Reduced-motion preferences disable nonessential animations, including when the preference changes during a visit. Content is never hidden while waiting for a reveal.

## Deployment

Push approved changes to `main` in the existing repository. The connected Vercel project deploys automatically. Keep Framework Preset `Other`, Build Command empty and the root output directory unchanged. Verify the live page, resources, metadata and `/404.html` after deployment. Vercel's static hosting uses `404.html` for unknown paths; test a real missing path to confirm the HTTP 404 status.

## Asset provenance

The existing local Space Grotesk font and Estevan portrait are retained. Project images are optimized copies of the existing real screenshots. The monochrome social card and favicon are original text/geometric artwork made for this portfolio. Waad presentation artwork frames actual sample-data screenshots in its own green product palette, not invented UI. The raw screenshots are retained alongside the presentation files. Copied third-party crowd sprites and their animation were removed because their license was not established. No stock project screenshots are used.
