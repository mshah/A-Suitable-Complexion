/* A Suitable Complexion, V17 — mobile-preview defaults (built on V16).
   Camera processing stays entirely in the browser. We don't measure complexion,
   recognize visitors, save frames, or transmit camera images to any server.
   External MediaPipe code and pretrained model files load only after camera opt-in.
*/
(() => {
  'use strict';
  const root = document.getElementById('mirrorExperience');
  if (!root) return;

  const palette = [
    {id:'01', label:'Very Fair', color:'#F0D5BC'},
    {id:'02', label:'Fair', color:'#DDB58F'},
    {id:'03', label:'Wheatish', color:'#C99870'},
    {id:'04', label:'Wheatish Medium', color:'#AC7953'},
    {id:'05', label:'Wheatish Brown', color:'#926143'},
    {id:'06', label:'Wheatish Dark', color:'#70482F'},
    {id:'07', label:'Dark', color:'#4B3025'}
  ];
  const SKIN_CLASSES = new Set([2, 3]);
  const SEGMENT_MODEL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';
  const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  const WASM_URL = VISION_URL + '/wasm';
  const $ = selector => root.querySelector(selector);
  const chips = [...root.querySelectorAll('.mirror-chip')];
  const number = $('#mirrorAssignedNum');
  const selectedLabel = $('#mirrorSelectedLabel');
  const previous = $('#mirrorPrevious');
  const next = $('#mirrorNext');
  const cycle = $('#mirrorCycle');
  const decide = $('#mirrorDecide');
  const linesButton = $('#mirrorFeatureLines');
  const simplifyButton = $('#mirrorMoreFlat');
  const detailsButton = $('#mirrorDetails');
  const gradeButton = $('#mirrorGalleryGrade');
  const start = $('#mirrorStartCamera');
  const stop = $('#mirrorStopCamera');
  const status = $('#mirrorStatus');
  const video = $('#mirrorVideo');
  const canvas = $('#mirrorCanvas');
  const offline = $('#mirrorOffline');
  if (!canvas || !linesButton || !detailsButton || !gradeButton || !simplifyButton) return;

  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently:true });
  // This optional render-only layer NEVER feeds either ML model.
  // Tracking always uses the same original, mirrored sourceCanvas as V11.1.
  const stylizedCanvas = document.createElement('canvas');
  const stylizedCtx = stylizedCanvas.getContext('2d', { willReadFrequently:true });
  // Optional colour-graded source for restoring eye and lip pixels consistently.
  // Neither this canvas nor the colour-graded video is ever sent to the ML models.
  const featureSourceCanvas = document.createElement('canvas');
  const featureSourceCtx = featureSourceCanvas.getContext('2d');

  let index = 2;
  let showLines = true;
  let simplifyPortrait = true; // V16 stronger finish selected by default.
  let simplificationMode = 'flat'; // ON = stronger V16, OFF = unsimplified baseline.
  let preserveDetails = false; // OFF = V12 detail baseline.
  let gradePreset = 'gallery'; // ON = V15 Gallery grade; OFF = original ungraded base.
  let cycleTimer = null;
  let decideTimer = null;
  let stream = null;
  let requestSerial = 0;
  let rafId = null;
  let segmenter = null;
  let faceLandmarker = null;
  let segmenterLoad = null;
  let faceLoad = null;
  let visionFilesetLoad = null;
  let lastVideoTime = -1;
  let lastProcessedAt = -Infinity;
  let firstFrameRendered = false;
  let featureWarningShown = false;
  const MIN_FRAME_INTERVAL_MS = 95; // mobile-friendly cap; ML calls run on main thread.

  function setStatus(message) { status.textContent = message; }
  function rgb(hex) { return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)); }

  function changeClassification(i, {silent=false} = {}) {
    index = ((i % palette.length) + palette.length) % palette.length;
    const c = palette[index];
    number.textContent = c.id;
    selectedLabel.textContent = c.id + ' · ' + c.label;
    root.style.setProperty('--mirror-color',c.color);
    chips.forEach((button,j)=>button.setAttribute('aria-pressed',String(index===j)));
    if (!silent && stream) setStatus('Assigned ' + c.id + ' · ' + c.label + '. The face stays the same; the category changes.');
  }
  function pauseCycle() {
    if (cycleTimer != null) clearInterval(cycleTimer);
    cycleTimer = null;
    cycle.setAttribute('aria-pressed','false');
    cycle.textContent = 'CYCLE THE LABELS ↻';
  }
  function stopRandom() {
    if (decideTimer != null) clearInterval(decideTimer);
    decideTimer = null;
    decide.disabled = false;
  }
  chips.forEach((button,j)=>button.addEventListener('click',()=>{pauseCycle();stopRandom();changeClassification(j)}));
  previous.addEventListener('click',()=>{pauseCycle();stopRandom();changeClassification(index-1)});
  next.addEventListener('click',()=>{pauseCycle();stopRandom();changeClassification(index+1)});
  cycle.addEventListener('click',()=>{
    stopRandom();
    if (cycleTimer !== null) { pauseCycle(); setStatus('Automatic cycling paused.'); return; }
    changeClassification(index+1,{silent:true});
    cycleTimer = setInterval(()=>changeClassification(index+1,{silent:true}),1150);
    cycle.textContent = 'PAUSE THE LABELS Ⅱ';
    cycle.setAttribute('aria-pressed','true');
    setStatus('Labels are cycling. The person does not change.');
  });
  decide.addEventListener('click',()=>{
    pauseCycle(); stopRandom();
    const target = Math.floor(Math.random()*palette.length); // This is NOT a skin-tone estimate.
    const steps = 10 + Math.floor(Math.random()*5);
    let count = 0;
    decide.disabled = true;
    setStatus('The mirror is choosing arbitrarily. It does not measure your skin.');
    decideTimer = setInterval(()=>{
      count++;
      changeClassification(count < steps ? index+1 : target,{silent:true});
      if(count>=steps){
        stopRandom();
        setStatus('The mirror chose '+palette[index].id+' · '+palette[index].label+'. A random assignment, not an assessment.');
      }
    },125);
  });
  linesButton.addEventListener('click',()=>{
    showLines = !showLines;
    linesButton.setAttribute('aria-pressed',String(showLines));
    linesButton.textContent='ILLUSTRATED FEATURES: ' + (showLines ? 'ON' : 'OFF');
    if(stream) setStatus(showLines ? 'Illustrated contours enabled. Look straight at the mirror to track eyes, brows, nose, lips and jaw.' : 'Illustrated contours disabled. Comparing against the plain V10 flat fill.');
  });

  const SIMPLIFY_MODES = {
    off: { label:'OFF' },
    soft: { label:'SOFT · V15', blur:.85, lumaLevels:8, strength:.88, chromaStep:0, chromaMix:0 },
    flat: { label:'MORE FLAT · V16', blur:1.35, lumaLevels:5, strength:.98, chromaStep:18, chromaMix:.48 }
  };
  function setMoreFlatEnabled(enabled) {
    simplifyPortrait = Boolean(enabled);
    simplificationMode = enabled ? 'flat' : 'off';
    simplifyButton.setAttribute('aria-pressed', String(simplifyPortrait));
    simplifyButton.textContent = 'MORE FLAT PORTRAIT: ' + (simplifyPortrait ? 'ON' : 'OFF');
    setStatus((simplifyPortrait
      ? 'More Flat ON: stronger smoothing and five broad tonal bands.'
      : 'More Flat OFF: no portrait posterization or simplification.')
      + ' Skin classifications stay exact.' + (!stream ? ' Turn on your camera to compare.' : ''));
  }
  simplifyButton.addEventListener('click', () => setMoreFlatEnabled(!simplifyPortrait));

  detailsButton.addEventListener('click', () => {
    preserveDetails = !preserveDetails;
    detailsButton.setAttribute('aria-pressed', String(preserveDetails));
    detailsButton.textContent = 'GARMENT & HAIR DETAIL: ' + (preserveDetails ? 'ON' : 'OFF');
    setStatus(preserveDetails
      ? 'Garment & Hair Detail on: restores hair, fabric and accessory texture without changing skin colours.'
      : 'Garment & Hair Detail off: showing the original V12 rendering.');
  });


  // The grade controls are mutually exclusive. ORIGINAL is the zero-adjustment
  // V14 comparison mode; neither grading nor ML classification occurs there.
  const GRADES = {
    original: { name:'Original', contrast:0, saturation:1, vibrance:0, warmth:0, lift:0 },
    gallery:  { name:'Gallery', contrast:.26, saturation:1.10, vibrance:.12, warmth:2, lift:1 },
    vivid:    { name:'Vivid', contrast:.40, saturation:1.19, vibrance:.17, warmth:3.5, lift:1.5 }
  };
  function setGalleryGradeEnabled(enabled) {
    gradePreset = enabled ? 'gallery' : 'original';
    gradeButton.setAttribute('aria-pressed', String(enabled));
    gradeButton.textContent = 'GALLERY COLOUR GRADE: ' + (enabled ? 'ON' : 'OFF');
    setStatus((enabled
      ? 'Gallery grade ON: richer textile colours and gentle contrast.'
      : 'Gallery grade OFF: original ungraded colours.')
      + ' Assigned skin colours remain exact.' + (!stream ? ' Turn on your camera to compare.' : ''));
  }
  gradeButton.addEventListener('click', () => setGalleryGradeEnabled(gradePreset !== 'gallery'));

  function clampChannel(v) { return v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v); }
  // Contrast acts on luminance through a soft S curve. Vibrance selectively
  // brings up lower-chroma colours, avoiding extreme saturation in bold garments.
  // RGB hues are preserved by using the same luminance shift on all channels.
  // IMPORTANT: this is a display treatment, not complexion estimation.
  function applyExhibitionGrade(image) {
    const grade = GRADES[gradePreset];
    if (gradePreset === 'original') return image;
    const px = image.data;
    for (let p=0; p<px.length; p+=4) {
      const r=px[p], g=px[p+1], b=px[p+2];
      const l=.2126*r + .7152*g + .0722*b;
      const x=l/255;
      const curved=x*x*(3-2*x);
      const shift=(curved-x)*255*grade.contrast + grade.lift*(1-Math.abs(2*x-1));
      const chroma=(Math.max(r,g,b)-Math.min(r,g,b))/255;
      const sat=grade.saturation + grade.vibrance*Math.pow(1-chroma,2);
      px[p]=clampChannel(l+(r-l)*sat+shift+grade.warmth);
      px[p+1]=clampChannel(l+(g-l)*sat+shift);
      px[p+2]=clampChannel(l+(b-l)*sat+shift-grade.warmth*.7);
    }
    return image;
  }

  async function fileset() {
    if(!visionFilesetLoad) visionFilesetLoad = (async()=>{
      const vision = await import(VISION_URL);
      const wasm = await vision.FilesetResolver.forVisionTasks(WASM_URL);
      return {vision,wasm};
    })();
    return visionFilesetLoad;
  }
  async function loadSegmenter() {
    if(segmenter) return segmenter;
    if(!segmenterLoad) segmenterLoad = (async()=>{
      const {vision,wasm} = await fileset();
      return vision.ImageSegmenter.createFromOptions(wasm,{
        baseOptions:{modelAssetPath:SEGMENT_MODEL},
        runningMode:'VIDEO', outputCategoryMask:true, outputConfidenceMasks:false
      });
    })().then(instance=>{segmenter=instance;return instance}).catch(error=>{
      console.warn('Skin segmentation unavailable',error);
      segmenterLoad = null;
      return null;
    });
    return segmenterLoad;
  }
  async function loadFaceLandmarker() {
    if(faceLandmarker) return faceLandmarker;
    if(!faceLoad) faceLoad = (async()=>{
      const {vision,wasm} = await fileset();
      return vision.FaceLandmarker.createFromOptions(wasm,{
        baseOptions:{modelAssetPath:FACE_MODEL,delegate:'CPU'},
        runningMode:'VIDEO',numFaces:1,
        minFaceDetectionConfidence:.55,minTrackingConfidence:.5,
        outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false
      });
    })().then(instance=>{faceLandmarker=instance;return instance}).catch(error=>{
      console.warn('Facial outlines unavailable',error);
      faceLoad = null;
      return null;
    });
    return faceLoad;
  }

  // Use one canonical, viewport-shaped image for preview AND both ML models.
  // A camera can deliver landscape video even into our portrait-shaped mirror.
  // V11 used different transformations for the video, landmarks, and mask;
  // this crop-and-mirror is the SINGLE coordinate system for all three.
  const viewport = root.querySelector('.mirror-viewport');
  function canvasSize() {
    const rect = viewport.getBoundingClientRect();
    // Keep the backing canvas in precisely the same aspect ratio as the CSS mirror.
    // At most ~480x640 physical pixels for responsive browser inference.
    const displayW = Math.max(1, rect.width || viewport.clientWidth || 320);
    const displayH = Math.max(1, rect.height || viewport.clientHeight || 420);
    const scale = Math.min(1.5, 480/displayW, 640/displayH);
    const w = Math.max(1, Math.round(displayW*scale));
    const h = Math.max(1, Math.round(displayH*scale));
    if(canvas.width !== w || canvas.height !== h) {
      canvas.width = sourceCanvas.width = stylizedCanvas.width = featureSourceCanvas.width = w;
      canvas.height = sourceCanvas.height = stylizedCanvas.height = featureSourceCanvas.height = h;
    }
  }
  function mirroredPhoto() {
    const w = sourceCanvas.width, h = sourceCanvas.height;
    const vw = video.videoWidth || w, vh = video.videoHeight || h;
    const sourceAspect = vw/vh, destinationAspect = w/h;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    // Exactly replicate object-fit:cover, but INSIDE the image supplied to ML.
    if (sourceAspect > destinationAspect) {
      sw = vh * destinationAspect;
      sx = (vw - sw)/2;
    } else {
      sh = vw / destinationAspect;
      sy = (vh - sh)/2;
    }
    sourceCtx.save();
    sourceCtx.clearRect(0,0,w,h);
    sourceCtx.translate(w,0);
    sourceCtx.scale(-1,1);
    sourceCtx.drawImage(video,sx,sy,sw,sh,0,0,w,h);
    sourceCtx.restore();
  }
  // V16: two entirely optional rendering recipes on the EXACT SAME source image.
  // OFF uses the untouched original. SOFT reproduces V15's V12 recipe bit-for-bit.
  // MORE FLAT has five luminance bands and gentle chroma palette consolidation,
  // making large, even graphic shapes. This is NOT applied to classified skin:
  // those pixels are replaced afterwards by their immutable exhibit HEX codes.
  // Neither simplified frame is used for ML inference, avoiding landmark drift.
  function prepareSimplifiedPortrait() {
    const preset = SIMPLIFY_MODES[simplificationMode];
    if (!preset || !preset.lumaLevels) return;
    const w = sourceCanvas.width, h = sourceCanvas.height;
    stylizedCtx.clearRect(0, 0, w, h);
    stylizedCtx.drawImage(sourceCanvas, 0, 0);
    stylizedCtx.save();
    if ('filter' in stylizedCtx) stylizedCtx.filter = 'blur(' + preset.blur + 'px)';
    stylizedCtx.drawImage(sourceCanvas, 0, 0);
    stylizedCtx.restore();
    const image = stylizedCtx.getImageData(0, 0, w, h);
    const pixels = image.data;
    const step = 255 / (preset.lumaLevels - 1);
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const r = pixels[offset], g = pixels[offset+1], b = pixels[offset+2];
      const lightness = r * .2126 + g * .7152 + b * .0722;
      const band = Math.min(255, Math.round(lightness / step) * step);
      const shift = (band - lightness) * preset.strength;
      if (preset.chromaStep) {
        // Consolidate subtle variations in garment/background hues without
        // changing overall saturation or applying a separate colour grade.
        const chroma = [r-lightness, g-lightness, b-lightness];
        for (let c = 0; c < 3; c++) {
          const snapped = Math.round(chroma[c] / preset.chromaStep) * preset.chromaStep;
          const change = (snapped - chroma[c]) * preset.chromaMix;
          pixels[offset+c] = Math.max(0, Math.min(255, [r,g,b][c] + shift + change));
        }
      } else {
        // Preserve V15 SOFT exactly so it is a reliable A/B control.
        pixels[offset]   = Math.max(0, Math.min(255, r + shift));
        pixels[offset+1] = Math.max(0, Math.min(255, g + shift));
        pixels[offset+2] = Math.max(0, Math.min(255, b + shift));
      }
    }
    stylizedCtx.putImageData(image, 0, 0);
  }
  function currentRenderBase() {
    return simplifyPortrait ? stylizedCanvas : sourceCanvas;
  }

  // Stage 4: keep the existing V12 rendering untouched unless explicitly enabled.
  // The selfie multiclass model labels 1=hair, 4=clothing, 5=other/accessories.
  // We preserve V12's 2=body skin and 3=face skin completely: no outlining,
  // no blending, no grade changes, and no extra eyebrow-edge outlines.
  // This passes only RGB data to the existing V12 paintSkin() step.
  const DETAIL_CLASSES = new Set([1, 4, 5]);
  function detailPreservedFrame(mask) {
    const w = sourceCanvas.width, h = sourceCanvas.height;
    const sourcePixels = sourceCtx.getImageData(0, 0, w, h).data;
    const result = (simplifyPortrait ? stylizedCtx : sourceCtx).getImageData(0, 0, w, h);
    const pixels = result.data;
    const categories = mask.getAsUint8Array();
    const mw = mask.width, mh = mask.height;
    const xs = new Uint16Array(w);
    const rowStride = w * 4;
    for (let x = 0; x < w; x++) xs[x] = Math.min(mw-1, Math.floor(x * mw/w));
    // One-pass neutral-color luminance detail enhancement, bounded to ±15 levels.
    // Interior high-frequency patterns become clearer; edge pixels deliberately
    // receive less enhancement to avoid halos against the flat skin colour.
    for (let y = 1; y < h-1; y++) {
      const sy = Math.min(mh-1, Math.floor(y * mh/h));
      const maskRow = sy * mw;
      const line = y * rowStride;
      for (let x = 1; x < w-1; x++) {
        const sx = xs[x], cls = categories[maskRow+sx];
        if (!DETAIL_CLASSES.has(cls)) continue;
        const p = line + x*4;
        const l = (sourcePixels[p]*.2126+sourcePixels[p+1]*.7152+sourcePixels[p+2]*.0722);
        const left = p-4, right=p+4, above=p-rowStride, below=p+rowStride;
        const neighbor = (
          sourcePixels[left]*.2126+sourcePixels[left+1]*.7152+sourcePixels[left+2]*.0722+
          sourcePixels[right]*.2126+sourcePixels[right+1]*.7152+sourcePixels[right+2]*.0722+
          sourcePixels[above]*.2126+sourcePixels[above+1]*.7152+sourcePixels[above+2]*.0722+
          sourcePixels[below]*.2126+sourcePixels[below+1]*.7152+sourcePixels[below+2]*.0722
        ) * .25;
        // Keep the unchanged originals close to boundaries and avoid hard seams.
        const interior = categories[maskRow+xs[x-1]]===cls &&
          categories[maskRow+xs[x+1]]===cls &&
          categories[Math.min(mh-1, Math.floor((y-1)*mh/h))*mw+sx]===cls &&
          categories[Math.min(mh-1, Math.floor((y+1)*mh/h))*mw+sx]===cls;
        const mix = interior ? 1 : .20;
        const detail = Math.max(-15, Math.min(15, (l-neighbor)*.54)) * mix;
        // For the posterized rendering, recover ~83% of true textile detail.
        // For unsimplified V12, leave the colour intact and just reinforce lines.
        const recover = simplifyPortrait ? .83 * mix : 0;
        for (let c = 0; c < 3; c++) {
          const base = pixels[p+c] + (sourcePixels[p+c]-pixels[p+c])*recover;
          pixels[p+c] = Math.max(0, Math.min(255, Math.round(base+detail)));
        }
      }
    }
    return result;
  }

  function drawTintFallback() {
    // The canonical source image has already been drawn this frame.
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (gradePreset === 'original') {
      ctx.drawImage(currentRenderBase(),0,0);
    } else {
      const c = simplifyPortrait ? stylizedCtx : sourceCtx;
      const photo = applyExhibitionGrade(c.getImageData(0,0,canvas.width,canvas.height));
      featureSourceCtx.putImageData(photo,0,0);
      ctx.drawImage(featureSourceCanvas,0,0);
    }
    ctx.fillStyle=palette[index].color;
    ctx.globalAlpha=.18;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha=1;
  }
  function paintSkin(mask) {
    if(!mask?.getAsUint8Array) {drawTintFallback();return;}
    // Stage 2 affects only the non-skin base. Skin remains one exact flat shade.
    const imageContext = simplifyPortrait ? stylizedCtx : sourceCtx;
    const frame = preserveDetails
      ? detailPreservedFrame(mask)
      : imageContext.getImageData(0,0,sourceCanvas.width,sourceCanvas.height);
    // V15: do all colour grading BEFORE applying the seven fixed skin colours.
    // This preserves exact hex values for every fully classified skin pixel.
    // Copy the graded image to the eye/lip source so those restored details
    // match the graded surrounding image without altering the skin fill.
    if (gradePreset !== 'original') {
      applyExhibitionGrade(frame);
      featureSourceCtx.putImageData(frame,0,0);
    }
    const rgba=frame.data;
    const categories=mask.getAsUint8Array();
    const mw=mask.width,mh=mask.height;
    const w=canvas.width,h=canvas.height;
    const [r,g,b]=rgb(palette[index].color);
    // The mask comes from the SAME already-mirrored sourceCanvas pixels.
    // Do not flip, crop, translate or mirror it a second time.
    const xs=new Uint16Array(w);
    for(let x=0;x<w;x++) xs[x]=Math.min(mw-1,Math.floor(x*mw/w));
    for(let y=0;y<h;y++){
      const sy=Math.min(mh-1,Math.floor(y*mh/h));
      const maskRow=sy*mw,rgbaRow=y*w*4;
      for(let x=0;x<w;x++){
        if(!SKIN_CLASSES.has(categories[maskRow+xs[x]])) continue;
        const p=rgbaRow+x*4;
        rgba[p]=r;rgba[p+1]=g;rgba[p+2]=b;
      }
    }
    ctx.putImageData(frame,0,0);
  }

  // Face Landmarker ALSO analyzes the same mirrored sourceCanvas image.
  // Normalized landmarks therefore already match the painted canvas coordinates.
  function point(landmarks,id){
    const p=landmarks[id];
    return p ? {x:p.x*canvas.width,y:p.y*canvas.height} : null;
  }
  function pathPoints(landmarks,ids,{close=false,scale=1}={}) {
    const pts=ids.map(i=>point(landmarks,i));
    if(pts.some(p=>!p)) return false;
    const center=pts.reduce((a,p)=>({x:a.x+p.x/pts.length,y:a.y+p.y/pts.length}),{x:0,y:0});
    const q=pts.map(p=>({x:center.x+(p.x-center.x)*scale,y:center.y+(p.y-center.y)*scale}));
    ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);
    // Quadratic mids smooth landmark sequences into hand-drawn curves.
    for(let i=1;i<q.length-1;i++){
      const mid={x:(q[i].x+q[i+1].x)/2,y:(q[i].y+q[i+1].y)/2};
      ctx.quadraticCurveTo(q[i].x,q[i].y,mid.x,mid.y);
    }
    if(close){ctx.quadraticCurveTo(q[q.length-1].x,q[q.length-1].y,q[0].x,q[0].y);ctx.closePath();}
    else ctx.lineTo(q[q.length-1].x,q[q.length-1].y);
    return true;
  }
  const RIGHT_EYE=[33,160,158,133,153,144];
  const LEFT_EYE=[362,385,387,263,373,380];
  const OUTER_LIPS=[61,40,37,0,267,270,291,321,314,17,84,91];
  const JAW=[234,93,132,58,172,136,150,149,176,148,152,377,400,378,379,365,397,288,361,323,454];
  const BROW_RIGHT=[70,63,105,66,107];
  const BROW_LEFT=[336,296,334,293,300];

  function restoreOriginalRegion(landmarks,ids,scale=1.05) {
    ctx.save();
    if(pathPoints(landmarks,ids,{close:true,scale})) {
      ctx.clip();
      // Exactly the same grade as the image beneath the flat skin overlay.
      ctx.drawImage(gradePreset === 'original' ? currentRenderBase() : featureSourceCanvas,0,0);
    }
    ctx.restore();
  }
  function stroke(landmarks,ids,width,color,close=false) {
    if(!pathPoints(landmarks,ids,{close})) return;
    ctx.lineWidth=width;
    ctx.strokeStyle=color;
    ctx.stroke();
  }
  function drawIllustratedFeatures(landmarks) {
    if(!landmarks || landmarks.length < 468) return;
    const left=point(landmarks,234),right=point(landmarks,454);
    if(!left||!right) return;
    const size=Math.hypot(left.x-right.x,left.y-right.y);
    const weight=Math.max(1.15,Math.min(3.3,size*.008));
    const ink='rgba(35,26,24,.92)';
    const soft='rgba(49,35,30,.62)';

    // Preserve actual eye and lip pixels only INSIDE the facial feature contours.
    // Skin between these remains completely flat, with no skin photo shading.
    restoreOriginalRegion(landmarks,RIGHT_EYE,1.06);
    restoreOriginalRegion(landmarks,LEFT_EYE,1.06);
    restoreOriginalRegion(landmarks,OUTER_LIPS,1.03);

    ctx.save();
    ctx.lineJoin='round';ctx.lineCap='round';
    stroke(landmarks,JAW,weight*1.08,soft);
    stroke(landmarks,RIGHT_EYE,weight,ink,true);
    stroke(landmarks,LEFT_EYE,weight,ink,true);
    stroke(landmarks,BROW_RIGHT,weight*1.65,ink);
    stroke(landmarks,BROW_LEFT,weight*1.65,ink);
    stroke(landmarks,OUTER_LIPS,weight,ink,true);
    // Nose is drawn with a restrained broken line, not a triangle or full mesh.
    stroke(landmarks,[168,6,197,195,5],weight*.6,'rgba(55,41,34,.43)');
    stroke(landmarks,[98,97,2],weight*.85,soft);
    stroke(landmarks,[2,326,327],weight*.85,soft);
    // Subtle nose wings and upper lip centre.
    stroke(landmarks,[129,98],weight*.62,soft);
    stroke(landmarks,[327,358],weight*.62,soft);
    ctx.restore();
  }

  function render(now) {
    if(!stream) return;
    rafId=requestAnimationFrame(render);
    if(video.readyState<2||video.currentTime===lastVideoTime||now-lastProcessedAt<MIN_FRAME_INTERVAL_MS) return;
    lastVideoTime=video.currentTime;
    lastProcessedAt=now;
    canvasSize();
    // Capture one identical, already-mirrored frame for display and inference.
    mirroredPhoto();
    if (simplifyPortrait) prepareSimplifiedPortrait();
    try {
      if(segmenter){
        const result=segmenter.segmentForVideo(sourceCanvas,now);
        if(result?.categoryMask){
          try {paintSkin(result.categoryMask)}
          finally {result.categoryMask.close?.()}
        }else drawTintFallback();
      }else drawTintFallback();
    }catch(error){
      console.warn('Skin painter failed for frame',error);
      drawTintFallback();
    }
    if(showLines&&faceLandmarker){
      try{
        const result=faceLandmarker.detectForVideo(sourceCanvas,now);
        const landmarks=result?.faceLandmarks?.[0];
        if(landmarks) drawIllustratedFeatures(landmarks);
      }catch(error){
        if(!featureWarningShown){console.warn('Facial landmark drawing unavailable',error);featureWarningShown=true;}
      }
    }
    if(!firstFrameRendered){
      firstFrameRendered=true;
      if(!segmenter) setStatus('Camera is live. Flat-colour painter unavailable; showing a gentle tinted preview.');
      else if(!faceLandmarker) setStatus('Flat-colour mirror active. Facial model could not load, so illustrated outlines are unavailable.');
      else setStatus('Flat skin and illustrated contours active. More Flat and Gallery grade are ON; use either toggle for comparison.');
    }
  }

  function stopCamera(message='Camera off. The shade picker and random mirror still work.') {
    requestSerial++;
    if(rafId!==null) cancelAnimationFrame(rafId);
    rafId=null;
    if(stream) stream.getTracks().forEach(track=>track.stop());
    stream=null;
    video.pause();video.srcObject=null;video.hidden=true;
    canvas.hidden=true;offline.hidden=false;
    root.classList.remove('is-camera-live');
    start.hidden=false;start.disabled=false;stop.hidden=true;
    lastVideoTime=-1;lastProcessedAt=-Infinity;firstFrameRendered=false;
    setStatus(message);
  }
  start.addEventListener('click',async()=>{
    if(!navigator.mediaDevices?.getUserMedia){
      setStatus('Camera requires HTTPS or localhost; the shade picker works without camera access.');return;
    }
    if(stream)return;
    const serial=++requestSerial;
    start.disabled=true;
    setStatus('Your browser may ask for camera permission. Models will load only if you grant access.');
    try{
      const incoming=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:'user',width:{ideal:640},height:{ideal:840}},audio:false
      });
      if(serial!==requestSerial||document.hidden||!root.isConnected){
        incoming.getTracks().forEach(track=>track.stop());start.disabled=false;return;
      }
      stream=incoming;video.srcObject=stream;
      video.hidden=true;canvas.hidden=false;offline.hidden=true;
      root.classList.add('is-camera-live');
      start.hidden=true;start.disabled=false;stop.hidden=false;
      await video.play();
      setStatus('Loading skin painter and facial landmark model…');
      await Promise.all([loadSegmenter(),loadFaceLandmarker()]);
      if(serial!==requestSerial||stream!==incoming)return;
      canvasSize();
      rafId=requestAnimationFrame(render);
      incoming.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{
        if(stream===incoming)stopCamera('Camera ended. The colour key still works.');
      },{once:true}));
    }catch(error){
      if(serial!==requestSerial)return;
      stopCamera(error?.name==='NotAllowedError'
        ? 'Camera permission declined or blocked. Shade selection still works.'
        : 'Camera could not be started. Please try again; shade selection still works.');
    }
  });
  stop.addEventListener('click',()=>stopCamera());
  window.addEventListener('pagehide',()=>{pauseCycle();stopRandom();stopCamera()});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){pauseCycle();stopRandom();if(stream)stopCamera('Camera stopped when you left the tab.');}
  });
  changeClassification(index,{silent:true});
  // Keep the default-on controls synchronized with the active V16 rendering recipe.
  simplifyButton.setAttribute('aria-pressed', String(simplifyPortrait));
  gradeButton.setAttribute('aria-pressed', String(gradePreset === 'gallery'));
})();
