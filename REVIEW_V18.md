# A Suitable Complexion — V18 private review

## Editorial changes

- British English throughout visitor-facing exhibition prose and page previews, with the A-Thrice lyric quotations preserved in their original American English. The quoted line “They wanted a color. I came from an empire.” remains unchanged.
- Clearer Family Archive introduction: “The clothing celebrates individuality. The chart reduces a person to a number.”
- The approved **The Same Face, A Different Number** passage retained apart from the website's British-English spelling; comparison works now have direct title links instead of confusing, outdated gallery position numbers.
- Artist Statement no longer displays notes addressed to the editor. A paragraph explaining the visual intervention is streamlined.
- Internal instructions in the Promise Machine, timeline, Method & Ethics, and source register were rewritten as visitor-facing explanation without dropping evidence qualifications or reproduction-rights warnings.
- The source page now accurately describes **16 paintings: 12 selected finals, four working studies**. An artist's designation of “final” is distinct from permission to publish.
- Duplicate article headings have been removed or demoted, keeping one H1 per visitor-facing page.
- The conclusion's Snow White reference, major pull quotes, central question and closing lines remain intact.

## Mirror changes

The four renderer choices approved after mobile testing are fixed inside `mirror.js` and no longer appear as controls:

- More Flat portrait: **ON**
- Gallery colour grade: **ON**
- Illustrated Features: **ON**
- Garment & Hair Detail: **ON**

The complexion palette, previous/next, automatic label cycle, camera opt-in/off and random assignment remain available.

**Let the Mirror Decide is a chance operation.** The controls now explain *before* visitors participate that it chooses one of seven categories at random and never attempts to match or measure complexion. The button itself says **LET THE MIRROR DECIDE · RANDOMLY**. A second random assignment displays: “The mirror changed its mind. Did you change?”

Camera frames and facial landmarks are processed in the user's browser for illustration, not identity recognition. Image segmenter and landmark model assets are fetched from external model/CDN servers only after a user grants camera permission; the site does not intentionally transmit the camera video or store images. Camera access requires HTTPS or localhost.

## Installation

**Full ZIP:** Extract `a-suitable-complexion/` inside the repository's `exhibitions/` directory, replacing the previous exhibition folder. The package retains existing artworks and research assets.

**Small update ZIP:** Extract its contents directly inside the existing `exhibitions/a-suitable-complexion/` folder. The archive contains only HTML, CSS and JS files changed since V17 plus this guide. It does **not** delete existing unrelated files.

Review the mirror on a real mobile phone and desktop; please check readability of the chance explanation, shade changes, random repeat behaviour, camera permissions and stop-camera behaviour.

## Verification and remaining cautions

Automated checks: local page assets/links, expected artwork inventory, JavaScript syntax, UK/American lyric distinction, fixed renderer settings, explicit random copy, absence of removed controls and ZIP integrity.

A headless browser render did not complete in this environment. Full visual layout, live webcam behaviour and performance still require verification on your deployed HTTPS preview.

Private-review notices and outstanding family-photo/ad-image permission cautions are retained. This build has **not** been pushed to GitHub.
