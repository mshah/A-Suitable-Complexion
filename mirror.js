/* A Suitable Complexion, V11 — Stage 1 / Illustrated facial features.
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
  const start = $('#mirrorStartCamera');
  const stop = $('#mirrorStopCamera');
  const status = $('#mirrorStatus');
  const video = $('#mirrorVideo');
  const canvas = $('#mirrorCanvas');
  const offline = $('#mirrorOffline');
  if (!canvas || !linesButton) return;

  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently:true });

  let index = 2;
  let showLines = true;
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

  function canvasSize() {
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    const factor = Math.min(1,640/Math.max(width,height));
    const w = Math.max(1,Math.round(width*factor));
    const h = Math.max(1,Math.round(height*factor));
    if(canvas.width !== w || canvas.height !== h) {
      canvas.width=sourceCanvas.width=w;
      canvas.height=sourceCanvas.height=h;
    }
  }
  function mirroredPhoto() {
    sourceCtx.save();
    sourceCtx.clearRect(0,0,sourceCanvas.width,sourceCanvas.height);
    sourceCtx.translate(sourceCanvas.width,0);
    sourceCtx.scale(-1,1);
    sourceCtx.drawImage(video,0,0,sourceCanvas.width,sourceCanvas.height);
    sourceCtx.restore();
  }
  function drawTintFallback() {
    mirroredPhoto();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(sourceCanvas,0,0);
    ctx.fillStyle=palette[index].color;
    ctx.globalAlpha=.18;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha=1;
  }
  function paintSkin(mask) {
    if(!mask?.getAsUint8Array) {drawTintFallback();return;}
    mirroredPhoto();
    const frame = sourceCtx.getImageData(0,0,sourceCanvas.width,sourceCanvas.height);
    const rgba=frame.data;
    const categories=mask.getAsUint8Array();
    const mw=mask.width,mh=mask.height;
    const w=canvas.width,h=canvas.height;
    const [r,g,b]=rgb(palette[index].color);
    // IMPORTANT: sourceCanvas/video is mirrored, but the segmentation mask isn't.
    // Flip x when sampling mask: fixes misaligned fill around eyes and cheeks.
    const xs=new Uint16Array(w);
    for(let x=0;x<w;x++) xs[x]=mw-1-Math.min(mw-1,Math.floor(x*mw/w));
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

  // Face Landmarker points describe the *unmirrored* input video.
  // Convert to the mirrored preview's canvas coordinates.
  function point(landmarks,id){
    const p=landmarks[id];
    return p ? {x:(1-p.x)*canvas.width,y:p.y*canvas.height} : null;
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
      ctx.drawImage(sourceCanvas,0,0);
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
    try {
      if(segmenter){
        const result=segmenter.segmentForVideo(video,now);
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
        const result=faceLandmarker.detectForVideo(video,now);
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
      else setStatus('Flat skin and illustrated facial contours active. Toggle Illustrated Features to compare.');
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
})();
