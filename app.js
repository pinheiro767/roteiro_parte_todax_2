
const D=window.STRUCTURES;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let active='ALL', current=null, sound=true, deferredPrompt=null;
const sections=$('#sections'), toast=$('#toast');

function beep(freq=520,dur=.06){
 if(!sound)return;
 const A=window.AudioContext||window.webkitAudioContext, c=beep.ctx||(beep.ctx=new A());
 const o=c.createOscillator(),g=c.createGain(); o.frequency.value=freq;o.type='sine';g.gain.value=.025;o.connect(g).connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.stop(c.currentTime+dur);
}
document.addEventListener('click',e=>{if(e.target.closest('button,.card,.upload,.filelabel'))beep()});

function render(){
 const q=$('#search').value.trim().toLocaleLowerCase('pt-BR');
 const data=D.filter(x=>(active==='ALL'||x.group===active)&&x.name.toLocaleLowerCase('pt-BR').includes(q));
 sections.innerHTML='';
 [...new Set(data.map(x=>x.group))].forEach(g=>{
   const arr=data.filter(x=>x.group===g); if(!arr.length)return;
   const sec=document.createElement('section');sec.className='section';
   sec.innerHTML=`<div class="section-head"><div><small>${g}</small><h2>${arr[0].section}</h2></div><small>${arr.length} itens</small></div><div class="grid"></div>`;
   const grid=sec.querySelector('.grid');
   arr.forEach(x=>{
    const c=document.createElement('article');c.className='card';c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label',`Abrir ${x.name}`);
    c.innerHTML=`<div class="card-img"><img src="assets/estruturas/${x.image}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="placeholder" style="display:none">⌬</span></div><div class="card-body"><span class="num">${String(x.id).padStart(3,'0')}</span><h3>${x.name}</h3><span class="file">${x.image}</span><span class="arrow">↗</span></div>`;
    c.onclick=()=>openItem(x);c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openItem(x)}};grid.appendChild(c)
   });
   sections.appendChild(sec);
 });
}
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.group;render()});
$('#search').oninput=render;$('#countTotal').textContent=D.length;

function dbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open('toraxAtlasDB',1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos',{keyPath:'key'});if(!db.objectStoreNames.contains('notes'))db.createObjectStore('notes',{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function getStore(store,mode='readonly'){const db=await dbOpen();return db.transaction(store,mode).objectStore(store)}
async function getPhotos(id){return new Promise(async res=>{const s=await getStore('photos');const r=s.getAll();r.onsuccess=()=>res(r.result.filter(x=>x.id===id));r.onerror=()=>res([])})}
async function addPhoto(id,file){const data=await file.arrayBuffer();return new Promise(async res=>{const s=await getStore('photos','readwrite');const key=`${id}_${Date.now()}_${Math.random()}`;s.put({key,id,type:file.type,data});s.transaction.oncomplete=res})}
async function getNote(id){return new Promise(async res=>{const s=await getStore('notes');const r=s.get(id);r.onsuccess=()=>res(r.result?.text||'');r.onerror=()=>res('')})}
async function setNote(id,text){const s=await getStore('notes','readwrite');s.put({id,text})}
function blobUrl(p){return URL.createObjectURL(new Blob([p.data],{type:p.type}))}

async function openItem(x){
 current=x;$('#modalGroup').textContent=x.group;$('#modalTitle').textContent=x.name;$('#imageName').textContent=`Imagem principal: ${x.image}`;
 $('#notes').value=await getNote(x.id); await loadGallery(x);$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'
}
async function loadGallery(x){
 const photos=await getPhotos(x.id), thumbs=$('#thumbs'), img=$('#mainImage'); thumbs.innerHTML='';
 const defaultSrc=`assets/estruturas/${x.image}`;
 img.src=defaultSrc;img.alt=`${x.name} — ${x.image}`;img.onerror=()=>{img.onerror=null;img.src=placeholderSVG(x.id,x.name)};
 const sources=[{src:defaultSrc,label:x.image},...photos.map((p,i)=>({src:blobUrl(p),label:`foto ${i+2}`}))];
 sources.forEach((s,i)=>{const t=document.createElement('img');t.className='thumb'+(i===0?' active':'');t.src=s.src;t.alt=s.label;t.onerror=()=>{t.onerror=null;t.src=placeholderSVG(x.id,x.name)};t.onclick=()=>{$$('.thumb').forEach(z=>z.classList.remove('active'));t.classList.add('active');img.src=t.src};thumbs.appendChild(t)})
}
function placeholderSVG(id,name){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><defs><radialGradient id="g"><stop stop-color="#123a55"/><stop offset="1" stop-color="#040a10"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="43%" text-anchor="middle" fill="#55e7ff" font-size="86" font-family="Arial" font-weight="700">${id}.png</text><text x="50%" y="55%" text-anchor="middle" fill="#9bb8c7" font-size="30" font-family="Arial">Adicione a imagem desta estrutura</text></svg>`)}
$('.modal-close').onclick=closeModal;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');document.body.style.overflow=''}
$('#notes').oninput=e=>{if(current)setNote(current.id,e.target.value)};
$('#photoInput').onchange=async e=>{if(!current)return;for(const f of e.target.files)await addPhoto(current.id,f);await loadGallery(current);showToast(`${e.target.files.length} foto(s) adicionada(s)`);e.target.value=''};
$('#speakBtn').onclick=()=>speak(current?.name||'');function speak(t){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='pt-BR';u.rate=.9;speechSynthesis.speak(u)}
$('#readPage').onclick=()=>speak('Anatomia Humana Topográfica de Tórax. '+D.map(x=>x.name).join('. '));

$('#a11yBtn').onclick=()=>{$('#a11yPanel').classList.add('open');$('#a11yPanel').setAttribute('aria-hidden','false')};$('#closeA11y').onclick=()=>{$('#a11yPanel').classList.remove('open');$('#a11yPanel').setAttribute('aria-hidden','true')};
$('#contrastBtn').onclick=()=>document.body.classList.toggle('contrast');$('#motionBtn').onclick=()=>document.body.classList.toggle('reduce-motion');
$('#fontPlus').onclick=()=>{let v=parseFloat(getComputedStyle(document.documentElement).fontSize);document.documentElement.style.setProperty('--font',Math.min(21,v+1)+'px')};
$('#fontMinus').onclick=()=>{let v=parseFloat(getComputedStyle(document.documentElement).fontSize);document.documentElement.style.setProperty('--font',Math.max(13,v-1)+'px')};
$('#soundBtn').onclick=e=>{sound=!sound;e.currentTarget.textContent=sound?'🔊':'🔇'};
$('#fullscreenBtn').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();

$('#exportBtn').onclick=async()=>{
 const notes={};for(const x of D)notes[x.id]=await getNote(x.id);
 const blob=new Blob([JSON.stringify({app:'Atlas Tórax',version:1,notes},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='atlas-torax-dados.json';a.click();URL.revokeObjectURL(a.href)
};
$('#importData').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());for(const [id,text] of Object.entries(j.notes||{}))await setNote(Number(id),text);showToast('Anotações importadas')}catch{showToast('Arquivo inválido')}};

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));

function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1900)}
const c=$('#bg'),ctx=c.getContext('2d');let pts=[];
function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);pts=Array.from({length:Math.min(75,Math.floor(innerWidth/16))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.7+.3,v:Math.random()*.22+.05}))}
function anim(){ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='rgba(85,231,255,.5)';pts.forEach(p=>{p.y-=p.v;if(p.y<-5)p.y=innerHeight+5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()});requestAnimationFrame(anim)}window.onresize=resize;resize();anim();render();
