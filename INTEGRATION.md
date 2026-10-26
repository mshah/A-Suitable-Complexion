# A Suitable Complexion — integration with `mshah/A-Thrice`

**Project:** static, dependency-free private review · 26 October 2026. No GitHub modifications were made.

## What to do locally

1. Extract this package. Copy the entire folder `a-suitable-complexion` into your repository at `exhibitions/a-suitable-complexion/` (rename the folder, but do not change its internal paths).
2. Open `exhibitions/a-suitable-complexion/index.html` in a browser, or use your normal local static server. There is no build step. The site's internal paths are relative and the footer links back to `../../index.html#exhibitions`.
3. Copy `exhibitions/a-suitable-complexion/a-suitable-complexion-feature.svg` to the main site `assets/a-suitable-complexion-feature.svg` to provide an exhibition listing thumbnail.
4. Add the card below inside the parent site's `<div class="exhibition-grid">`. The class names are taken from your current `index.html` (at the time this review was generated):

```html
<article class="exhibit-card exhibit-complexion">
  <a class="exhibit-image" href="exhibitions/a-suitable-complexion/index.html"
     aria-label="Enter A Suitable Complexion">
    <img src="assets/a-suitable-complexion-feature.svg"
         alt="A Suitable Complexion conceptual diagram and seven-colour key"
         loading="lazy" />
    <span class="exhibit-number">EXHIBITION 03 / DIGITAL EXHIBITION</span>
  </a>
  <div class="exhibit-details">
    <div class="exhibit-kicker">COLOURISM / FAMILY / COMMERCE</div>
    <h3>A Suitable<br /><em>Complexion</em></h3>
    <p>Family photographs become numbered colour studies in an exploration
       of the commercialization of inequality.</p>
    <a class="exhibit-link" href="exhibitions/a-suitable-complexion/index.html">
      ENTER THE EXHIBITION <span aria-hidden="true">↗</span>
    </a>
  </div>
</article>
```

5. The parent index currently says `TWO WORLDS / TWO DIFFERENT VISUAL LANGUAGES` and describes *both* exhibitions. Update that descriptive copy before launch. A possible line is `THREE WORLDS / POWER, MEMORY & COMMERCIAL SYSTEMS`.
6. **Do not publish yet.** This package is a private-review draft and includes deliberately prominent review banners. The GitHub repository's main branch may automatically deploy when changed, so keep this work off the deployed branch until publication permissions, copy, licences and final artwork have been approved.

## How to run the review locally

The site is designed to open by double-clicking `index.html`; all HTML/CSS/JS for interaction is local. Fonts and four Wellcome Collection archival images are externally hosted, so those particular assets require internet access. You can also serve the folder using:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/` in your browser.

## What has been implemented

- 10 complete content pages + 1 legacy archive redirect (11 HTML files), including the curatorial essay, full *Intimacy & Commerce* piece, chronology, advertising archive, artist statement, method/ethics, health risks and bibliography.
- Interactive complexion key with seven exact palette swatches and filled/unfilled states, using an abstract specimen rather than a person's face.
- Searchable-by-era timeline filters, documented slogans carousel, and an interactive promises/explanations module.
- Artist-supplied market-size and commercial-promise infographics embedded on the commerce page, a separate India all-skincare fact box, and ingredient risk panels.
- Original historical advertising scans displayed from Wellcome IIIF where available, with record links and image-credit notes. These images are **remote**, not embedded in the ZIP. Their links are not substitutes for archival rights and availability checks before launch.
- Only the two selected A-Thrice quotations: `3 Migrations Deep` and `Faceprint`. Both come from the Google Drive lyrics documents; verify against released recordings when finalising credits.
- Six artist-supplied, provisional family painting studies shown in the gallery for private review; they are not final or cleared for public release.
- Responsive mobile navigation, keyboard-accessible buttons, meaningful alt text and support for reduced motion.
- Site subdirectory works as a stand-alone static section, so it should integrate with the existing static A-Thrice portfolio.

## What needs approval before publishing

- Select and QC approved images against `A_Suitable_Complexion_Concept_and_Image_Rules.docx`: all exposed skin of each filled person in one exact flat HEX; all skin of unfilled people warm ivory and numbered; clothing coloured; consistent full seven-chip legend.
- Review consent/permission, especially for living relatives and minors; decide which names and dates may appear.
- Replace the six provisional artworks before publication; see `assets/artworks/README.md` and `data/gallery_studies_v3.csv`. Approve individual images, captions and image credits.
- Check first-person artist statement: presently based on the working brief and labeled draft.
- Confirm image-specific reuse conditions and, ideally, download the Wellcome source images under their CC licences for a stable production build. Indian advertisements from The Hindu, Afghan Snow and Fair & Lovely are *not* reproduced because rights are unresolved.
- Validate external citations, market estimates and safety information at launch; the research registry includes caution/qualification columns.
- Remove private-review banner and review disclaimers only after approval, and set canonical meta tags/social images appropriate to the actual domain.

## Build limitations

This deliverable is a static website folder, not a hosted password-protected staging URL. **Private review depends on keeping the files off your public deployment branch.** Fonts and remotely hosted archival scans need internet. Because the scan-host could change, archiving openly licensed scans locally would be ideal before launch.

## Contents

- `index.html` — entrance and central thesis
- `gallery.html` — six provisional painting studies + interactive complexion key
- `timeline.html` — 18-point interactive chronology
- `intimacy-and-commerce.html` — economics and essay
- `timeline.html#advertising-archive` — inline original archival advertisements / licensing notes; `archive.html` redirects old bookmarks
- `promise-machine.html` — slogans / typographic display / interactions
- `price-of-fairness.html` — medical and regulatory distinctions
- `curatorial-essay.html` — essay on classification
- `about.html` — first-person artist statement draft
- `method.html` — artistic protocol and ethics
- `sources.html` — 32 research-source entries and archive credits
- `styles.css`, `site.js` — all styling and client interactivity
- `data/`, `editorial/`, `archive-notes/` — editable source records, writing and rights notes
- `assets/figures/` — source SVG figures
- `a-suitable-complexion-feature.svg` — exhibition card preview asset


## V2 research and design revisions carried into V3

- The original advertising archive has moved **onto `timeline.html` below “The history is not a single origin story”**, and `archive.html` redirects there for compatibility.
- *Intimacy & Commerce* now embeds the two artist-supplied preferred infographics (full-size originals under `assets/figures/`) in place of the earlier visualisations. Larger editorial pull quote on the essay's desktop side column.
- *The Promise Machine* now includes user-supplied Seoul Secret, GlutaMAX and Glow & Lovely evidence images, plus the requested Wellcome Hazeline Snow IIIF image under each respective statement.
- The GlutaMAX **portrait** version was chosen because it preserves the campaign copy and product image at the highest supplied resolution.
- An interactive colour palette was **already functional** in `gallery.html#key` and is more clearly signposted in this version; it uses only native HTML, CSS and `site.js` (no libraries).
- Third-party ad copyrights have not been cleared for public distribution. The present package is a private-review build; do not merge to an auto-deploying public branch until rights and artwork permissions are checked.

## V3 gallery update

- The six artist-supplied provisional painting studies now appear in the requested order on the gallery page, with a full-size, keyboard-accessible viewer.
- All six source PNGs are preserved unchanged; optimized WEBP previews improve browsing performance.
- See `REVIEW_V3.md`, `data/gallery_studies_v3.csv` and `assets/artworks/README.md` for exact file assignments and replacing images.
- The supplied Wellcome URL is remotely loaded: internet is required to see that particular image. The additional three Wellcome scans on the timeline are also remote.
