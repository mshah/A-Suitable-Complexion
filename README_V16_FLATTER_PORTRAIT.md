# A Suitable Complexion — V16: Flatter Portrait

## What changed

V16 keeps the **V15 Gallery colour grade** as the new default, as requested. The old `SIMPLIFIED PORTRAIT: OFF/ON` toggle is replaced by three mutually exclusive choices:

- **OFF** — original V15 camera rendering (with the existing colour grade and flat skin assignment)
- **SOFT · V15** — the existing eight-band posterization and gentle smoothing, unmodified
- **MORE FLAT · V16** — five broader tonal bands, stronger smoothing and modest consolidation of similar hues in non-skin regions

**MORE FLAT** is selected initially so you can evaluate it immediately. These options control only the illustrated base. The seven opaque complexion colours are still exact, and the aligned eyes, mouth, nose and jaw are unchanged. The **Illustrated Features**, **Garment & Hair Detail**, shade palette and **Let the Mirror Decide** controls are retained. V13 refined-edge behavior is not included.

## Install

**Small patch:** Extract `A_Suitable_Complexion_V16_Flatter_Portrait_Mirror_Patch.zip` directly into `exhibitions/a-suitable-complexion/`, replacing:

- `beyond-the-chart.html`
- `mirror.js`
- `styles.css`

**Full website:** Extract `A_Suitable_Complexion_V16_Flatter_Portrait_Full_Exhibition.zip` so that `a-suitable-complexion/` replaces the existing exhibition folder. This ZIP includes all artwork assets and site pages from V15, unchanged except for this mirror update.

Neither package is uploaded to or deployed on GitHub automatically.

## How to evaluate

1. Open **Beyond the Chart** on your HTTPS preview and enable the camera.
2. Leave **Exhibition Colour Grade** on **Gallery**.
3. Leave **Illustrated Features** ON. Start with Garment & Hair Detail OFF so you can see simplification clearly.
4. Compare **OFF → SOFT · V15 → MORE FLAT · V16** without moving the camera or changing the lighting.
5. Then enable Garment & Hair Detail and repeat the comparison. Stage 4 will restore fabric and hair detail selectively by design.
6. Try different complexion assignments. The flat filled skin should not change in tone when you switch portrait modes.

Pay attention to broad planes of colour in hair and background, fabric texture and line smoothness, and whether the stronger treatment flickers or loses detail. The goal is closer to our painted exhibition images, not a generic beauty filter.

## Technical detail

- SOFT uses the existing 8 luminance bands, 0.85 px smoothing and 0.88 posterization strength.
- MORE FLAT uses 5 luminance bands, 1.35 px smoothing, 0.98 posterization strength and slight chroma-band consolidation.
- The colour-grading preset is processed **after** the illustration step and **before** the final skin-colour assignment.
- ML inference uses the same original canonical camera frame as V11.1; changing the portrait mode does not change the face or skin coordinate system.
- No automatic shade estimation, recording, or image uploading is introduced. MediaPipe library/model files still load from their CDNs after camera opt-in.

## Validation scope

- JavaScript syntax validation passed.
- Desktop/mobile interactive controls passed in a self-contained headless browser test (without requesting a webcam).
- Synthetic canvas tests confirmed different image output from SOFT and MORE FLAT, while selected interior skin pixels remained the exact palette colour.
- ZIP integrity and local page references validated.
- **Not yet tested:** actual live webcam performance, rendering appearance, and frame-to-frame stability in a deployed browser. Please assess these on your device.
