# A Suitable Complexion — V14 Stage 4: Garment & Hair Detail

## The requested rollback

This build starts from **V12**, not V13. The V13 **Refined Skin Edges** switch and its special eyebrow rendering are absent. V12's illustrated feature contours, stage-2 Simplified Portrait switch, seven fixed colours, random mirror button and corrected frame alignment remain unchanged.

## New: Garment & Hair Detail (OFF by default)

- **OFF:** Original V12 image processing. It is the direct A/B baseline.
- **ON:** Restores much of the original fine detail in regions classified as clothing, hair and accessories. Adds a restrained monochromatic (same RGB shift) local-detail contrast adjustment to make embroidery, fabric edges and hair strands a little crisper. No global saturation, brightness, white balance or contrast grading is added.
- The existing model supplies classes `1 = hair`, `4 = clothing` and `5 = others/accessories`. Jewellery may be interpreted as clothing or accessories, but tiny pieces are not always separately identified.
- Skin classes `2 = body-skin` and `3 = face-skin` still use the unchanged V12 flat fill; the extra detail processing is never applied to them.
- In **Simplified Portrait ON** mode, Garment & Hair Detail restores more original textile texture while the rest of the image remains simplified.

## Installation

**Small patch (recommended):** Extract the three files from `A_Suitable_Complexion_V14_Stage4_Mirror_Patch.zip` and copy them into the existing `exhibitions/a-suitable-complexion/` folder, replacing the existing same-named files:

- `beyond-the-chart.html`
- `mirror.js`
- `styles.css`

This also removes the V13 edge-refinement controls even if you are replacing V13 in-place.

**Full ZIP:** Extract and put the contained `a-suitable-complexion/` folder under `exhibitions/` (merging/replacing your local review copy). No repository was edited or deployed by the assistant.

## Test plan

1. Load `beyond-the-chart.html` from **HTTPS or localhost**, approve camera access, keep **Illustrated Features: ON**.
2. Keep **Simplified Portrait: OFF**. Toggle **Garment & Hair Detail: ON/OFF** while showing textured clothes or jewellery to the camera. Skin colour and face contours should not change.
3. Set **Simplified Portrait: ON** and repeat. The difference should be easier to see: textile patterns should regain more photographic detail while the skin stays uniformly classified.
4. Move your head and hands; check for edge shimmer at hair and sleeve boundaries. Report whether the enhancement is too subtle, too sharp, or slows down your phone.
5. Check the **Let the Mirror Decide** and 01–07 shade picker still work and the frame remains aligned.

## Validation and limits

- JavaScript syntax: passed.
- Static HTML and local asset references: passed.
- Synthetic pixel test: passed (background and skin match V12; eligible clothing pixels are enhanced in both modes).
- Toggle/state smoke test: passed.
- Browser-based layout test: **not completed** because this environment blocked the local test server (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- Real-camera rendering: **not verified**. Please test with your deployed HTTPS preview.
- Model and WASM files still load from MediaPipe's external CDNs when the visitor enables the camera. Frames are processed locally; the site does not save or upload camera content.
