# Portfolio Design System

> **Project:** Estevan Maher — Frontend Developer Portfolio  
> **Status:** Current UI source of truth  
> **Primary stylesheet:** `css/style.css`  
> **Markup:** `index.html`  
> **Behavior/interactions:** `js/main.js`

## 1. Purpose

This document defines the visual and interaction language of the current portfolio. It is intentionally based on the existing implementation rather than introducing a new visual system.

The site should feel:

- Dark, cinematic, technical, and premium.
- Minimal without feeling empty.
- Editorial in typography and spacing.
- Interactive through restrained motion rather than constant decoration.
- Strongly connected to frontend engineering, 3D, motion, and depth.

### Core rule

**Enhance the existing system; do not replace it.**

Before making UI changes, read this file and inspect `css/style.css`, `index.html`, and `js/main.js`. Reuse existing tokens, selectors, assets, motion patterns, and responsive rules whenever possible.

---

## 2. Source of Truth

The current project is intentionally lightweight and does not use a separate `system.css` or Tailwind setup.

For the current version:

- `css/style.css` is the canonical visual stylesheet and contains the design tokens and component styles.
- `index.html` is the canonical markup/content source.
- `js/main.js` is the canonical behavior/interaction source.
- Google Fonts loaded by `index.html` are part of the visual system and must not be silently replaced.

When a future design-system stylesheet is introduced, this document should be updated to identify it explicitly.

---

## 3. Design Principles

### 3.1 Minimalism

Prefer fewer, stronger visual elements. Avoid adding decorative UI that does not improve hierarchy, meaning, or interaction.

### 3.2 Cinematic depth

Depth comes primarily from:

- The 3D hero scene.
- Radial ambient lighting.
- Layered surfaces.
- Soft spotlight effects.
- Subtle parallax and reveal motion.

Do not add competing 3D scenes, large floating objects, or excessive glow without a clear purpose.

### 3.3 Typography-led hierarchy

Typography is a major part of the identity. Large display text should create hierarchy before adding extra visual decoration.

### 3.4 Interaction over decoration

Hover, focus, active, reveal, and scroll states should be purposeful, quick to understand, and visually restrained.

### 3.5 Performance first

Prefer CSS transforms, opacity, `requestAnimationFrame`, and `IntersectionObserver`. Avoid introducing heavy animation libraries for effects that can be implemented with the existing CSS/vanilla-JS architecture.

---

## 4. Color System

All primary colors are defined in `:root` in `css/style.css`.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0a0a0a` | Page background / deepest surface |
| `--surface` | `#111111` | Cards, panels, primary surfaces |
| `--lift` | `#1a1a1a` | Hover/lifted surfaces and placeholders |
| `--border` | `#2a2a2a` | Dividers, borders, grid separators |
| `--muted` | `#6b6b6b` | Secondary metadata, low emphasis text |
| `--dim` | `#999999` | Supporting text and quiet UI |
| `--body` | `#d0d0d0` | Primary readable body text |
| `--head` | `#f5f5f5` | Heading/default high-emphasis text |
| `--white` | `#ffffff` | Maximum emphasis, active/hover text |
| `--accent` | `#c9a978` | Primary champagne accent / 3D & motion |
| `--accent-dim` | `rgba(201,169,120,0.15)` | Subtle accent background/glow |

### Category accents

| Token | Value | Category |
|---|---|---|
| `--c-3d` | `#c9a978` | 3D & Motion |
| `--c-fe` | `#4fb8ff` | Frontend |
| `--c-design` | `#ff7eb3` | Design |
| `--c-lang` | `#4ade80` | Languages |

### Glass tokens

| Token | Value | Usage |
|---|---|---|
| `--glass-bg` | `rgba(22,22,22,0.7)` | Glass-like surfaces |
| `--glass-border` | `rgba(255,255,255,0.06)` | Quiet glass border |
| `--glass-border-hover` | `rgba(255,255,255,0.12)` | Hovered glass border |

### Color rules

- Keep the black/charcoal foundation dominant.
- Purple is the primary accent and should remain restrained.
- Category accents belong to skill categorization and related interaction states.
- Do not introduce additional brand colors without documenting them here first.
- Avoid large saturated gradients that compete with the 3D hero.

---

## 5. Typography System

The portfolio currently uses exactly two Google Fonts.

### Display / Headings

**Zen Dots**

Token:

```css
--ff-d: 'Zen Dots', sans-serif;
```

Use for:

- Site/logo name.
- Hero name.
- Major section headlines.
- Project titles.
- Skill names.
- Mobile menu links.
- Loader name.
- Footer name.

This typeface provides the futuristic/technical identity of the site.

### Body / UI

**Fjalla One**

Tokens:

```css
--ff-b: 'Fjalla One', sans-serif;
--ff-m: 'Fjalla One', sans-serif;
```

Use for:

- Body copy.
- Navigation labels.
- Eyebrows and section labels.
- Buttons.
- Tags.
- Metadata.
- Contact values/labels.
- Footer metadata.
- Scroll hint.

Do not reintroduce Syne, Inter, Space Mono, Poppins, Montserrat, or another substitute unless the design system is explicitly revised.

### Typography behavior

- Large headings use tight tracking and compressed line-height.
- Body copy stays readable with generous line-height.
- Uppercase micro-labels use tracking to create editorial/technical rhythm.
- Do not use excessive font weights to compensate for poor hierarchy.

---

## 6. Motion System

The site uses restrained cinematic motion.

### Easing

```css
--ease: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

Prefer these existing easings for new UI transitions.

### Approved motion patterns

- Fade + vertical reveal for entering sections.
- Image scale on project hover.
- Small vertical lift on interactive cards.
- Border/accent reveal.
- Cursor spotlight.
- Subtle hero parallax.
- 3D cube rotation already present in the hero.
- Scroll progress at the top of the viewport.
- Mobile menu slide/reveal transitions.

### Motion limits

Avoid:

- Constantly moving text unless it is the existing ticker.
- Large continuous UI movement.
- Excessive blur animation.
- Bouncy interactions inconsistent with the editorial tone.
- Multiple simultaneous motion effects competing for attention.

### Reduced motion

`prefers-reduced-motion: reduce` is supported. Any newly added animation must respect the same preference and should not rely only on CSS if it is driven by JavaScript.

---

## 7. Global Layout

### Desktop

Primary page sections use generous horizontal padding, currently centered around **64px** on large screens.

Main content uses strong two-column layouts where appropriate:

- Hero: text + 3D scene.
- About: editorial heading + copy/skills.
- Contact: large heading + contact content.

### Tablet

At approximately `max-width: 1100px`:

- Horizontal padding is reduced toward `48px`.
- Skills collapse from four columns to three.

At approximately `max-width: 768px`:

- Navigation links become a hamburger menu.
- Hero becomes one column.
- The 3D scene remains present at a reduced size.
- Projects become one column.
- About and Contact become one column.
- Skills use two columns.

### Mobile

At approximately `max-width: 480px`:

- Horizontal padding is reduced toward `20px`.
- Typography scales down using `clamp()`.
- The 3D scene becomes smaller while remaining part of the hero.
- Contact rows tighten.
- Scroll hint is hidden.

### Responsive rule

Do not introduce fixed widths that cause horizontal overflow. Prefer `clamp()`, percentages, grid/flex layouts, and the existing breakpoint structure.

---

## 8. Navigation

### Desktop navigation

- Fixed at the top.
- Dark gradient backdrop into the page.
- Logo uses Zen Dots.
- Navigation labels use Fjalla One.
- Active and hover states use `--white` for emphasis.

### Mobile navigation

- Desktop nav links are hidden.
- Hamburger toggle is shown.
- Full-screen mobile menu uses Zen Dots for major links.
- Existing accessibility attributes such as `aria-controls` and `aria-expanded` must remain accurate.

### Navigation rules

- Keep labels short.
- Do not duplicate primary navigation elsewhere without a clear reason.
- Avoid adding a second visible Work/About/Contact navigation group in the footer unless explicitly requested.

---

## 9. Hero

The hero is the primary identity section.

### Structure

- Left: eyebrow, name, description, actions.
- Right: interactive developer interface with perspective depth.

### Visual language

- Background remains near-black.
- Ambient purple radial light provides depth.
- Fine grain/pattern is subtle and must remain subordinate.
- Hero name is large and uses Zen Dots.
- Description and actions use Fjalla One.
- The right-side interface should feel like a premium browser/dev environment rather than a generic mockup.

### Interactive developer interface

The right-side focal element is a lightweight CSS-built developer interface. It uses a perspective stage, layered browser/code panels, subtle orbit lines, pointer-driven parallax, and the purple motion accent to retain the site's depth language.

Rules:
- Keep the interface lightweight and CSS/vanilla-JS driven.
- Keep pointer-driven parallax subtle.
- Use purple primarily for depth, active states, and motion cues.
- Tabs and the Run control must remain keyboard accessible.
- Respect `prefers-reduced-motion`.
- Do not replace the interface with stock imagery or unrelated decorative art.

---

## 10. Ticker

The ticker is an intentionally low-priority motion layer containing capability words such as:

- Clean Code
- Responsive
- Scalable
- Performant
- Accessible
- Frontend
- Modern

Rules:

- Maintain low visual contrast.
- Keep the ticker lightweight.
- Preserve hover pause behavior if modifying it.
- Respect reduced-motion preferences.

---

## 11. Section Labels

`.slabel` is the shared editorial section label.

Characteristics:

- Small uppercase text.
- Increased letter spacing.
- Muted gray color.
- Horizontal divider extending from the label.

New sections should reuse this pattern instead of inventing a new heading-label treatment.

---

## 12. Project Cards

Project cards are the main portfolio content units.

### Structure

1. Thumbnail.
2. Project number.
3. Project title.
4. Description.
5. Technology tags.
6. Project link/action.

### Visual behavior

- Dark surface.
- Thin border/grid separation.
- Thumbnail can zoom slightly on hover.
- Card can lift subtly.
- Left accent line can reveal on hover.
- Radial pointer spotlight is allowed.

### Current project inventory

The current Work section contains six entries. The first four represent projects previously worked on in this portfolio workflow; the last two are explicitly marked as concepts so they are not presented as completed client work.

| # | Project | Status |
|---|---|---|
| 01 | Coco Chocolate Store | Personal project |
| 02 | Coco Chocolate Admin Dashboard | Personal project |
| 03 | Al-Rai Al-Saleh Lab Reports | Personal project |
| 04 | 2048 AI Solver | Personal project |
| 05 | Premium E-commerce Experience | Concept |
| 06 | Interactive Product Showcase | Concept |

Project images and live URLs are intentionally left as placeholders until the real assets and links are added. Do not fabricate URLs, metrics, clients, or results.
- Project title becomes higher contrast on hover.

### Content rule

Do not invent real project links, statistics, client claims, or project images. Placeholder content must remain clearly identifiable until real content is supplied.

### Featured projects

A featured card treatment may be introduced only when the real project content justifies it. Do not create artificial hierarchy simply for visual effect.

---

## 13. About & Skills

### About

The About section uses an editorial two-column composition with a sticky heading on desktop.

The visual focus is the typography and spacing, not decorative graphics.

### Skills

Skill cards are compact, interactive, and color-coded by category.

Required behavior:

- Default state stays calm.
- Hover produces subtle lift, icon emphasis, accent line, and pointer spotlight.
- Continuous idle floating animations should not be reintroduced without explicit approval.

Category colors:

- 3D / Motion → purple.
- Frontend → cyan.
- Design → pink.
- Languages / related categories → green.

Do not use these category colors as large page-wide backgrounds.

---

## 14. Contact

Contact should feel direct and premium rather than like a conventional contact form.

### Current language

- Large Zen Dots heading.
- Supporting copy in Fjalla One.
- Contact rows with icon, label, and value.
- Subtle glass/hover treatment.
- Small horizontal interaction movement is acceptable.

### Contact rules

- Preserve the existing real contact values.
- Never fabricate a social account or email.
- External links should use safe target attributes where applicable.

---

## 15. Footer

The footer is intentionally restrained.

Use:

- Site name in Zen Dots.
- Secondary metadata in Fjalla One.
- Thin borders.
- Small uppercase supporting text.

Do not add redundant primary navigation to the footer unless explicitly requested.

---

## 16. Interactive States

Every interactive component should have at least:

- Default.
- Hover (where a pointing device exists).
- Focus-visible.
- Active/selected when applicable.
- Disabled state when applicable.

### Focus

The existing project uses a visible `:focus-visible` outline. New interactive elements must preserve keyboard focus visibility and must not remove outlines without providing a clear replacement.

### Touch devices

The custom cursor is hidden on coarse/touch input. Do not design interactions that depend exclusively on hover.

---

## 17. Accessibility

Maintain the current accessibility direction:

- Semantic HTML.
- Descriptive link/button labels.
- `aria-expanded` for the mobile navigation toggle.
- `aria-controls` pointing to the mobile menu.
- Visible keyboard focus.
- Reduced-motion support.
- No hover-only critical functionality.
- Sufficient text/background contrast for primary content.

When changing navigation behavior, ensure keyboard and Escape-key behavior remains intact if already implemented.

---

## 18. Performance Rules

Prioritize smoothness of the 3D hero and interaction system.

Prefer:

- CSS transforms and opacity for animation.
- `requestAnimationFrame` for pointer/scroll-driven visual updates.
- `IntersectionObserver` for reveal-on-scroll.
- Reusing existing DOM nodes.
- Lazy/deferred loading where appropriate.
- Optimized images and `decoding="async"` where appropriate.

Avoid:

- Large animation libraries for small effects.
- Layout-triggering properties in pointer loops when transforms will work.
- Unnecessary continuous animations.
- Duplicated observers/listeners that can share one controller.

---

## 19. HTML / CSS / JS Architecture Rules

### HTML

Keep content and semantic structure in `index.html`.

### CSS

Keep design tokens and UI styling in `css/style.css` until a dedicated design-system stylesheet is intentionally introduced.

Do not scatter one-off inline styles when an existing token/component rule can handle the requirement.

### JavaScript

Keep behavior in `js/main.js`.

Use small, purposeful modules/functions rather than large global handlers.

When changing pointer, scroll, or animation behavior, avoid creating multiple listeners that perform the same job.

---

## 20. Assets & Fonts

Current fonts are loaded from Google Fonts in `index.html`:

- Fjalla One.
- Zen Dots.

Existing icons, inline SVG, and image assets are part of the current visual language.

Do not replace or remove assets just to simplify the code unless the resulting UI is verified to be equivalent or better.

For new project images, prefer optimized local image assets rather than large Base64 blobs when the project architecture supports external assets.

---

## 21. Safe UI Change Protocol

Before changing UI:

1. Read `DESIGN.md`.
2. Inspect `css/style.css` for existing tokens and component rules.
3. Inspect `index.html` to understand the current semantic structure/content.
4. Inspect `js/main.js` before changing any interaction that may be controlled by JavaScript.
5. Reuse an existing token/component when possible.
6. Explain any conflict between the requested change and this design system before making a broad visual change.
7. Make the smallest change that satisfies the request.
8. Re-check desktop, tablet, and mobile layouts.
9. Re-check reduced motion and keyboard focus when interactions are changed.

---

## 22. Do / Don't

### Do

- Reuse existing color tokens.
- Use Zen Dots for display identity and Fjalla One for body/UI.
- Preserve the 3D hero.
- Preserve responsive behavior.
- Prefer subtle cinematic motion.
- Keep interactions fast and intentional.
- Reuse existing components and states.
- Keep the code architecture split into HTML/CSS/JS.

### Don't

- Rebuild the page from scratch for a small UI request.
- Replace the typography without updating this document.
- Add unrelated colors or visual themes.
- Introduce heavy libraries for simple interactions.
- Hide important content on mobile without a strong reason.
- Add fake project data or credentials.
- Add duplicate navigation groups.
- Remove accessibility behavior or reduced-motion support.

---

## 23. Current Breakpoint Reference

| Range | Behavior |
|---|---|
| `> 1100px` | Full desktop composition |
| `<= 1100px` | Reduced horizontal spacing; 3-column skills |
| `<= 768px` | Mobile nav; one-column hero/work/about/contact; 2-column skills |
| `<= 480px` | Compact mobile spacing and typography; smaller 3D scene |
| Touch/coarse pointer | Custom cursor hidden |

These are the current implementation breakpoints, not a requirement that every future component use exactly the same values.

---

## 24. Design Change Log

### Current baseline

- Dark cinematic portfolio.
- Zen Dots for display identity/headings.
- Fjalla One for body/UI text.
- Purple primary accent.
- Category-colored skill interactions.
- Interactive developer-interface hero with depth and parallax.
- Responsive desktop/tablet/mobile layout.
- Reduced-motion support.
- Custom cursor on fine pointers.
- Scroll progress indicator.
- Minimal editorial footer.

When a significant visual system decision changes, update this section and the relevant token/component rules above.


## 13. Project Preview & Work-to-Skill Interaction

Project cards use lightweight CSS-built browser previews and an accessible modal preview surface. The preview is intentionally image-independent so the portfolio remains functional before real screenshots are added. When screenshots are available, use AVIF/WebP sources, explicit dimensions, `decoding="async"`, and `loading="lazy"` for below-the-fold media.

Skill cards expose the projects where a skill is used and can highlight related Work cards. This interaction should remain subtle and temporary; it must not become a filtering system that hides the portfolio permanently.

## 14. Contact CTA

The Contact section opens with the direct CTA hierarchy:

**Have a project in mind?**
**Let's build it.**

Then provide Gmail, WhatsApp, LinkedIn, and GitHub.
