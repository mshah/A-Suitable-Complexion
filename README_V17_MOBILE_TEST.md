# A Suitable Complexion — V17 mobile preview

V17 uses the approved V16 rendering pipeline. **The only functional change** is to replace the portrait-simplification and colour-grade choice groups with two independent ON/OFF controls, both starting **ON**.

| Control | ON (default) | OFF |
|---|---|---|
| More Flat Portrait | V16 stronger five-band posterization and smoothing | Original, unsimplified video base (face/skin painting remains active) |
| Gallery Colour Grade | V15 Gallery colour treatment | Original, ungraded colour (flat skin assignment remains active) |

The two settings are independent. Switching both OFF gives you the basic ungraded/unsimplified video rendering **with the flat skin painter and Illustrated Features still enabled**. The seven HEX shades, face tracking, fixed mirror alignment, garment-detail toggle and random assignment are unchanged. V13 refined edges remain excluded.

## Installation — mirror-only patch

1. Make a backup of your current `exhibitions/a-suitable-complexion/` folder.
2. Extract the patch ZIP.
3. Copy **`beyond-the-chart.html`**, **`mirror.js`**, and **`styles.css`** into `exhibitions/a-suitable-complexion/`, replacing those three files.
4. Open your HTTPS-hosted `beyond-the-chart.html` page on your phone and refresh. The HTML includes versioned CSS and JavaScript URLs to reduce stale-cache problems.

You can alternatively replace the whole `a-suitable-complexion/` folder from the full ZIP. The full ZIP includes the existing paintings, editorial pages, research archive, and this README. Nothing is deployed automatically.

## Phone test

- Allow camera access. The mirror should work over HTTPS on Safari/Chrome, but permissions and performance depend on device/browser.
- Confirm the page starts with **More Flat Portrait: ON** and **Gallery Colour Grade: ON**.
- Turn **More Flat** OFF and ON while keeping Gallery ON; look at clothing/hair and smoothness of motion.
- Turn **Gallery** OFF and ON while keeping More Flat ON; look for a change in textile colour/contrast, not in painted skin colour.
- Try both OFF and both ON; confirm facial outlines stay aligned while smiling and turning your head.
- Test several of the seven shades, plus **Let the Mirror Decide**; check mobile scrolling, control size, and camera stop/start.

## Privacy and limitations

Camera permission is optional. The camera is processed in the browser; frames are not saved or uploaded by this mirror. When you enable the camera, the page loads MediaPipe model/code assets from external CDNs. Flat fills are illustrative and do not measure the visitor's true complexion.

The JavaScript syntax, HTML link paths, ZIP integrity and a simulated no-camera interaction test were checked. A live camera test on a real phone has **not** been performed in the build environment.
