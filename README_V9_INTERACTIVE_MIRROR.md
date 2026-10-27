# A Suitable Complexion — V9 interactive mirror

## Install

**Complete website:** Extract `A_Suitable_Complexion_Private_Review_V9_Interactive_Mirror.zip`. Copy the enclosed `a-suitable-complexion/` directory into `exhibitions/`, replacing the previous version. No changes to the root A-Thrice site or GitHub deployment configuration are needed.

**Selective patch:** Extract `A_Suitable_Complexion_V9_Mirror_Only_Patch.zip` and copy these files into `exhibitions/a-suitable-complexion/`:
- `beyond-the-chart.html` — interactive mirror markup, narrative invitation
- `styles.css` — all pre-existing site CSS plus mirror styling
- `mirror.js` — new local mirror controls and camera behavior

If you've edited `beyond-the-chart.html` or `styles.css` locally, merge the changed markup/CSS instead of replacing your customization.

## Interaction

The mirror on **Beyond the Chart** now supports:
- Seven interactive swatches, 01–07, using the fixed project palette
- Previous/next selection and a start/pause cycling control
- Optional live front-facing camera display in the mirror frame
- A translucent aesthetic tint and a category label; neither is a complexion measurement
- Camera-free fallback with a silhouette and the same classification controls

**Camera is OFF by default.** A visitor must click *Use my camera* and then explicitly grant browser permission. Only video is requested, never audio. A visitor can turn the camera off, and the stream is also stopped when the page is hidden or left. No camera frames are sampled, saved, sent to a server, matched against skin, or analyzed with face detection. Nothing is stored in browser local storage.

## Local camera testing

You can review the swatches by opening `beyond-the-chart.html` directly. For reliable webcam testing, load your website on **HTTPS** (such as your GitHub preview domain) or on a **localhost** development server. Modern browser `getUserMedia` APIs require a secure context and permission; their behavior may vary between browsers, local file URLs and privacy settings.

From the **repository root**, you can run:

```
python -m http.server 8000
```

Then open:

```
http://localhost:8000/exhibitions/a-suitable-complexion/beyond-the-chart.html
```

When opening the exhibition inside an iframe, the parent may need `allow="camera"` and must not forbid camera through its Permissions Policy.

## Testing and limitations

- Checked all seven swatch labels, previous/next, cycle on/off, responsive width at 1440px and 390px, and JavaScript runtime errors in a browser test environment.
- Verified camera start/stop and lifecycle UI with a simulated camera stream.
- Actual permission prompts, live camera hardware, mobile Safari and Android Chrome still require your local or HTTPS preview-site testing.
- No automated skin-tone matching has been implemented intentionally: the artwork questions the supposed precision of these categories.

## Concept note

"The face stays the same. The number changes."

This is an interactive demonstration of the instability and social construction of a classification—not a skin-tone detector, a biometric system, or a test of the visitor.

Nothing has been pushed to GitHub.
