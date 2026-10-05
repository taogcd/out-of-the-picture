const RECORDS=PLATES.map(p=>({...p,id:p.number,nypl:p.g.nyplId,category:p.number<=2?'Skeletons':p.number<=16||p.number===18||p.number===19?'Muscles':p.number===17?'Figures':p.number<=24?'Vessels':p.number<=28?'Nerves':p.number<=34?'Organs':'Brain & instruments'}));
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'), SOURCE_BOOK='https://doi.org/10.3931/e-rara-20094';
let overview=true,gCopy='pdf',mobileBoth=false;
let boardScale=1,boardZoom=1;
let current=1,vIndex=0,view='catalogue',listMode=false,ink=true,overlay=false,cropMode=false,activeSide='v',selected=null,drawToken=0,toastTimer;
const cameras={v:{z:1,x:0,y:0},g:{z:1,x:0,y:0}};
const images={v:null,g:null};let fragments=[];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function toast(t){$('toast').textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',4200);}
function record(){return RECORDS.find(r=>r.id===current);}
function sourceFor(r,side,idx=0,copy='display'){
 const s=side==='v'?r.v[idx]:(copy==='pdf'?r.gPdf:r.g);if(!s)return null;
 return {url:s.image,original:s.full,record:s.record,institution:s.collection,author:side==='v'?'Vesalius':'Geminus',work:side==='v'?s.work:'Compendiosa',year:side==='v'?1543:1545,page:(s.page?'p. '+s.page+' / ':'')+(s.scan?'scan '+s.scan:'NYPL '+s.nyplId),recordId:r.id,side,copy:side==='g'?copy:'display',pageIndex:idx,width:s.width,height:s.height};
}
function gSource(r,copy=gCopy){return sourceFor(r,'g',0,copy)}
async function vSource(r,idx=0){return sourceFor(r,'v',idx)}
function setView(name){view=name;document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!==name);document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===name)));if(name==='compare')renderCompare();if(name==='atlas'){renderBoard();renderInspector();}document.documentElement.scrollTop=0;}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function filtered(){const q=$('search').value.trim().toLowerCase(),cat=$('category').value,ch=$('change').value;return RECORDS.filter(r=>(!cat||r.category===cat)&&(!ch||r.changeTags.includes(ch))&&(!q||[r.title,r.note,r.id,r.nypl,r.category,...r.v.flatMap(v=>[v.work,v.page,v.scan]),...r.changeTags].join(' ').toLowerCase().includes(q)));}
function thumbFailure(img){img.style.display='none';const msg=document.createElement('span');msg.className='loadingstub';msg.textContent='Image unavailable · Open the record';img.parentElement.appendChild(msg);}
function renderCatalogue(){
 const rows=filtered();renderFilterSummary(rows);$('resultCount').textContent=rows.length+' / 39 records';const target=$('catalogueContent');target.innerHTML='';
 if(!rows.length){target.innerHTML='<div class="empty">No matching records. Try a broader term or clear the filters.</div>';return;}
 if(listMode){target.innerHTML='<table class="indexlist"><thead><tr><th>No.</th><th>Record</th><th>Change</th><th>Source pages</th></tr></thead><tbody>'+rows.map(r=>'<tr tabindex="0" role="button" data-record="'+r.id+'"><td class="mono">'+pad(r.id)+'</td><td>'+esc(r.title)+(r.pending?' <span class="badge">* detail under review</span>':'')+'</td><td>'+esc(r.change)+'</td><td class="mono">'+r.v.map(p=>p.page?'p.'+p.page:'scan '+p.scan).join(', ')+'</td></tr>').join('')+'</tbody></table>';
  }else{target.innerHTML='<div class="catalog">'+rows.map(r=>{const g=gSource(r,'pdf'),v=r.v[0];return `<article class="card" role="button" tabindex="0" aria-label="Open comparison ${pad(r.id)}: ${esc(r.title)}, ${r.v.length} Vesalius source pages" data-record="${r.id}"><div class="catalogue-pair"><figure><figcaption>VESALIUS / 1543</figcaption><div class="thumb"><img class="artimage" loading="lazy" src="${v.image}" width="${v.width}" height="${v.height}" alt="Vesalius, ${esc(r.title)}, ${scanLabel(v)}"></div></figure><figure><figcaption>GEMINUS / 1545</figcaption><div class="thumb"><img class="artimage" loading="lazy" src="${g.url}" width="${g.width}" height="${g.height}" alt="Geminus, ${esc(r.title)}, NYPL reference copy"></div></figure></div><div class="cardhead"><span class="idx">${pad(r.id)}</span><div><h3>${esc(r.title)}</h3><p>${r.v.length} VESALIUS SOURCE ${r.v.length===1?'PAGE':'PAGES'} / 1 GEMINUS PLATE<br>NYPL ${r.nypl} · Reference PDF p. ${r.pdfPage}</p><div class="record-tags">${r.changeTags.map(t=>'<span>'+esc(t)+'</span>').join('')}</div>${r.pending?'<span class="badge">Detail under review</span>':''}</div></div><div class="open-group">Open all ${r.v.length+1} images in this group</div></article>`}).join('')+'</div>';}
 target.querySelectorAll('[data-record]').forEach(el=>{const open=()=>openRecord(Number(el.dataset.record));el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});
 target.querySelectorAll('img').forEach(im=>im.onerror=()=>thumbFailure(im));
}
[...new Set(RECORDS.flatMap(r=>r.changeTags))].forEach(c=>{const o=document.createElement('option');o.value=o.textContent=c;$('change').appendChild(o);});
[...new Set(RECORDS.map(r=>r.category))].forEach(c=>{const o=document.createElement('option');o.value=o.textContent=c;$('category').appendChild(o);});
['search','category','change'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',renderCatalogue));
$('imageView').onclick=()=>{listMode=false;$('imageView').classList.add('active');$('indexView').classList.remove('active');renderCatalogue();};
$('indexView').onclick=()=>{listMode=true;$('imageView').classList.remove('active');$('indexView').classList.add('active');renderCatalogue();};
document.querySelectorAll('.inkToggle').forEach(b=>b.onclick=()=>{ink=!ink;document.body.classList.toggle('inkmode',ink);document.querySelectorAll('.inkToggle').forEach(t=>t.textContent=ink?'Original colour':'Monochrome');});
let regionTargets=null;
function resetCamera(){for(const s of ['v','g'])cameras[s]={z:1,x:0,y:0};applyCameras();}
function applyCameras(){for(const s of ['v','g']){const c=cameras[s];$('img'+s.toUpperCase()).style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.z+')';}$('zoomLabel').textContent=Math.round(cameras[activeSide].z*100)+'%';['v','g'].forEach(s=>{$('frame'+s.toUpperCase()).style.touchAction=cropMode||cameras[s].z>1?'none':'pan-y pinch-zoom';});renderRegions();}
function focusSide(s){activeSide=s;['v','g'].forEach(t=>$('frame'+t.toUpperCase()).classList.toggle('isactive',s===t));syncMobileCompare();applyCameras();}
function changeZoom(delta){if(cropMode)toggleCrop(false);for(const s of $('linked').checked?['v','g']:[activeSide]){cameras[s].z=Math.max(1,Math.min(8,cameras[s].z+delta));if(cameras[s].z===1)cameras[s].x=cameras[s].y=0;}applyCameras();}
$('zoomIn').onclick=()=>changeZoom(.5);$('zoomOut').onclick=()=>changeZoom(-.5);$('resetZoom').onclick=resetCamera;
$('backCatalogue').onclick=()=>setView('catalogue');
$('prev').onclick=()=>openRecord(current===1?39:current-1);
$('next').onclick=()=>openRecord(current===39?1:current+1);
function setOverlay(on){overlay=on;if(on){toggleCrop(false);focusSide('v');}$('pair').classList.toggle('overlay',on);$('sideMode').classList.toggle('active',!on);$('overlayMode').classList.toggle('active',on);$('overlayMode').setAttribute('aria-pressed',String(on));$('opacityWrap').classList.toggle('show',on);$('imgG').style.opacity=on?Number($('opacity').value)/100:1;syncMobileCompare();updateCompareHelp();}
function updateCompareHelp(){
 $('compareHelp').textContent=cropMode?'Draw a rectangle on the image to cut a fragment. Tap Select fragment again to cancel.':overview?'Every source page in this group is shown below. Select a page to inspect it with Geminus, zoom or extract a fragment.':overlay?'Overlay is aligned to page centres, not physical scale. Use Fit to reset. Switch back to select a fragment.':window.innerWidth<=700?'Choose Vesalius, Geminus or Both. Use + to enlarge, then drag to pan; Fit restores scrolling.':'Drag to pan; use + / − to inspect. Select fragment, then draw a rectangle on either source.';
}
function syncMobileCompare(){
 $('mobileCompareSwitch').hidden=overview||overlay;
 $('pair').dataset.activeSide=activeSide;$('pair').classList.toggle('mobile-both',mobileBoth);
 document.querySelectorAll('[data-mobile-side]').forEach(b=>{const on=b.dataset.mobileSide===(mobileBoth?'both':activeSide);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
}
document.querySelectorAll('[data-mobile-side]').forEach(b=>b.onclick=()=>{mobileBoth=b.dataset.mobileSide==='both';focusSide(mobileBoth?activeSide:b.dataset.mobileSide);});
$('allMode').onclick=()=>setOverview(true);$('sideMode').onclick=()=>{setOverview(false);setOverlay(false);};$('overlayMode').onclick=()=>{setOverview(false);setOverlay(true);};$('opacity').oninput=()=>{$('imgG').style.opacity=Number($('opacity').value)/100;};
function toggleCrop(on){if(on&&overview)setOverview(false);if(on&&overlay)setOverlay(false);cropMode=on;if(on)resetCamera();$('cropButton').classList.toggle('active',on);$('cropButton').setAttribute('aria-pressed',String(on));['v','g'].forEach(s=>$('frame'+s.toUpperCase()).classList.toggle('cropping',on));applyCameras();updateCompareHelp();}
$('cropButton').onclick=()=>toggleCrop(!cropMode);
function bindImage(side,source,token){
 if(token!==drawToken)return;images[side]=source;const cap=side.toUpperCase(),img=$('img'+cap),state=$('state'+cap),link=$('original'+cap);

 if(!source){img.removeAttribute('src');state.textContent='This collection image could not load. Open the source catalogue, or retry by selecting another record.';link.href=record().v[vIndex]?.work==='Epitome'?'https://iiif.wellcomecollection.org/presentation/b33544189':SOURCE_BOOK;return;}
 state.textContent='Loading collection image…';link.href=source.original;img.onload=()=>{if(token===drawToken){state.textContent='';renderRegions();}};img.onerror=()=>{if(token===drawToken)state.textContent='The collection image is temporarily unavailable. Use Original scan to open it directly.';};img.src=source.url;img.alt=source.author+', '+source.work+', '+source.year+', '+source.page;
}
async function renderCompare(){
 const token=++drawToken,r=record();toggleCrop(false);renderStudy(r);renderOverview(r);updateMode();$('jumpRecord').value=String(current);$('pdfReference').textContent='Reference PDF · group '+pad(r.id)+' / page '+r.pdfPage;$('pdfReference').href='reference/Geminus_Vesalius_39_comparisons.pdf#page='+r.pdfPage;renderCopyChoice(r);$('compareIndex').textContent='Record '+pad(r.id)+' / 39 · '+r.change;$('compareTitle').textContent=r.title;$('observation').textContent=r.note;$('pending').textContent=r.pending?'Detail under review — '+r.pending:'';
 $('sourceCount').textContent=r.v.length+' Vesalius source '+(r.v.length===1?'page':'pages')+' linked to this Geminus plate.';
 $('sourcePage').innerHTML=r.v.map((p,i)=>'<option value="'+i+'">'+esc(p.work+' / '+(p.page?'p.'+p.page:'scan '+p.scan))+'</option>').join('');$('sourcePage').value=String(vIndex);
 $('geminusID').textContent='NYPL '+r.nypl;const gs=gSource(r);$('creditG').textContent=gs.institution+' · '+gs.page;
 $('creditV').textContent=r.v[vIndex].work+' · '+(r.v[vIndex].page?'p.'+r.v[vIndex].page+' · ':'')+'scan '+r.v[vIndex].scan;
 bindImage('g',gs,token);images.v=null;$('imgV').removeAttribute('src');$('stateV').textContent='Loading source page…';const vs=await vSource(r,vIndex);bindImage('v',vs,token);applyCameras();
}
$('sourcePage').onchange=()=>{vIndex=Number($('sourcePage').value);regionTargets=null;resetCamera();renderCompare();};
function imageBounds(side){
 const im=$('img'+side.toUpperCase()),el=$('frame'+side.toUpperCase());if(!im.complete||!im.naturalWidth)return null;
 const scale=Math.min(el.clientWidth/im.naturalWidth,el.clientHeight/im.naturalHeight),w=im.naturalWidth*scale,h=im.naturalHeight*scale;
 return {left:(el.clientWidth-w)/2,top:(el.clientHeight-h)/2,w,h,nw:im.naturalWidth,nh:im.naturalHeight};
}
for(const side of ['v','g']){
 const el=$('frame'+side.toUpperCase());el.tabIndex=0;el.setAttribute('aria-label',(side==='v'?'Vesalius':'Geminus')+' image viewer');el.addEventListener('focus',()=>focusSide(side));let action=null,selectionEl=null;
 el.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.isPrimary===false||action)return;focusSide(side);if(e.pointerType==='touch'&&!cropMode&&cameras[side].z===1)return;const box=el.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
  if(cropMode){const b=imageBounds(side);if(!b||!images[side]){toast('Wait for the source image to finish loading.');return;}if(x<b.left||y<b.top||x>b.left+b.w||y>b.top+b.h)return;
   action={mode:'crop',pointerId:e.pointerId,x,y,b,endX:x,endY:y};selectionEl=document.createElement('div');selectionEl.className='selection';el.appendChild(selectionEl);
  }else action={mode:'pan',pointerId:e.pointerId,x:e.clientX,y:e.clientY,ox:cameras[side].x,oy:cameras[side].y};
  el.setPointerCapture(e.pointerId);e.preventDefault();
 });
 el.addEventListener('pointermove',e=>{if(!action||action.pointerId!==e.pointerId)return;
  if(action.mode==='pan'){cameras[side].x=action.ox+e.clientX-action.x;cameras[side].y=action.oy+e.clientY-action.y;applyCameras();}
  else{const box=el.getBoundingClientRect(),b=action.b;action.endX=Math.max(b.left,Math.min(b.left+b.w,e.clientX-box.left));action.endY=Math.max(b.top,Math.min(b.top+b.h,e.clientY-box.top));Object.assign(selectionEl.style,{left:Math.min(action.x,action.endX)+'px',top:Math.min(action.y,action.endY)+'px',width:Math.abs(action.endX-action.x)+'px',height:Math.abs(action.endY-action.y)+'px'});}
 });
 function finish(e,cancel=false){if(!action||action.pointerId!==e.pointerId)return;const a=action;action=null;selectionEl?.remove();selectionEl=null;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);if(cancel||a.mode!=='crop')return;const w=Math.abs(a.endX-a.x),h=Math.abs(a.endY-a.y);if(w<8||h<8){toast('Draw a larger rectangle to select a fragment.');return;}const b=a.b,crop={x:(Math.min(a.x,a.endX)-b.left)/b.w,y:(Math.min(a.y,a.endY)-b.top)/b.h,w:w/b.w,h:h/b.h};
  addFragment({...images[side],width:b.nw,height:b.nh},crop);toggleCrop(false);setView('atlas');
 }
 el.addEventListener('pointerup',e=>finish(e));el.addEventListener('pointercancel',e=>finish(e,true));
}
function svgFragment(f){const c=f.crop,sw=f.source.width||1000,sh=f.source.height||1600;return '<svg class="artimage" xmlns="http://www.w3.org/2000/svg" viewBox="'+[c.x*sw,c.y*sh,c.w*sw,c.h*sh].join(' ')+'" preserveAspectRatio="none"><image href="'+esc(f.source.url)+'" x="0" y="0" width="'+sw+'" height="'+sh+'" preserveAspectRatio="none"/></svg>';}
function addFragment(source,crop,label){
 const ratio=(crop.w*source.width)/(crop.h*source.height),width=Math.max(95,Math.min(300,230*Math.sqrt(ratio))),f={id:uid(),source:{...source},crop:{...crop},label:label||source.author+' / '+source.page,note:'',x:65+(fragments.length%5)*150,y:85+(Math.floor(fragments.length/5)%3)*180,w:width,h:width/ratio,rotation:0};
 if(f.h>540){f.w*=540/f.h;f.h=540;}fragments.push(f);selected=f.id;saveBoard();return f;
}
function saveBoard(){try{localStorage.setItem('ootp-atlas-v3',JSON.stringify(fragments));}catch(e){}$('atlasCount').textContent=fragments.length?'('+fragments.length+')':'';}
function selectedFragment(){return fragments.find(f=>f.id===selected);}
function renderBoard(){
 const board=$('board');board.innerHTML='';
 for(const f of fragments){const el=document.createElement('div');el.className='fragment'+(f.id===selected?' selected':'');el.tabIndex=0;el.dataset.id=f.id;el.setAttribute('aria-label',f.label+'; drag to move or use arrow keys');Object.assign(el.style,{left:f.x+'px',top:f.y+'px',width:f.w+'px',height:f.h+'px',transform:'rotate('+f.rotation+'deg)'});el.innerHTML=svgFragment(f)+'<span class="tag">'+pad(f.source.recordId)+' / '+esc(f.label)+'</span><span class="handle" aria-hidden="true"></span>';board.appendChild(el);wireFragment(el,f);}
 $('atlasCount').textContent=fragments.length?'('+fragments.length+')':'';updateBoardScale();
}
function chooseFragment(id){selected=id;$('board').querySelectorAll('.fragment').forEach(el=>el.classList.toggle('selected',el.dataset.id===id));renderInspector();}
function wireFragment(el,f){
 let drag=null;
 el.addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false||drag)return;e.stopPropagation();chooseFragment(f.id);drag={pointerId:e.pointerId,scale:boardScale,px:e.clientX,py:e.clientY,x:f.x,y:f.y,w:f.w,h:f.h,resize:e.target.classList.contains('handle')};el.setPointerCapture(e.pointerId);e.preventDefault();});
 el.addEventListener('pointermove',e=>{if(!drag||drag.pointerId!==e.pointerId)return;const dx=(e.clientX-drag.px)/drag.scale,dy=(e.clientY-drag.py)/drag.scale;if(drag.resize){const angle=f.rotation*Math.PI/180,localDelta=dx*Math.cos(angle)+dy*Math.sin(angle);f.w=Math.min(850,780*drag.w/drag.h,Math.max(12,drag.w+localDelta));f.h=f.w*(drag.h/drag.w);el.style.width=f.w+'px';el.style.height=f.h+'px';}else{f.x=Math.max(0,Math.min(1200-f.w,drag.x+dx));f.y=Math.max(36,Math.min(880-f.h,drag.y+dy));el.style.left=f.x+'px';el.style.top=f.y+'px';}});
 function end(e){if(!drag||drag.pointerId!==e.pointerId)return;drag=null;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);saveBoard();}
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 el.addEventListener('keydown',e=>{const step=e.shiftKey?20:4;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();chooseFragment(f.id);f.x=Math.max(0,Math.min(1200-f.w,f.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)));f.y=Math.max(36,Math.min(880-f.h,f.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)));el.style.left=f.x+'px';el.style.top=f.y+'px';saveBoard();}if(e.key==='Enter')chooseFragment(f.id);});
}

// The visible board scales; saved fragment coordinates always remain 1200 × 900.
function updateBoardScale(){
 const width=$('boardScroll').clientWidth;if(!width)return;
 boardScale=Math.min(1,width/1200)*boardZoom;
 Object.assign($('boardStage').style,{width:1200*boardScale+'px',height:900*boardScale+'px'});
 $('board').style.transform='scale('+boardScale+')';
 $('board').style.setProperty('--handle-size',Math.max(20,28/boardScale)+'px');
 $('boardZoomLabel').textContent=boardZoom===1?'Fit':Math.round(boardZoom*100)+'%';
 $('boardZoomOut').disabled=boardZoom<=1;$('boardZoomIn').disabled=boardZoom>=4;
}
function zoomBoard(delta){boardZoom=Math.max(1,Math.min(4,boardZoom+delta));updateBoardScale();}
$('boardZoomOut').onclick=()=>zoomBoard(-.5);$('boardZoomIn').onclick=()=>zoomBoard(.5);
$('boardFit').onclick=()=>{boardZoom=1;updateBoardScale();$('boardScroll').scrollLeft=0;$('boardScroll').scrollTop=0;};
$('editSelected').onclick=()=>{$('inspector').scrollIntoView({block:'start'});$('inspector').focus({preventScroll:true});};
function resizeSelected(factor){const f=selectedFragment();if(!f)return;const ratio=f.w/f.h;f.w=Math.max(12,Math.min(850,780*ratio,f.w*factor));f.h=f.w/ratio;f.x=Math.max(0,Math.min(1200-f.w,f.x));f.y=Math.max(36,Math.min(880-f.h,f.y));renderBoard();saveBoard();}
$('fragmentSmaller').onclick=()=>resizeSelected(1/1.15);$('fragmentLarger').onclick=()=>resizeSelected(1.15);
if(window.ResizeObserver)new ResizeObserver(updateBoardScale).observe($('boardScroll'));

$('board').addEventListener('pointerdown',e=>{if(e.target===$('board'))chooseFragment(null);});
function renderInspector(){
 const f=selectedFragment();$('editSelected').disabled=!f;$('fragmentControls').hidden=!f;$('inspectorEmpty').hidden=!!f;$('fragmentTitle').textContent=f?'Fragment '+pad(fragments.indexOf(f)+1):'Choose a fragment';if(!f)return;
 $('fragmentLabel').value=f.label;$('fragmentNote').value=f.note||'';$('rotation').value=f.rotation;$('rotationValue').textContent=f.rotation+'°';
 const c=f.crop;$('fragmentSource').textContent='RECORD '+pad(f.source.recordId)+' → '+f.source.author+' / '+f.source.year+' → '+f.source.work+' / '+f.source.page+'\n'+f.source.institution+'\nCrop within displayed page: x '+(c.x*100).toFixed(1)+'%, y '+(c.y*100).toFixed(1)+'%, w '+(c.w*100).toFixed(1)+'%, h '+(c.h*100).toFixed(1)+'%';$('fragmentSource').style.whiteSpace='pre-line';$('fragmentOriginal').href=f.source.original||f.source.url;
}
$('fragmentLabel').oninput=()=>{const f=selectedFragment();if(!f)return;f.label=$('fragmentLabel').value;$('board').querySelector('[data-id="'+f.id+'"] .tag').textContent=pad(f.source.recordId)+' / '+f.label;saveBoard();};
$('fragmentNote').oninput=()=>{const f=selectedFragment();if(f){f.note=$('fragmentNote').value;saveBoard();}};
$('rotation').oninput=()=>{const f=selectedFragment();if(!f)return;f.rotation=Number($('rotation').value);$('rotationValue').textContent=f.rotation+'°';$('board').querySelector('[data-id="'+f.id+'"]').style.transform='rotate('+f.rotation+'deg)';saveBoard();};
$('bringFront').onclick=()=>{const f=selectedFragment();if(!f)return;fragments=fragments.filter(x=>x.id!==f.id);fragments.push(f);renderBoard();renderInspector();saveBoard();};
$('duplicate').onclick=()=>{const f=selectedFragment();if(!f)return;const n=JSON.parse(JSON.stringify(f));n.id=uid();n.x=Math.min(1200-n.w,n.x+30);n.y=Math.min(880-n.h,n.y+30);fragments.push(n);selected=n.id;renderBoard();renderInspector();saveBoard();};
$('removeFragment').onclick=()=>{fragments=fragments.filter(f=>f.id!==selected);selected=null;renderBoard();renderInspector();saveBoard();};
$('traceSource').onclick=()=>{const f=selectedFragment();if(!f)return;current=f.source.recordId;vIndex=f.source.side==='v'?f.source.pageIndex||0:0;gCopy=f.source.copy==='pdf'?'pdf':'display';setOverview(false);focusSide(f.source.side);regionTargets=null;resetCamera();setOverlay(false);regionTargets={record:current,[f.source.side]:{box:f.crop,pageIndex:f.source.pageIndex}};setView('compare');toast('Returned to record '+pad(current)+' — '+f.source.author+', '+f.source.page);};
$('addFromCompare').onclick=()=>{setView('compare');toggleCrop(true);};
$('gridToggle').onchange=()=>$('board').classList.toggle('nogrid',!$('gridToggle').checked);
let clearedBackup=null;$('clearAtlas').onclick=()=>{if(fragments.length){clearedBackup=fragments;fragments=[];selected=null;$('clearAtlas').textContent='Undo clear';toast('Atlas cleared. Use Undo clear to restore it.');}else if(clearedBackup){fragments=clearedBackup;clearedBackup=null;$('clearAtlas').textContent='Clear';toast('Previous arrangement restored.');}renderBoard();renderInspector();saveBoard();};
function download(name,data,type){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('exportAtlas').onclick=()=>{download('Out_of_the_Picture_Atlas.json',JSON.stringify({project:'Out of the Picture',schema:2,board:{width:1200,height:900},fragments},null,2),'application/json');toast('Saved arrangement with source links and crop coordinates.');};
$('importAtlas').onclick=()=>$('importFile').click();
function validateFragments(list){
 if(!Array.isArray(list)||list.length>200)throw Error('Unsupported arrangement');
 return list.map(f=>{const s=f.source,r=RECORDS.find(r=>r.id===s?.recordId);if(!r||!['v','g'].includes(s.side))throw Error('Unknown source');
 const idx=s.side==='v'?s.pageIndex:0;if(!Number.isInteger(idx)||idx<0||(s.side==='v'&&idx>=r.v.length))throw Error('Unknown source page');
 const c=f.crop;if(!c||!['x','y','w','h'].every(k=>Number.isFinite(c[k]))||c.x<0||c.y<0||c.w<=0||c.h<=0||c.x+c.w>1.0001||c.y+c.h>1.0001)throw Error('Invalid crop');
 if(!['x','y','w','h','rotation'].every(k=>Number.isFinite(f[k])))throw Error('Invalid dimensions');
 const source=sourceFor(r,s.side,idx,s.copy==='pdf'?'pdf':'display'),ratio=c.w*source.width/(c.h*source.height);const w=Math.min(850,Math.max(12,f.w),780*ratio),h=w/ratio;
 return {id:uid(),source,crop:{...c},label:String(f.label||'Fragment').slice(0,90),note:String(f.note||'').slice(0,2000),x:Math.max(0,Math.min(1200-w,f.x)),y:Math.max(36,Math.min(880-h,f.y)),w,h,rotation:Math.max(-180,Math.min(180,f.rotation))};
 });
}
$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2e6)throw Error('File too large');const d=JSON.parse(await file.text());if(d.schema!==2)throw Error('This file belongs to a different atlas version');const rows=validateFragments(d.fragments);fragments=rows;selected=null;renderBoard();renderInspector();saveBoard();toast('Arrangement restored.');}catch(err){toast('Could not open that arrangement: '+err.message);}e.target.value='';};
function seedAtlas(){
 RECORDS.filter(r=>r.detail).forEach((r,i)=>{const s=sourceFor(r,'v',r.detailSource),[x,y,w,h]=r.vbox;const f=addFragment(s,{x,y,w,h},r.detail);f.x=80+(i%3)*365;f.y=110+Math.floor(i/3)*360;f.w=Math.min(260,250*(w*s.width)/(h*s.height));f.h=f.w*(h*s.height)/(w*s.width);});
 selected=null;saveBoard();
}

function link(url,label){return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`}
function scanLabel(s){return s.page?`p. ${s.page} / scan ${s.scan}`:`scan ${s.scan}`}
function openRecords(){const p=record(),s=p.v[vIndex],g=gCopy==='pdf'?p.gPdf:p.g;$('source-dialog-title').textContent=`${p.title} / source records`;
 const gScan=g.scan?'scan '+g.scan:'NYPL image '+g.nyplId;
 $('source-content').innerHTML=`<div class="record-grid"><article><h3>Andreas Vesalius</h3><p><i>${s.work==='Epitome'?'Suorum de humani corporis fabrica librorum epitome.':'De humani corporis fabrica libri septem.'}</i><br>Basel: Johannes Oporinus, 1543.</p><dl><dt>Copy</dt><dd>${s.copy}</dd><dt>Pages</dt><dd>${p.v.map(v=>scanLabel(v)).join('<br>')}</dd><dt>Rights</dt><dd>Public domain</dd></dl>${link(s.record,'Open catalogue record')}${p.v.map(v=>link(v.full,`View original scan / ${scanLabel(v)}`)).join('')}</article><article><h3>Thomas Geminus</h3><p><i>Compendiosa totius anatomie delineatio.</i><br>London: John Herford, 1545.</p><dl><dt>Displayed</dt><dd>${g.collection} / ${gScan}</dd><dt>NYPL ID</dt><dd>${g.nyplId}</dd><dt>Rights</dt><dd>${g.rights}</dd></dl>${link(g.record,'Open '+(g.scan?'Wellcome':'NYPL')+' catalogue record')}${link(g.full,'View original scan')}${link(p.gPdf.full,'NYPL image shown in the reference PDF')}${p.g.scan?link(p.g.full,'Larger Wellcome scan of the same edition'):''}</article></div><p class="tiny" style="margin-top:25px">The black scanning borders have been removed from the displayed pages. The original scans remain accessible above. Paper tone and colouring are considered separately from compositional changes.</p>${p.pending?'<p class="pending-note">Source check: '+p.pending+'</p>':''}`;$('source-dialog').showModal()}

$('recordsButton').onclick=openRecords;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
let detailZoom=1;
function openStudyImage(side){const r=record();$('image-dialog-title').textContent=(side==='v'?'Vesalius':'Geminus')+' / '+r.detail;$('zoom-image').src=r[side+'detail'];$('zoom-image').alt=$('image-dialog-title').textContent;detailZoom=1;$('image-dialog').showModal();$('zoom-image').onload=applyDetailZoom;applyDetailZoom();}
function applyDetailZoom(){const img=$('zoom-image'),area=document.querySelector('.image-scroll');if(img.naturalWidth)img.style.width=Math.min(area.clientWidth-30,(area.clientHeight-30)*img.naturalWidth/img.naturalHeight)*detailZoom+'px';$('zoom-level').textContent=Math.round(detailZoom*100)+'%';$('zoom-out').disabled=detailZoom<=1;$('zoom-in').disabled=detailZoom>=4;}
$('zoom-in').onclick=()=>{detailZoom=Math.min(4,detailZoom+.5);applyDetailZoom();};$('zoom-out').onclick=()=>{detailZoom=Math.max(1,detailZoom-.5);applyDetailZoom();};$('zoom-reset').onclick=()=>{detailZoom=1;applyDetailZoom();};
function renderStudy(r){$('study').hidden=!r.detail;if(!r.detail)return;$('studyTitle').textContent=r.detail;$('studyImages').innerHTML=['v','g'].map(side=>`<article><div class="eyebrow">${side==='v'?'Vesalius / '+scanLabel(r.v[r.detailSource]):'Geminus / '+r.g.collection+' / 1545'}</div><button class="studyimage" data-study-enlarge="${side}" aria-label="Enlarge ${side==='v'?'Vesalius':'Geminus'} study crop"><img class="artimage" src="${r[side+'detail']}" alt="${esc(r.detail)}"></button><button data-study-add="${side}">Add this crop to atlas</button></article>`).join('');
 $('studyImages').querySelectorAll('[data-study-enlarge]').forEach(b=>b.onclick=()=>openStudyImage(b.dataset.studyEnlarge));
 $('studyImages').querySelectorAll('[data-study-add]').forEach(b=>b.onclick=()=>{const side=b.dataset.studyAdd,[x,y,w,h]=r[side+'box'];addFragment(sourceFor(r,side,side==='v'?r.detailSource:0),{x,y,w,h},r.detail);setView('atlas');});
}
$('locateStudy').onclick=()=>{const r=record();vIndex=r.detailSource;gCopy='display';setOverview(false);setOverlay(false);resetCamera();regionTargets={record:current};['v','g'].forEach(s=>{const [x,y,w,h]=r[s+'box'];regionTargets[s]={box:{x,y,w,h},pageIndex:s==='v'?vIndex:0};});renderCompare();document.querySelector('.comptitle').scrollIntoView({block:'start'});};
function renderRegions(){['v','g'].forEach(side=>{const frame=$('frame'+side.toUpperCase());frame.querySelector('.source-region')?.remove();const target=regionTargets?.[side];if(!target||regionTargets.record!==current||(side==='v'&&target.pageIndex!==vIndex))return;const b=imageBounds(side);if(!b)return;const c=target.box,cam=cameras[side],el=document.createElement('div');el.className='source-region';el.setAttribute('aria-label','Selected fragment location');el.style.left=((b.left+c.x*b.w-frame.clientWidth/2)*cam.z+frame.clientWidth/2+cam.x)+'px';el.style.top=((b.top+c.y*b.h-frame.clientHeight/2)*cam.z+frame.clientHeight/2+cam.y)+'px';el.style.width=c.w*b.w*cam.z+'px';el.style.height=c.h*b.h*cam.z+'px';frame.appendChild(el);});}
window.addEventListener('resize',()=>{syncMobileCompare();updateCompareHelp();renderRegions();updateBoardScale();if($('image-dialog').open)applyDetailZoom();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cropMode)toggleCrop(false)});


function clearFilters(){for(const id of ['search','category','change'])$(id).value='';renderCatalogue();}
function renderFilterSummary(rows){const active=[$('search').value.trim()?'Search: '+$('search').value.trim():'',$('category').value,$('change').value].filter(Boolean);$('filterSummary').textContent=active.length?'Filtered: '+active.join(' · ')+'. Showing '+rows.length+' of 39 groups; original record numbers are retained.':'All 39 groups · ordered 01–39 to match the reference PDF · 107 source-page connections.';$('clearFilters').disabled=!active.length;$('clearFilters').textContent=active.length?'Clear filters / show all 39':'Showing all 39';}
$('clearFilters').onclick=clearFilters;
function openRecord(id){current=id;activeSide='v';mobileBoth=false;focusSide('v');vIndex=0;gCopy='pdf';overview=true;regionTargets=null;resetCamera();setOverlay(false);setView('compare');}
function renderCopyChoice(r){$('geminusCopy').innerHTML='<option value="pdf">NYPL / PDF copy</option>'+(r.g.scan?'<option value="display">Wellcome / larger scan</option>':'<option value="display">NYPL / trimmed page</option>');$('geminusCopy').value=gCopy;}
$('geminusCopy').onchange=()=>{gCopy=$('geminusCopy').value;regionTargets=null;resetCamera();renderCompare();};
$('jumpRecord').innerHTML=RECORDS.map(r=>`<option value="${r.id}">${pad(r.id)} / ${esc(r.title)}</option>`).join('');
$('jumpRecord').onchange=()=>openRecord(Number($('jumpRecord').value));
function updateMode(){$('groupOverview').hidden=!overview;$('pair').hidden=overview;$('compare').classList.toggle('overview-mode',overview);$('allMode').classList.toggle('active',overview);$('allMode').setAttribute('aria-pressed',String(overview));$('sideMode').classList.toggle('active',!overview&&!overlay);$('sideMode').setAttribute('aria-pressed',String(!overview&&!overlay));syncMobileCompare();updateCompareHelp();}
function setOverview(on){overview=on;if(on){toggleCrop(false);setOverlay(false);}updateMode();}
function inspectSource(index,side='v'){vIndex=index;regionTargets=null;resetCamera();setOverview(false);setOverlay(false);focusSide(side);renderCompare();$('compareHelp').scrollIntoView({block:'start'});}
function renderOverview(r){
 const g=gSource(r);const cols=r.v.length>6?4:r.v.length>1?2:1;
 $('groupOverview').innerHTML=`<div class="overview-sources" id="vesaliusSources"><div class="overview-heading"><h3>Vesalius / 1543</h3><span>${r.v.length} source ${r.v.length===1?'page':'pages'}</span></div><div class="all-source-grid" style="--source-columns:${cols}">${r.v.map((s,i)=>`<article class="source-page-card"><button class="source-page-image" data-inspect-source="${i}" aria-label="Inspect ${esc(s.work)}, ${scanLabel(s)}"><img class="artimage" src="${s.image}" width="${s.width}" height="${s.height}" alt="Vesalius, ${esc(s.work)}, ${scanLabel(s)}" loading="lazy"></button><div class="source-page-label"><span class="source-position">${pad(i+1)} / ${pad(r.v.length)}</span><h4>${s.work} / ${s.page?'p. '+s.page:'scan '+s.scan}</h4><p>${s.page?'Scan '+s.scan+' · ':''}${esc(s.collection)}</p><div class="source-page-actions"><button data-inspect-source="${i}">Inspect this page</button><a href="${esc(s.full)}" target="_blank" rel="noopener">Original scan</a></div></div></article>`).join('')}</div></div><aside class="overview-geminus" id="geminusPlate"><div class="overview-heading"><h3>Geminus / 1545</h3><span>1 plate</span></div><button class="overview-g-image" data-inspect-g aria-label="Inspect Geminus, ${esc(r.title)}, ${esc(g.institution)}"><img class="artimage" src="${g.url}" width="${g.width}" height="${g.height}" alt="Geminus, ${esc(r.title)}, ${esc(g.institution)}"></button><div class="source-page-label"><h4>${esc(g.institution)} / ${esc(g.page)}</h4><p>${g.width} × ${g.height} px · ${gCopy==='pdf'?'Copy shown in the reference PDF':r.g.scan?'Alternative copy of the same 1545 edition':'NYPL page with scanning borders trimmed'}</p><div class="source-page-actions"><button data-inspect-g>Inspect this plate</button><a href="${esc(g.original)}" target="_blank" rel="noopener">Original scan</a></div><p class="copy-note">${gCopy==='pdf'?(r.g.scan?'For closer inspection, select the larger Wellcome scan above.':'Only the NYPL reference has been matched for this plate in this archive.'):'Paper tone and reproduction differ between copies. These differences are separate from compositional changes.'}</p></div></aside>`;
 $('groupOverview').querySelectorAll('[data-inspect-source]').forEach(b=>b.onclick=()=>inspectSource(Number(b.dataset.inspectSource)));
 $('groupOverview').querySelectorAll('[data-inspect-g]').forEach(b=>b.onclick=()=>inspectSource(vIndex,'g'));
 $('groupOverview').querySelectorAll('img').forEach(im=>im.onerror=()=>thumbFailure(im));
}

try{const saved=localStorage.getItem('ootp-atlas-v3');if(saved!==null)fragments=validateFragments(JSON.parse(saved));else seedAtlas();}catch(e){fragments=[];seedAtlas();}
clearFilters();saveBoard();
