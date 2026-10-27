/* A Suitable Complexion — interactive mirror.
   Offline, local camera preview only. This deliberately does not classify visitors.
   No captured stills, face detection, network requests, storage, or analytics. */
(() => {
  'use strict';
  const root = document.getElementById('mirrorExperience');
  if (!root) return;
  const palette = [
    {id:'01',label:'Very Fair', color:'#F0D5BC'},
    {id:'02',label:'Fair', color:'#DDB58F'},
    {id:'03',label:'Wheatish', color:'#C99870'},
    {id:'04',label:'Wheatish Medium', color:'#AC7953'},
    {id:'05',label:'Wheatish Brown', color:'#926143'},
    {id:'06',label:'Wheatish Dark', color:'#70482F'},
    {id:'07',label:'Dark', color:'#4B3025'}
  ];
  const chips=[...root.querySelectorAll('.mirror-chip')];
  const number=root.querySelector('#mirrorAssignedNum');
  const label=root.querySelector('#mirrorSelectedLabel');
  const previous=root.querySelector('#mirrorPrevious');
  const next=root.querySelector('#mirrorNext');
  const cycle=root.querySelector('#mirrorCycle');
  const start=root.querySelector('#mirrorStartCamera');
  const stop=root.querySelector('#mirrorStopCamera');
  const status=root.querySelector('#mirrorStatus');
  const video=root.querySelector('#mirrorVideo');
  const fallback=root.querySelector('#mirrorOffline');
  let index=2;
  let cycleTimer=null;
  let cameraStream=null;
  let cameraRequest=0;

  function changeClassification(i) {
    index=(i+palette.length)%palette.length;
    const c=palette[index];
    root.style.setProperty('--mirror-color',c.color);
    number.textContent=c.id;
    label.textContent=c.id+' · '+c.label;
    chips.forEach((chip,j)=>chip.setAttribute('aria-pressed',String(j===index)));
  }
  function pauseCycle() {
    if (cycleTimer!==null) window.clearInterval(cycleTimer);
    cycleTimer=null;
    cycle.setAttribute('aria-pressed','false');
    cycle.textContent='CYCLE THE LABELS ↻';
  }
  chips.forEach((chip,j)=>chip.addEventListener('click',()=>{
    pauseCycle(); changeClassification(j);
  }));
  previous.addEventListener('click',()=>{pauseCycle(); changeClassification(index-1)});
  next.addEventListener('click',()=>{pauseCycle(); changeClassification(index+1)});
  cycle.addEventListener('click',()=>{
    if (cycleTimer!==null) { pauseCycle(); return; }
    changeClassification(index+1);
    cycleTimer=window.setInterval(()=>changeClassification(index+1),1250);
    cycle.setAttribute('aria-pressed','true');
    cycle.textContent='PAUSE THE LABELS Ⅱ';
  });

  function stopCamera(message='Camera off. You can still change the classification.') {
    cameraRequest++;
    if (cameraStream) cameraStream.getTracks().forEach(track=>track.stop());
    cameraStream=null;
    video.pause();
    video.srcObject=null;
    video.hidden=true;
    fallback.hidden=false;
    root.classList.remove('is-camera-live');
    start.hidden=false; start.disabled=false;
    stop.hidden=true;
    status.textContent=message;
  }
  start.addEventListener('click',async()=>{
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent='Camera unavailable here. Try HTTPS or localhost, or use the seven shades without a camera.';
      return;
    }
    if (cameraStream) return;
    const request=++cameraRequest;
    start.disabled=true;
    status.textContent='Your browser may ask for camera permission.';
    try {
      const stream=await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:{ facingMode:'user', width:{ideal:720}, height:{ideal:960} }
      });
      // If the visitor left or clicked Stop during permission dialogue, discard the stream.
      if (request!==cameraRequest || document.hidden || !root.isConnected) {
        stream.getTracks().forEach(track=>track.stop());
        start.disabled=false;
        return;
      }
      cameraStream=stream;
      video.srcObject=stream;
      video.hidden=false;
      fallback.hidden=true;
      root.classList.add('is-camera-live');
      start.hidden=true; start.disabled=false;
      stop.hidden=false;
      status.textContent='Your live reflection is visible. Nothing is recorded or uploaded.';
      await video.play().catch(()=>{});
      stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{
        if (cameraStream===stream) stopCamera('Camera ended. The colour key still works.');
      },{once:true}));
    } catch(e) {
      start.disabled=false;
      status.textContent=e && e.name==='NotAllowedError'
        ? 'Camera permission was declined or blocked. The seven-shade mirror still works.'
        : 'Camera could not be opened. You can still explore the seven shades.';
    }
  });
  stop.addEventListener('click',()=>stopCamera());
  window.addEventListener('pagehide',()=>{ pauseCycle(); stopCamera(); });
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden) { pauseCycle(); if(cameraStream) stopCamera('Camera stopped when you left this tab.'); }
  });
  changeClassification(index);
})();
