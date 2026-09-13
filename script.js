/* GRESIK BUILDING 360
   Semua data demo berada di BUILDINGS.
   Ganti panorama, foto, deskripsi, status PBG/SLF, alamat, dan koordinat dengan data resmi.
*/

const BUILDINGS = [
  {
    id:'gedung-pemda', name:'Kompleks Pemerintahan Kabupaten Gresik', short:'Kompleks Pemerintahan', category:'Pemerintahan',
    address:'Gresik — KOORDINAT DEMO', floors:'2–3 lantai (demo)', year:'Ganti data resmi',
    function:'Perkantoran', pbg:'Demo / verifikasi', slf:'Demo / verifikasi',
    description:'Contoh profil untuk kawasan pemerintahan. Gunakan data publik yang telah diverifikasi dan jangan memasukkan informasi keamanan atau dokumen sensitif.',
    image:'assets/images/gedung-pemda.jpg', panorama:'assets/panoramas/gedung-pemda.jpg',
    coords:{lat:-7.1565,lng:112.6553},
    hotspots:[
      {type:'info', pitch:-8, yaw:5, text:'Area lobi utama', info:'Tambahkan keterangan area publik di sini.'},
      {type:'scene', pitch:-4, yaw:80, text:'Lanjut ke area pelayanan', sceneId:'pelayanan'},
      {type:'photo', pitch:-20, yaw:-65, text:'Lihat foto detail', image:'assets/images/detail-lobi.jpg'}
    ]
  },
  {
    id:'pelayanan', name:'Gedung Pelayanan Publik — Contoh', short:'Pelayanan Publik', category:'Pelayanan',
    address:'Gresik — KOORDINAT DEMO', floors:'2 lantai (demo)', year:'Ganti data resmi',
    function:'Pelayanan masyarakat', pbg:'Demo / verifikasi', slf:'Demo / verifikasi',
    description:'Template gedung pelayanan publik untuk menguji pola navigasi antar-ruang. Ganti dengan gedung resmi dan koordinat sebenarnya.',
    image:'assets/images/gedung-pelayanan.jpg', panorama:'assets/panoramas/gedung-pelayanan.jpg',
    coords:{lat:-7.1612,lng:112.6591},
    hotspots:[
      {type:'scene', pitch:-7, yaw:-75, text:'Kembali ke kompleks pemerintahan', sceneId:'gedung-pemda'},
      {type:'info', pitch:-12, yaw:25, text:'Meja layanan', info:'Tempatkan info singkat mengenai jenis layanan publik di sini.'}
    ]
  },
  {
    id:'gedung-fasilitas', name:'Gedung Fasilitas Pemerintah — Contoh', short:'Fasilitas Umum', category:'Fasilitas Umum',
    address:'Gresik — KOORDINAT DEMO', floors:'1–2 lantai (demo)', year:'Ganti data resmi',
    function:'Fasilitas umum', pbg:'Demo / verifikasi', slf:'Demo / verifikasi',
    description:'Template untuk gedung olahraga, pertemuan, atau fasilitas publik milik pemerintah. Gunakan nama dan data resmi saat implementasi.',
    image:'assets/images/gedung-fasilitas.jpg', panorama:'assets/panoramas/gedung-fasilitas.jpg',
    coords:{lat:-7.1518,lng:112.6493},
    hotspots:[
      {type:'scene', pitch:-6, yaw:140, text:'Kembali ke area pelayanan', sceneId:'pelayanan'},
      {type:'info', pitch:-18, yaw:-30, text:'Ruang fasilitas', info:'Tambahkan informasi fasilitas yang aman untuk dipublikasikan.'}
    ]
  }
];

const $=s=>document.querySelector(s);
const els={splash:$('#splash'),topbar:$('#topbar'),viewer:$('#viewer'),hud:$('#hud'),controls:$('#controls'),loading:$('#loading'),loadingText:$('#loadingText'),sceneTitle:$('#sceneTitle'),categoryPill:$('#categoryPill'),sceneCount:$('#sceneCount'),progressFill:$('#progressFill'),yawReadout:$('#yawReadout'),sidebar:$('#sidebar'),mapPanel:$('#mapPanel'),drawerOverlay:$('#drawerOverlay'),mapOverlay:$('#mapOverlay'),sceneList:$('#sceneList'),search:$('#searchInput'),filters:$('#categoryFilters'),detail:$('#detailPanel')};
let viewer=null,current=BUILDINGS[0], favoriteOnly=false, favorites=new Set(JSON.parse(localStorage.getItem('gb360-favorites')||'[]'));
let map=null,osm=null,sat=null;

function toast(msg){const e=$('#toast');e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function saveFav(){localStorage.setItem('gb360-favorites',JSON.stringify([...favorites]));$('#favoriteCount').textContent=`${favorites.size} favorit`}
function isFav(id){return favorites.has(id)}
function syncFavButton(){const btn=$('#favoriteBtn');btn.innerHTML=isFav(current.id)?'<i class="fa-solid fa-heart"></i>':'<i class="fa-regular fa-heart"></i>';btn.title=isFav(current.id)?'Hapus favorit':'Tambah favorit'}
function toggleFavorite(id=current.id){favorites.has(id)?favorites.delete(id):favorites.add(id);saveFav();syncFavButton();renderList();toast(favorites.has(id)?'Ditambahkan ke favorit':'Dihapus dari favorit')}
function currentIndex(){return BUILDINGS.findIndex(b=>b.id===current.id)}
function goScene(id){const b=BUILDINGS.find(x=>x.id===id);if(!b)return;current=b;closeDrawers();openViewer()}
function openViewer(){
  els.loading.classList.remove('is-hidden');els.loadingText.textContent='Menyiapkan panorama bangunan';
  const config={type:'equirectangular',panorama:current.panorama,autoLoad:true,showControls:false,compass:false,mouseZoom:true,keyboardZoom:true,draggable:true,yaw:0,pitch:-2,hfov:95,hotSpots:current.hotspots.map(h=>hotspotConfig(h))};
  setTimeout(()=>{
    try{if(viewer)viewer.destroy();viewer=pannellum.viewer(els.viewer,config);viewer.on('load',()=>{els.loading.classList.add('is-hidden');updateUI();});viewer.on('error',()=>{els.loading.classList.add('is-hidden');toast('Panorama gagal dimuat. Cek path asset.');});viewer.on('animatefinished',updateYaw);updateUI();}
    catch(e){els.loading.classList.add('is-hidden');toast('Periksa file panorama pada assets/panoramas');console.error(e)}
  },120);
}
function hotspotConfig(h){
  if(h.type==='scene')return {pitch:h.pitch,yaw:h.yaw,type:'custom',cssClass:'pnlm-hotspot',createTooltipFunc:(el)=>{el.innerHTML='<i class="fa-solid fa-arrow-right"></i>';el.title=h.text},clickHandlerFunc:()=>goScene(h.sceneId)};
  return {pitch:h.pitch,yaw:h.yaw,type:'custom',cssClass:'pnlm-hotspot',createTooltipFunc:(el)=>{el.innerHTML=h.type==='photo'?'<i class="fa-solid fa-image"></i>':'<i class="fa-solid fa-circle-info"></i>';el.title=h.text},clickHandlerFunc:()=>showHotspot(h)};
}
function showHotspot(h){if(h.type==='photo'){$('#modalContent').innerHTML=`<h2>${h.text}</h2><img src="${h.image}" style="width:100%;border-radius:14px;margin-top:12px" alt="">`;}else{$('#modalContent').innerHTML=`<span class="eyebrow">INFO GEDUNG</span><h2>${h.text}</h2><p style="color:#9eb2bd;line-height:1.7">${h.info||'Tambahkan informasi pada object hotspot ini.'}</p>`;}$('#modal').classList.remove('is-hidden')}
function updateYaw(){if(viewer){let y=((viewer.getYaw()%360)+360)%360;els.yawReadout.textContent=`${Math.round(y)}°`}}
function updateUI(){els.sceneTitle.textContent=current.name;els.categoryPill.textContent=current.category.toUpperCase();const i=currentIndex();els.sceneCount.textContent=`${String(i+1).padStart(2,'0')} / ${String(BUILDINGS.length).padStart(2,'0')}`;els.progressFill.style.width=`${((i+1)/BUILDINGS.length)*100}%`;syncFavButton()}
function renderFilters(){const cats=['Semua',...new Set(BUILDINGS.map(b=>b.category))];els.filters.innerHTML=cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`).join('');els.filters.querySelectorAll('.chip').forEach(btn=>btn.addEventListener('click',()=>{els.filters.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderList(btn.dataset.cat)}))}
function renderList(category='Semua'){const q=els.search.value.toLowerCase();let arr=BUILDINGS.filter(b=>(category==='Semua'||b.category===category)&&(b.name.toLowerCase().includes(q)||b.category.toLowerCase().includes(q)||b.function.toLowerCase().includes(q))&&(favoriteOnly?!isFav(b.id)||false:true));els.sceneList.innerHTML=arr.map(b=>`<article class="scene-card ${b.id===current.id?'active':''}" data-id="${b.id}"><img class="scene-thumb" src="${b.image}" alt=""><div><strong>${b.short}</strong><small>${b.category} • ${b.function}</small></div><div class="status-dot">${isFav(b.id)?'♥':'●'}</div></article>`).join('')||'<div style="padding:20px;color:#8299a6">Tidak ada data sesuai filter.</div>';els.sceneList.querySelectorAll('.scene-card').forEach(c=>c.addEventListener('click',()=>goScene(c.dataset.id)))}
function openDetail(){
  $('#detailImage').src=current.image;$('#detailCategory').textContent=current.category;$('#detailTitle').textContent=current.name;$('#detailPbg').textContent=current.pbg;$('#detailSlf').textContent=current.slf;$('#detailFunction').textContent=current.function;$('#detailAddress').textContent=current.address;$('#detailFloors').textContent=current.floors;$('#detailYear').textContent=current.year;$('#detailDescription').textContent=current.description;syncDetailFav();els.detail.classList.add('open');els.detail.setAttribute('aria-hidden','false')
}
function syncDetailFav(){const b=$('#detailFavorite');b.innerHTML=isFav(current.id)?'<i class="fa-solid fa-heart"></i> Hapus Favorit':'<i class="fa-regular fa-heart"></i> Favorit'}
function closeDetail(){els.detail.classList.remove('open');els.detail.setAttribute('aria-hidden','true')}
function closeDrawers(){els.sidebar.classList.remove('open');els.mapPanel.classList.remove('open');els.drawerOverlay.classList.remove('open');els.mapOverlay.classList.remove('open')}
function openSidebar(){closeDrawers();els.sidebar.classList.add('open');els.drawerOverlay.classList.add('open')}
function openMap(){closeDrawers();els.mapPanel.classList.add('open');els.mapOverlay.classList.add('open');setTimeout(()=>{if(!map)buildMap();map.invalidateSize()},150)}
function buildMap(){map=L.map('leafletMap').setView([ -7.1558,112.6548],13);osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'});BUILDINGS.forEach(b=>{const m=L.marker([b.coords.lat,b.coords.lng]).addTo(map).bindPopup(`<b>${b.name}</b><br><span style="color:#666">${b.category}</span><br><button style="margin-top:7px" onclick="window.__openBuilding('${b.id}')">Buka 360°</button>`);m._buildingId=b.id});$('#mapLegend').innerHTML=BUILDINGS.map(b=>`<div style="margin:5px 0">● ${b.name}</div>`).join('')}
window.__openBuilding=id=>goScene(id);
function cycle(dir){let i=currentIndex();let n=(i+dir+BUILDINGS.length)%BUILDINGS.length;goScene(BUILDINGS[n].id)}
function showHow(){ $('#modalContent').innerHTML='<span class="eyebrow">CARA MENGGUNAKAN</span><h2>Jelajah Gedung 360°</h2><p style="color:#9eb2bd;line-height:1.7">Seret panorama untuk melihat sekeliling, gunakan tombol +/− untuk zoom, buka ikon gedung untuk profil, dan gunakan hotspot di panorama untuk berpindah scene atau melihat informasi.</p>';$('#modal').classList.remove('is-hidden')}

$('#startBtn').addEventListener('click',()=>{els.splash.classList.add('is-hidden');els.topbar.classList.remove('is-hidden');els.hud.classList.remove('is-hidden');els.controls.classList.remove('is-hidden');openViewer()});
$('#howBtn').addEventListener('click',showHow);$('#menuBtn').addEventListener('click',openSidebar);$('#closeSidebar').addEventListener('click',closeDrawers);$('#drawerOverlay').addEventListener('click',closeDrawers);$('#mapOverlay').addEventListener('click',closeDrawers);$('#mapBtn').addEventListener('click',openMap);$('#closeMap').addEventListener('click',closeDrawers);$('#infoBtn').addEventListener('click',openDetail);$('#closeDetail').addEventListener('click',closeDetail);$('#favoriteBtn').addEventListener('click',()=>toggleFavorite());$('#detailFavorite').addEventListener('click',()=>{toggleFavorite();syncDetailFav()});$('#detailTour').addEventListener('click',()=>{closeDetail();openViewer()});$('#modalClose').addEventListener('click',()=>$('#modal').classList.add('is-hidden'));$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.add('is-hidden')});$('#homeBtn').addEventListener('click',()=>{closeDrawers();closeDetail();els.topbar.classList.add('is-hidden');els.hud.classList.add('is-hidden');els.controls.classList.add('is-hidden');els.splash.classList.remove('is-hidden')});$('#zoomIn').addEventListener('click',()=>viewer&&viewer.setHfov(Math.max(40,viewer.getHfov()-10)));$('#zoomOut').addEventListener('click',()=>viewer&&viewer.setHfov(Math.min(120,viewer.getHfov()+10)));let rotating=false;$('#rotateBtn').addEventListener('click',()=>{if(!viewer)return;rotating=!rotating;viewer[rotating?'startAutoRotate':'stopAutoRotate'](4)});$('#fullscreenBtn').addEventListener('click',()=>viewer&&viewer.toggleFullscreen());$('#gyroBtn').addEventListener('click',()=>toast('Mode sensor membutuhkan dukungan perangkat/browser.'));$('#prevBtn').addEventListener('click',()=>cycle(-1));$('#nextBtn').addEventListener('click',()=>cycle(1));$('#searchInput').addEventListener('input',()=>renderList());$('#favoritesOnly').addEventListener('click',()=>{favoriteOnly=!favoriteOnly;renderList();toast(favoriteOnly?'Menampilkan favorit':'Menampilkan semua gedung')});$('#osmLayerBtn').addEventListener('click',()=>{if(map&&sat)map.removeLayer(sat);if(map&&!map.hasLayer(osm))map.addLayer(osm);$('#osmLayerBtn').classList.add('active');$('#satLayerBtn').classList.remove('active')});$('#satLayerBtn').addEventListener('click',()=>{if(map&&osm)map.removeLayer(osm);if(map&&!map.hasLayer(sat))map.addLayer(sat);$('#satLayerBtn').classList.add('active');$('#osmLayerBtn').classList.remove('active')});$('#mapLocateBtn').addEventListener('click',()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>map.setView([p.coords.latitude,p.coords.longitude],16),()=>toast('Lokasi tidak tersedia')):toast('Browser tidak mendukung lokasi'));

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawers();closeDetail();$('#modal').classList.add('is-hidden')}});

saveFav();renderFilters();renderList();
