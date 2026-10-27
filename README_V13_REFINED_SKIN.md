# V13 — Stage 3: Refined Skin Edges

This is a private local-review build based on V12. Nothing is deployed.

## What changed

- Adds **REFINED SKIN EDGES ON/OFF** (ON by default). OFF uses the original V12 painter.
- Uses the existing skin segmentation mask in a smoother, anti-aliased flat-colour compositor.
- Excludes the eye, lip and eyebrow regions using the existing facial landmarks; facial contours remain individually toggleable.
- Retains the exact seven hex shades inside the painted skin areas. Small edge pixels blend to the unmodified reflection.
- Keeps the corrected V11.1 coordinate system: one cropped mirrored frame is used for both models and output.
- Leaves V12 simplification, saturation, background and garment colours unchanged.

## Recommended test

1. Serve the folder on HTTPS or localhost and open `beyond-the-chart.html`.
2. Enable the camera, switch to shade 07, and leave Illustrated Features ON.
3. Toggle Refined Skin Edges OFF/ON. Look closely at the hairline, eyes, brows, lips, ears, neck and fingers.
4. Try a side profile, smile, move your hands into view and test in different lighting.
5. If the face cuts out too much near eyes/mouth or the boundary shimmers, take a screenshot and note browser/device.

## Scope and privacy

Live face-model inference and segmentation run in the browser. The models are loaded from the external MediaPipe CDN and Google-hosted model files after camera permission. The application does not save or upload camera frames. There is no complexion measurement or identity recognition.

## Installing the patch

Extract the small patch into your current `exhibitions/a-suitable-complexion/` folder, replacing `beyond-the-chart.html`, `mirror.js`, and `styles.css`. Use the full ZIP to replace the entire exhibition folder. Preserve locally edited HTML/CSS by merging rather than overwriting if needed.
