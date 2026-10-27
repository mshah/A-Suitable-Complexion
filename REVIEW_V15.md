# A Suitable Complexion — V15 Colour Grading Test Guide

## Intent

V15 adds colour grading to the **working V14 mirror** without changing tracking, facial feature outlines, skin segmentation, or the seven fixed HEX skin colours. This is a visual-tuning prototype, not a complexion measurement tool.

## Install

**Patch:** Unzip `A_Suitable_Complexion_V15_Colour_Grading_Mirror_Patch.zip` into your existing `exhibitions/a-suitable-complexion/` folder, replacing these three files:

- `beyond-the-chart.html`
- `mirror.js`
- `styles.css`

**Full version:** Unzip `A_Suitable_Complexion_V15_Colour_Grading_Full_Exhibition.zip`. It contains the complete `a-suitable-complexion/` directory, to replace the existing exhibition folder.

If the site is already deployed, refresh with cache bypass after replacing the files. The HTML now references versioned stylesheet and mirror script URLs to minimize stale caching.

No repository changes or deployment were made by ChatGPT.

## What to try

Turn on your camera and compare the three new **EXHIBITION COLOUR GRADE** presets:

- **ORIGINAL (default):** The approved V14 rendering, no grade applied.
- **GALLERY:** Gentle contrast shaping and moderate vibrance/saturation to make colourful garments clearer without an aggressive filter.
- **VIVID:** Stronger contrast and colour richness as a candidate for matching the graphic, festive look of the exhibition paintings.

Keep **Illustrated Features: ON** and try both positions of **Simplified Portrait** and **Garment & Hair Detail**. The new grade is applied *after* the earlier rendering preparation and *before* the skin is assigned its exact palette colour. Eye and lip details are restored from the same graded image, avoiding mismatched patches.

## Feedback that will help

1. Which preset, if any, makes garments and embroidery feel closest to the paintings?
2. Does Vivid crush dark fabrics or blow out jewellery highlights?
3. Does the result become too warm, too saturated, or overly processed under different lighting?
4. Do your facial contours and skin colours remain clean and aligned while moving?
5. Is performance still usable on phone and laptop?

## Technical and privacy notes

- The seven palette values remain exactly `#F0D5BC`, `#DDB58F`, `#C99870`, `#AC7953`, `#926143`, `#70482F`, and `#4B3025` on fully segmented skin pixels.
- Colour adjustments are applied on-device to the image rendered for viewing; the input used by the MediaPipe tracking models is unchanged.
- Camera access remains optional and permission based. Camera frames are not recorded, stored, or uploaded by exhibition code.
- MediaPipe code/model assets are downloaded when the camera is enabled, so an internet connection is necessary on first use.
- Colour grading affects non-skin parts of the frame, including clothing, hair, jewellery, background, and the preserved eye/lip image details; it does not preserve the ungraded photo globally.
- If segmentation fails to load, the V14 tint fallback is shown with the selected colour grade, and the seven-shade demonstration still works.

## Validation scope

- Javascript syntax check and ZIP integrity check.
- Browser interaction checks at desktop/mobile widths using synthetic HTML and scripts; grade controls, prior V14 toggles, random assignment and shade buttons.
- Synthetic pixel checks confirmed a fixed palette value on segmented skin and observable colour changes on garment pixels.
- **Not validated:** Real webcam tracking and photographic results on the visitor's device. Please compare live on your HTTPS preview deployment.
