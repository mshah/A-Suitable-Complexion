(function(){'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('navLinks');
if(menu&&nav){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}})}

const colorButtons=[...document.querySelectorAll('.palette-choice')];
const specimen=document.getElementById('specimenFill'),spNum=document.getElementById('specimenNumber'),state=document.getElementById('specimenState'),toggle=document.getElementById('fillToggle');
let selected=colorButtons.find(x=>x.getAttribute('aria-pressed')==='true')||colorButtons[0];let filled=false;
function syncSpecimen(){if(!specimen||!selected)return;const c=selected.dataset.color,n=selected.dataset.index,label=selected.dataset.label;document.getElementById('swatchPreview').style.background=c;document.getElementById('selectedLabel').textContent=n+' · '+label;document.getElementById('selectedHex').textContent=c+' — artist’s approximation';specimen.setAttribute('fill',filled?c:'#ede6d7');spNum.textContent=n;spNum.style.display=filled?'none':'block';state.textContent=filled?'FILLED':'UNFILLED';toggle.setAttribute('aria-pressed',String(filled));toggle.textContent=filled?'Leave skin unfilled':'Fill the specimen'}
colorButtons.forEach(b=>b.addEventListener('click',()=>{selected=b;colorButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncSpecimen()}));if(toggle)toggle.addEventListener('click',()=>{filled=!filled;syncSpecimen()});syncSpecimen();

const filters=[...document.querySelectorAll('.filter')],entries=[...document.querySelectorAll('.timeline-entry')];
filters.forEach(b=>b.addEventListener('click',()=>{const match=b.dataset.era;filters.forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});let count=0;entries.forEach(e=>{e.hidden=!(match==='all'||e.dataset.era===match);if(!e.hidden)count++});const empty=document.getElementById('timelineEmpty');if(empty)empty.hidden=count!==0}));

const quotes=[
{html:'White makes <em>you win.</em>',source:'Seoul Secret Snowz · Thailand · 2016',caption:'A public promise of success attached to whiteness. The campaign was withdrawn after criticism.',bg:'#c59a77'},
{html:'Gives <em>natural charm.</em>',source:'Hazeline Snow · archived historic advertisement',caption:'An older idiom linking cosmetics, refinement and social charm.',bg:'#c8c6a7'},
{html:'From ebony <em>to Ivory.</em>',source:'GlutaMAX · Philippines · 2008',caption:'A dramatic transformation claim documented by historical advertising research.',bg:'#ae8f7d'},
{html:'Glow <em>of success.</em>',source:'Glow & Lovely · India · contemporary corporate positioning',caption:'Rebranding shifts vocabulary without settling questions about earlier beauty hierarchies.',bg:'#d4b8a0'}
];let quoteIndex=0;const stage=document.getElementById('sloganStage');
function showQuote(i){if(!stage)return;quoteIndex=(i+quotes.length)%quotes.length;const q=quotes[quoteIndex];stage.style.background=q.bg;document.getElementById('sloganPrimary').innerHTML=q.html;document.getElementById('sloganIndex').textContent=String(quoteIndex+1).padStart(2,'0')+' / 04';document.getElementById('sloganSource').textContent=q.source;document.getElementById('sloganCaption').textContent=q.caption;document.querySelectorAll('.slogan-dot').forEach((d,j)=>{d.classList.toggle('active',j===quoteIndex);d.setAttribute('aria-pressed',String(j===quoteIndex))})}
if(stage){document.getElementById('sloganPrev').addEventListener('click',()=>showQuote(quoteIndex-1));document.getElementById('sloganNext').addEventListener('click',()=>showQuote(quoteIndex+1));document.querySelectorAll('.slogan-dot').forEach(d=>d.addEventListener('click',()=>showQuote(Number(d.dataset.slogan))))}
const promises={
romance:['A chance to be chosen','The campaign implies that a changed complexion can influence romance or marriage. A promise in advertising is not evidence that a product improves relationships.','A cosmetic product and an expectation of change.','The norms that make complexion relevant to desirability.'],
career:['A better chance at work','Advertisements have linked complexion to professional presentation or career success. This does not establish a universal hiring advantage.','Creams, serums, attention and a story about opportunity.','Bias in how appearance is evaluated at work.'],
confidence:['An improved self','The suggestion that a complexion must change before confidence can begin places responsibility on the individual, not the social environment.','An item of skincare plus an aspirational narrative.','The expectation that darker skin is a defect to correct.'],
belonging:['An invitation to belong','The implication is that changing appearance helps a person fit the group. The work questions why membership would have conditions at all.','Products and an image of acceptance.','Who sets the terms of acceptance—and who benefits.']};
const opts=[...document.querySelectorAll('.promise-option')];opts.forEach(b=>b.addEventListener('click',()=>{opts.forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});const p=promises[b.dataset.promise];document.getElementById('promiseHeadline').textContent=p[0];document.getElementById('promiseExplain').textContent=p[1];document.getElementById('promiseProduct').textContent=p[2];document.getElementById('promiseUnderlying').textContent=p[3]}));

// Accessible, dependency-free artwork viewer. Normal image links remain usable when scripts are disabled.
const artworkDialog=document.getElementById('artworkDialog');
const artworkLinks=[...document.querySelectorAll('.artwork-open')];
if(artworkDialog && artworkLinks.length && typeof artworkDialog.showModal==='function'){
  const viewerImage=document.getElementById('artworkDialogImage');
  const viewerTitle=document.getElementById('artworkDialogTitle');
  const viewerStatus=document.getElementById('artworkDialogStatus');
  let artworkIndex=0;
  function showArtwork(n){
    artworkIndex=(n+artworkLinks.length)%artworkLinks.length;
    const a=artworkLinks[artworkIndex];
    viewerImage.src=a.dataset.full;
    viewerImage.alt=a.dataset.alt;
    viewerTitle.textContent=a.dataset.title;
    viewerStatus.textContent=String(artworkIndex+1).padStart(2,'0')+' of '+String(artworkLinks.length).padStart(2,'0')+' · Working study, not final';
  }
  artworkLinks.forEach((a,i)=>a.addEventListener('click',event=>{event.preventDefault();showArtwork(i);artworkDialog.showModal()}));
  document.getElementById('artworkDialogClose').addEventListener('click',()=>artworkDialog.close());
  document.getElementById('artworkDialogPrev').addEventListener('click',()=>showArtwork(artworkIndex-1));
  document.getElementById('artworkDialogNext').addEventListener('click',()=>showArtwork(artworkIndex+1));
  artworkDialog.addEventListener('click',event=>{if(event.target===artworkDialog)artworkDialog.close()});
  artworkDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showArtwork(artworkIndex-1)}if(event.key==='ArrowRight'){event.preventDefault();showArtwork(artworkIndex+1)}});
  artworkDialog.addEventListener('close',()=>{viewerImage.removeAttribute('src')});
}
})();
