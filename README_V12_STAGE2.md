# A Suitable Complexion — V12 / Stage 2 testing

This is an **isolated test of photographic simplification**, built directly on the working **V11.1** mirror alignment and line-art treatment. The default is deliberately **OFF**, matching V11.1.

## Installation

**Small patch (recommended):** Extract the patch ZIP. Copy its `beyond-the-chart.html`, `mirror.js`, and `styles.css` into your existing `exhibitions/a-suitable-complexion/` folder, replacing those three files. The HTML requests `mirror.js?v=12` and `styles.css?v=12` to avoid old cached assets.

**Full package:** Extract the full ZIP and replace your existing `exhibitions/a-suitable-complexion/` folder with the enclosed `a-suitable-complexion/` folder. Use this only if you're happy to replace locally customized pages.

**Camera note:** For camera access, visit the page over HTTPS or through `localhost`. The browser asks for camera permission; no photo or video is uploaded or stored. MediaPipe's browser software/models still download from CDNs on first use.

## What changed

A new button appears under *ILLUSTRATED FEATURES*:

**SIMPLIFIED PORTRAIT: OFF / ON**

- **OFF:** Previous V11.1 illustrated reflection, unchanged by default.
- **ON:** Reduces tiny photographic textures and groups non-skin luminance into **eight tonal bands**, with moderate smoothing. This changes neither the seven fixed complexion colours nor their flat-fill method.
- The simplified base also applies inside the restored eye and lip regions; ink contours are drawn on top in both modes.
- Saturation, white balance, overall contrast and garment-specific treatment have **not** been tuned. That's for later review.
- Face and skin models still process the same original, mirrored, cropped frame as V11.1. No new facial alignment transforms were added.

## What to test

1. Turn the camera on. Keep *ILLUSTRATED FEATURES: ON*.
2. Compare *SIMPLIFIED PORTRAIT* OFF versus ON without moving your face much.
3. Check whether the hair, eyebrows, eyes, mouth, clothing and background look more illustrated, while remaining recognizable.
4. Change the complexion from 02 to 07; skin should remain completely flat and unshaded in either mode.
5. Smile, turn your head, step farther from the camera, and test a bright patterned garment. Look for flickering, smearing, or a noticeable reduction in frame rate.
6. Test a mobile phone if available. Let me know which mode you prefer and whether the change is too subtle or too strong.

## Verification

- JavaScript syntax check: passed.
- Offline desktop + mobile browser interaction checks for the toggle, existing feature-lines switch, shade picker and random assignment: passed.
- ZIP integrity, HTML references, and asset inventory: checked.
- **Real camera and MediaPipe processing were not tested in the execution environment**, so your deployed/local HTTPS camera test remains essential.

No files were pushed to GitHub.
