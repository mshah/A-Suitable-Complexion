# V11.1 — mirror alignment correction (Stage 1 only)

This build addresses the displaced skin-fill/feature drawing shown in the 27 October camera screenshot. It does NOT begin Stage 2 or adjust contrast/saturation.

## Change

The camera can return a 4:3 or 16:9 video even though the exhibit mirror is tall and narrow. Previously, the code cropped/scaled the visible canvas separately from the model inputs, and flipped segmentation and landmarks after inference. This could produce a feature mask displaced from the reflected face.

In V11.1, the site first crops the camera into the mirror's **exact portrait-shaped field**, mirrors it once, and passes that same canvas frame to both MediaPipe models. The displayed image, coloured skin mask, and facial landmarks all use the same coordinates; no separate flipping or CSS object-fit remapping.

## Install

- For an existing V11 deployment, use the **patch ZIP**. Copy its `mirror.js`, `styles.css`, and `beyond-the-chart.html` over your exhibition files. The HTML includes `?v=11-1` query strings to bypass stale browser-cached JS/CSS.
- Or use the **full ZIP** to replace the entire `a-suitable-complexion` folder.
- Camera access still requires HTTPS or localhost. MediaPipe scripts/models load only when the visitor chooses the camera.

## Test

1. Enable the mirror camera with Illustrated Features ON.
2. Check that the *actual* eyes and mouth are inside the drawn eye/lip outlines and that the skin area lies over your face rather than beside it.
3. Change from 02 to 07; the outline position must not move.
4. Turn your head, lean left/right/up/down, and try smiling.
5. Toggle Illustrated Features OFF to isolate the skin mask; repeat in portrait and landscape phone orientations if practical.

If you still see displacement, send a screenshot plus your browser/device and whether the camera preview is mirrored. Those details will help isolate any remaining MediaPipe model or browser-specific transform.

## Limits

The skin segmenter still has a relatively coarse mask, so edge and lip/eye restoration may still need refinement after alignment. No camera images are saved or transmitted by the exhibition page.
