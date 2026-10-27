# A Suitable Complexion · V11 — Stage 1: Illustrated facial features

**Private test build.** Stage 1 only. Stages 2–4 are not implemented.

## What changed

- Added **MediaPipe Face Landmarker**, which tracks one face in real time.
- Drew restrained ink-like outlines around the **eyes, eyebrows, nose, lips and jaw** over the existing seven-shade flat-colour skin treatment.
- Restored the visitor's **original eye and lip detail inside their landmark boundaries**, leaving skin between those boundaries flat.
- Corrected V10's **mirrored segmentation-mask alignment**, which previously made the flat colour drift to the wrong side of facial features.
- Added **ILLUSTRATED FEATURES: ON / OFF** to isolate the new outlines for comparison.
- Preserved **LET THE MIRROR DECIDE**, cycling, shade-picker controls, camera privacy, and the rest of the exhibition unchanged.
- Removed the older semi-transparent global video wash while the flat-skin canvas is visible.

## Install

If your V10 exhibition is already installed, extract `A_Suitable_Complexion_V11_Stage1_Mirror_Patch.zip` directly into `exhibitions/a-suitable-complexion/`, replacing these **three** files:

- `beyond-the-chart.html`
- `mirror.js`
- `styles.css`

Alternatively, extract `A_Suitable_Complexion_V11_Stage1_Full_Exhibition.zip`, then copy its `a-suitable-complexion/` folder to your site's `exhibitions/` directory. This overwrites the whole local exhibition folder.

The page uses versioned links (`mirror.js?v=11`, `styles.css?v=11`) to reduce caching problems after deployment.

## Test checklist

1. Open `beyond-the-chart.html` **over HTTPS or localhost**. Enable the camera.
2. Wait for both the skin segmentation and face model to load (requires internet access to download model/code files).
3. Confirm your **eyelids/eyes, brows, lips, nose and jawline** are visible over the selected flat skin shade.
4. Toggle **ILLUSTRATED FEATURES** between ON and OFF. The OFF state should show the V10 flat-fill effect; ON should restore feature detail and contour lines.
5. Test palette shades **01**, **03**, and **07**, then **LET THE MIRROR DECIDE**.
6. Smile, turn left/right, blink, speak, and vary your distance from the camera. Check line jitter, edge alignment, missing brows and clipping around the mouth.
7. Try a mobile browser. Note if the video becomes choppy, or if model loading fails.
8. Turn off the camera; check that the fallback illustration and picker remain usable.

## Intentional limits of Stage 1

- This is **not yet a full comic-style conversion**. Clothing, hair, background and untinted regions remain photographic.
- Skin is still painted by the V10 256 × 256 segmentation model; it can be inaccurate around fingers, glasses and hairlines.
- Face lines are generated from geometric landmarks and may look overly schematic or jittery, particularly at angles and in poor light.
- If Face Landmarker cannot load, the flat-skin filter still runs without feature outlines. If both fail, the mirror uses the previous simple tint fallback.
- Camera frames stay in-browser and are not captured, uploaded or stored by our website. The browser fetches the ML libraries and model files from their public CDNs.
- One face is tracked at a time.

## Next stages — do not implement until this test is reviewed

1. **Stage 1 (this build):** Face-feature line art and contours.
2. **Stage 2:** Tone simplification / posterization under the line art.
3. **Stage 3:** Cleaner region fill and contour-fitting skin masks.
4. **Stage 4:** Clothing, jewellery and background treatment, preserving garment detail.

Later: revisit saturation, contrast and overall colour grading.

**Nothing has been pushed to GitHub.**
