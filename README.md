# Estevan Maher portfolio

Plain HTML, CSS and JavaScript. No dependencies and no build step.

## Preview
Open index.html in your browser. For development, you can also run `python -m http.server 8000` in this folder, then open http://localhost:8000.

## Add your photo
Put your portrait beside index.html and name it photo.jpg. It replaces the E placeholder automatically. The reference person's portrait is deliberately not included.

## Publish on Vercel
Push this folder to a GitHub repository. In Vercel, choose Add New Project, import the repository, choose Other for framework, leave Build Command empty, and set Output Directory to `.`. Deploy. You can also deploy with Vercel CLI from this folder.

## Edit your content
Change text, project links and contact email in index.html. If you change the email address, update script.js too. The project folders open accessible detail dialogs. The contact form creates a mailto draft in the visitor's email app. It does not send or store messages.

## Motion and accessibility
Per-letter hero title entrances, a single portrait that travels from the hero to the biography while flipping as you scroll, IntersectionObserver section reveals, a winding experience roadmap that draws itself into view, semi-transparent glass project folders that open on hover, magnetic buttons on fine pointers, a footer quote, and a walking illustrated footer crowd that drifts in two layers around a still illustrated portrait of Estevan (estevan-standing.webp). Click the crowd to pause it. Animation stops outside view or when the browser tab is hidden. Reduced-motion preferences disable entrance, scroll and continuous animations. Theme and menu state last only for the current visit.

## Reference and assets
Layout and motion recreated from https://www.aswinpanengal.me/ and the supplied reference video, with Estevan's own content. The crowd sprite illustrations (assets/crowd-01.webp through crowd-07.webp) are from that site's publicly served /footer/bengaluru/ assets. Their reuse license was not supplied. Obtain the artist/site owner's permission or replace them before independent public distribution. The font is Space Grotesk, licensed under the SIL Open Font License: https://github.com/floriankarsten/space-grotesk .

## Known differences
An illustrated standing portrait of Estevan anchors the footer crowd. Estevan has three project cards rather than the reference's four, and different skills and experience. No AI chat assistant or server backend is included. Project mini-previews are typographic placeholders, not screenshots of the apps. The hosted preview may show an outer viewer bar and uses an internal scrolling viewport; the plain site runs without that bar.
