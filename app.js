(() => {
  const VERSION = '3.0 Final';
  const KEY = 'meteoraOrder3Data';
  const DEFAULT_PIN = '1234';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const palette = ['#38bdf8','#22c55e','#f59e0b','#ef4444','#a855f7','#14b8a6','#f97316','#64748b','#ec4899','#84cc16'];

  const defaultData = () => ({
    version: VERSION,
    restaurant: { name: 'Restaurant Meteora', subtitle: 'Meteora Order 3.0' },
    pin: DEFAULT_PIN,
    design: { bg:'#0f172a', accent:'#38bdf8', free:'#22c55e', busy:'#ef4444', fontSize:16, buttonScale:1, tableMin:120 },
    areas: [
      { id:'innen', name:'Innen', icon:'🍽️', color:'#38bdf8', tables: range(1,10) },
      { id:'aussen', name:'Außen', icon:'☀️', color:'#22c55e', tables: [...range(20,40),'223'].map(String) },
      { id:'haus', name:'Außer Haus', icon:'🚗', color:'#60a5fa', tables:['50'] },
      { id:'saal', name:'Saal', icon:'🎉', color:'#f59e0b', tables: range(100,140) }
    ],
    groups: [
      { id:'speisen', name:'Speisen', icon:'🍽️', color:'#38bdf8', order:1 },
      { id:'getraenke', name:'Getränke', icon:'🥤', color:'#22c55e', order:2 }
    ],
    subgroups: [
      { id:'vorspeisen', groupId:'speisen', name:'Vorspeisen', icon:'🥗', color:'#22c55e', order:1 },
      { id:'salate', groupId:'speisen', name:'Salate', icon:'🥗', color:'#16a34a', order:2 },
      { id:'grill', groupId:'speisen', name:'Grillgerichte', icon:'🥩', color:'#f97316', order:3 },
      { id:'fisch', groupId:'speisen', name:'Fisch', icon:'🐟', color:'#38bdf8', order:4 },
      { id:'dessert', groupId:'speisen', name:'Dessert', icon:'🍰', color:'#ec4899', order:5 },
      { id:'alkfrei', groupId:'getraenke', name:'Alkoholfrei', icon:'🥤', color:'#38bdf8', order:1 },
      { id:'bier', groupId:'getraenke', name:'Bier', icon:'🍺', color:'#f59e0b', order:2 },
      { id:'wein', groupId:'getraenke', name:'Wein', icon:'🍷', color:'#ef4444', order:3 },
      { id:'schnaps', groupId:'getraenke', name:'Schnaps / Ouzo', icon:'🥃', color:'#a855f7', order:4 },
      { id:'heiss', groupId:'getraenke', name:'Heißgetränke', icon:'☕', color:'#92400e', order:5 }
    ],
    items: [
      item('tzatziki','Tzatziki','speisen','vorspeisen',5.9,'Tzatziki mit Brot','Joghurt, Gurke, Knoblauch','Milch',''),
      item('bauernsalat','Bauernsalat','speisen','salate',12.9,'Griechischer Salat','Tomate, Gurke, Zwiebel, Feta, Oliven','Milch',''),
      item('gyros','Gyros Teller','speisen','grill',14.9,'Gyros Teller','Gyros, Tzatziki, Pommes, Salat','Milch, Senf',''),
      item('souvlaki','Souvlaki Teller','speisen','grill',15.9,'Souvlaki Teller','Fleischspieße, Pommes, Salat, Tzatziki','Milch',''),
      item('bifteki','Bifteki','speisen','grill',16.9,'Gefülltes Hacksteak','Hacksteak mit Feta, Pommes, Salat','Milch, Gluten',''),
      item('lachs','Lachsfilet','speisen','fisch',19.9,'Lachsfilet','Lachs, Gemüse, Kartoffeln','Fisch',''),
      item('galaktoboureko','Galaktoboureko','speisen','dessert',6.9,'Griechischer Nachtisch','Grießcreme im Blätterteig','Gluten, Milch, Ei',''),
      item('cola03','Cola 0,3','getraenke','alkfrei',3.4,'Cola 0,3 l','0,3 l','', 'koffeinhaltig'),
      item('wasser','Wasser 0,75','getraenke','alkfrei',6.5,'Mineralwasser','0,75 l','', ''),
      item('pils','Pils 0,4','getraenke','bier',4.2,'Pils','0,4 l','Gluten','alkoholhaltig'),
      item('weizen','Weizen 0,5','getraenke','bier',4.8,'Weizenbier','0,5 l','Gluten','alkoholhaltig'),
      item('rotwein','Rotwein 0,2','getraenke','wein',5.5,'Rotwein','0,2 l','Sulfite','alkoholhaltig'),
      item('ouzo','Ouzo','getraenke','schnaps',2.9,'Ouzo','2 cl','', 'alkoholhaltig'),
      item('kaffee','Kaffee','getraenke','heiss',2.9,'Kaffee','Tasse Kaffee','', 'koffeinhaltig')
    ],
    orders: {},
    removed: [],
    lastArea: 'innen'
  });
  function range(a,b){ return Array.from({length:b-a+1},(_,i)=>String(a+i)); }
  function item(id,name,groupId,subgroupId,price,description,contents,allergens,additives){return {id,name,groupId,subgroupId,price,description,contents,allergens,additives,active:true,color:'',order:0};}

  let data = load();
  let currentArea = data.lastArea || 'innen';
  let currentTable = null;
  let groupFilter = data.groups[0]?.id || '';
  let subgroupFilter = '';
  let adminUnlocked = false;
  let deferredInstall = null;

  function load(){
    try { const raw = localStorage.getItem(KEY); if(raw) return normalize(JSON.parse(raw)); } catch(e) { console.warn(e); }
    const d = defaultData(); save(d); return d;
  }
  function normalize(d){
    const def = defaultData();
    d.version = VERSION;
    d.restaurant ||= def.restaurant; d.pin ||= DEFAULT_PIN; d.design = {...def.design, ...(d.design||{})};
    d.areas ||= def.areas; d.groups ||= def.groups; d.subgroups ||= def.subgroups; d.items ||= def.items; d.orders ||= {}; d.removed ||= [];
    for(const area of d.areas){ area.tables = (area.tables||[]).map(String); }
    return d;
  }
  function save(d=data){ localStorage.setItem(KEY, JSON.stringify(d)); applyDesign(); }
  function orderKey(areaId, tableNo){ return `${areaId}:${tableNo}`; }
  function getOrder(areaId=currentArea, tableNo=currentTable){ const k=orderKey(areaId,tableNo); data.orders[k] ||= { areaId, tableNo:String(tableNo), guests:0, lines:[], mergedWith:[] }; return data.orders[k]; }
  function isBusy(areaId, tableNo){ const o=data.orders[orderKey(areaId,tableNo)]; return !!(o && (o.lines?.length || Number(o.guests)>0 || o.mergedWith?.length)); }
  function fmt(n){ return Number(n||0).toFixed(2).replace('.',',')+' €'; }
  function uid(prefix='id'){ return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
  function esc(s=''){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function applyDesign(){
    const ds=data.design||{}; const root=document.documentElement.style;
    root.setProperty('--bg', ds.bg||'#0f172a'); root.setProperty('--accent', ds.accent||'#38bdf8'); root.setProperty('--free', ds.free||'#22c55e'); root.setProperty('--busy', ds.busy||'#ef4444');
    root.setProperty('--fontSize', (ds.fontSize||16)+'px'); root.setProperty('--btnSize', ((ds.buttonScale||1))+'rem'); root.setProperty('--tableMin', (ds.tableMin||120)+'px');
    $('#restaurantTitle').textContent = data.restaurant.name || 'Restaurant Meteora';
    $('#subTitle').textContent = `${data.restaurant.subtitle || 'Meteora Order'} · ${VERSION}`;
  }

  function showView(name){
    $$('.view').forEach(v=>v.classList.remove('active'));
    $(`#${name}View`)?.classList.add('active');
    if(name==='tables') renderAreas();
    if(name==='admin') renderAdmin();
    if(name==='system') renderSystem();
  }

  function renderAreas(){
    applyDesign();
    $('#areasGrid').classList.remove('hidden'); $('#tablesPanel').classList.add('hidden'); $('#backToAreas').classList.add('hidden');
    $('#areasGrid').innerHTML = data.areas.map(a=>{
      const total=a.tables.length, busy=a.tables.filter(t=>isBusy(a.id,t)).length;
      return `<button class="tile" style="border-color:${a.color}" data-area="${a.id}"><h3>${a.icon||''} ${esc(a.name)}</h3><p>${busy} besetzt · ${total-busy} frei · ${total} Tische</p></button>`;
    }).join('');
  }
  function renderTables(areaId=currentArea){
    currentArea=areaId; data.lastArea=areaId; save();
    const area=data.areas.find(a=>a.id===areaId); if(!area) return;
    $('#areasGrid').classList.add('hidden'); $('#tablesPanel').classList.remove('hidden'); $('#backToAreas').classList.remove('hidden');
    const busy=area.tables.filter(t=>isBusy(area.id,t)).length;
    $('#areaTitle').textContent = `${area.icon||''} ${area.name}`;
    $('#areaSummary').textContent = `${busy} besetzt · ${area.tables.length-busy} frei`;
    $('#tablesGrid').innerHTML = area.tables.map(t=>{
      const busyNow=isBusy(area.id,t), order=data.orders[orderKey(area.id,t)];
      const count=order?.lines?.reduce((a,l)=>a+Number(l.qty||0),0)||0;
      return `<button class="tableTile ${busyNow?'busy':'free'}" data-table="${t}"><h3><span class="statusDot ${busyNow?'dotBusy':'dotFree'}"></span>Tisch ${esc(t)}</h3><p>${busyNow?`${count} Positionen`:'frei'}</p></button>`;
    }).join('');
  }
  function openTable(no){ currentTable=String(no); getOrder(); showView('order'); renderOrder(); renderMenu(); }

  function renderOrder(){
    const area=data.areas.find(a=>a.id===currentArea); const order=getOrder();
    $('#currentTableTitle').textContent = `${area?.icon||''} ${area?.name||''} · Tisch ${currentTable}`;
    $('#guestCount').value = order.guests || 0;
    if(!order.lines.length){ $('#orderList').innerHTML='<div class="empty">Noch keine Positionen.</div>'; return; }
    $('#orderList').innerHTML = order.lines.map(line=>`
      <div class="orderLine" data-line="${line.id}">
        <div class="orderLineTop"><strong>${esc(line.name)}</strong><span>×${line.qty}</span></div>
        ${line.note?`<p class="hint">💬 ${esc(line.note)}</p>`:''}
        <div class="qtyBtns">
          <button data-qty="-1" data-line="${line.id}">−</button><button data-qty="1" data-line="${line.id}">+</button>
          <button data-note-line="${line.id}">💬</button><button data-remove-line="${line.id}" class="danger">Löschen</button>
        </div>
      </div>`).join('');
  }

  function renderMenu(){
    $('#groupTabs').innerHTML = data.groups.sort((a,b)=>(a.order||0)-(b.order||0)).map(g=>`<button class="${g.id===groupFilter?'active':''}" style="background:${g.color||''}" data-group="${g.id}">${g.icon||''} ${esc(g.name)}</button>`).join('');
    const subs = data.subgroups.filter(s=>s.groupId===groupFilter).sort((a,b)=>(a.order||0)-(b.order||0));
    if(!subs.some(s=>s.id===subgroupFilter)) subgroupFilter = subs[0]?.id || '';
    $('#subgroupTabs').innerHTML = subs.map(s=>`<button class="${s.id===subgroupFilter?'active':''}" style="border-color:${s.color};background:${s.id===subgroupFilter?s.color:'#ffffff12'}" data-subgroup="${s.id}">${s.icon||''} ${esc(s.name)}</button>`).join('');
    const q=$('#searchInput').value.trim().toLowerCase();
    let items=data.items.filter(i=>i.active!==false);
    if(q) items=items.filter(i=>[i.name,i.description,i.contents,i.allergens,i.additives, groupName(i.groupId), subgroupName(i.subgroupId)].join(' ').toLowerCase().includes(q));
    else items=items.filter(i=>i.groupId===groupFilter && i.subgroupId===subgroupFilter);
    $('#itemsGrid').innerHTML = items.map(i=>`
      <div class="itemBtn" style="border-color:${i.color || subgroupColor(i.subgroupId)}">
        <strong>${esc(i.name)}</strong><span class="price">${fmt(i.price)}</span>
        <small>${esc(subgroupName(i.subgroupId))}</small>
        <div class="itemActions"><button data-add-item="${i.id}" class="accent">+ Hinzufügen</button><button data-info-item="${i.id}">ℹ️</button><button data-note-item="${i.id}">💬</button></div>
      </div>`).join('') || '<p class="empty">Keine Artikel gefunden.</p>';
  }
  const groupName=id=>data.groups.find(g=>g.id===id)?.name||'';
  const subgroupName=id=>data.subgroups.find(s=>s.id===id)?.name||'';
  const subgroupColor=id=>data.subgroups.find(s=>s.id===id)?.color||'#ffffff22';

  function addItem(itemId, note=''){
    const it=data.items.find(i=>i.id===itemId); if(!it) return;
    const o=getOrder();
    const existing=o.lines.find(l=>l.itemId===itemId && (l.note||'')===(note||''));
    if(existing) existing.qty += 1; else o.lines.push({id:uid('line'), itemId, name:it.name, qty:1, note, custom:false});
    save(); renderOrder(); renderTables(currentArea);
  }
  function addMisc(name, qty, note){
    const o=getOrder(); o.lines.push({id:uid('misc'), itemId:null, name:name||'Sonstiges', qty:Number(qty)||1, note:note||'', custom:true});
    save(); renderOrder(); renderTables(currentArea);
  }
  function changeQty(lineId, delta){
    const o=getOrder(); const line=o.lines.find(l=>l.id===lineId); if(!line) return;
    line.qty += delta; if(line.qty<=0) removeLine(lineId, false); else { save(); renderOrder(); renderTables(currentArea); }
  }
  function removeLine(lineId, rerender=true){
    const o=getOrder(); const idx=o.lines.findIndex(l=>l.id===lineId); if(idx<0) return;
    const [line]=o.lines.splice(idx,1); data.removed.unshift({...line, areaId:currentArea, tableNo:currentTable, removedAt:new Date().toISOString()}); data.removed=data.removed.slice(0,20);
    save(); if(rerender){ renderOrder(); renderTables(currentArea); }
  }
  function undoLast(){ const o=getOrder(); const last=o.lines[o.lines.length-1]; if(last) removeLine(last.id); }
  function restoreLast(){ const r=data.removed.shift(); if(!r) return alert('Nichts zum Wiederherstellen.'); currentArea=r.areaId; currentTable=r.tableNo; const o=getOrder(); delete r.areaId; delete r.tableNo; delete r.removedAt; o.lines.push(r); save(); renderOrder(); }

  function modal(html){ $('#modalBody').innerHTML=html; $('#modal').showModal(); }
  function closeModal(){ $('#modal').close(); }
  function infoModal(itemId){
    const i=data.items.find(x=>x.id===itemId); if(!i) return;
    modal(`<h2>ℹ️ ${esc(i.name)}</h2><p>${esc(i.description||'')}</p><h3>Inhalt / Beilagen</h3><p>${esc(i.contents||'Keine Angaben')}</p><h3>Allergene</h3><p>${esc(i.allergens||'Keine Angaben')}</p><h3>Zusatzstoffe</h3><p>${esc(i.additives||'Keine Angaben')}</p><div class="modalActions"><button>Schließen</button></div>`);
  }
  function noteForItem(itemId){ modal(`<h2>💬 Bemerkung</h2><textarea id="noteText" placeholder="z. B. ohne Zwiebeln"></textarea><div class="modalActions"><button value="cancel">Abbrechen</button><button id="noteAdd" class="accent" value="default">Hinzufügen</button></div>`); $('#noteAdd').onclick=()=>{ addItem(itemId,$('#noteText').value.trim()); closeModal(); }; }
  function noteForLine(lineId){ const o=getOrder(); const l=o.lines.find(x=>x.id===lineId); if(!l) return; modal(`<h2>💬 Bemerkung ändern</h2><textarea id="lineNoteText">${esc(l.note||'')}</textarea><div class="modalActions"><button value="cancel">Abbrechen</button><button id="lineNoteSave" class="accent" value="default">Speichern</button></div>`); $('#lineNoteSave').onclick=()=>{ l.note=$('#lineNoteText').value.trim(); save(); renderOrder(); closeModal(); }; }
  function miscModal(){ modal(`<h2>➕ Sonstiges</h2><label>Bezeichnung<input id="miscName" placeholder="z. B. Extra Brot"></label><label>Menge<input id="miscQty" type="number" min="1" value="1"></label><label>Bemerkung<textarea id="miscNote"></textarea></label><div class="modalActions"><button value="cancel">Abbrechen</button><button id="miscSave" class="accent" value="default">Hinzufügen</button></div>`); $('#miscSave').onclick=()=>{ addMisc($('#miscName').value.trim(), $('#miscQty').value, $('#miscNote').value.trim()); closeModal(); }; }

  function renderAdmin(){
    if(!adminUnlocked){ $('#adminLock').classList.remove('hidden'); $('#adminContent').classList.add('hidden'); return; }
    $('#adminLock').classList.add('hidden'); $('#adminContent').classList.remove('hidden');
    renderAdminTables(); renderAdminMenu(); renderAdminDesign(); renderAdminSettings();
  }
  function renderAdminTables(){
    $('#adminTables').innerHTML = `<div class="adminGrid"><div class="card"><h3>Bereiche & Tische</h3><div class="list">${data.areas.map(a=>`<div class="listRow"><div><strong>${a.icon} ${esc(a.name)}</strong><br><small>${a.tables.length} Tische</small></div><button data-edit-area="${a.id}">Bearbeiten</button></div>`).join('')}</div><button id="addArea" class="accent full">+ Bereich</button></div></div>`;
  }
  function renderAdminMenu(){
    $('#adminMenu').innerHTML = `<div class="adminGrid"><div class="card"><h3>Hauptgruppen</h3><div class="list">${data.groups.map(g=>`<div class="listRow"><span>${g.icon||''} ${esc(g.name)}</span><button data-edit-group="${g.id}">Bearbeiten</button></div>`).join('')}</div><button id="addGroup" class="accent full">+ Hauptgruppe</button></div><div class="card"><h3>Untergruppen</h3><div class="list">${data.subgroups.map(s=>`<div class="listRow"><span>${s.icon||''} ${esc(s.name)} <small>(${esc(groupName(s.groupId))})</small></span><button data-edit-sub="${s.id}">Bearbeiten</button></div>`).join('')}</div><button id="addSub" class="accent full">+ Untergruppe</button></div><div class="card"><h3>Artikel</h3><div class="list">${data.items.map(i=>`<div class="listRow"><span>${i.active===false?'🚫':'✅'} ${esc(i.name)} <small>${fmt(i.price)}</small></span><button data-edit-item-admin="${i.id}">Bearbeiten</button></div>`).join('')}</div><button id="addAdminItem" class="accent full">+ Artikel</button></div></div>`;
  }
  function renderAdminDesign(){
    const d=data.design;
    $('#adminDesign').innerHTML = `<div class="adminGrid"><div class="card"><h3>Design</h3>${colorInput('Hintergrund','bg',d.bg)}${colorInput('Akzent','accent',d.accent)}${colorInput('Frei','free',d.free)}${colorInput('Besetzt','busy',d.busy)}<label>Schriftgröße<input id="fontSizeInput" type="range" min="14" max="24" value="${d.fontSize}"></label><label>Tischgröße<input id="tableMinInput" type="range" min="95" max="210" value="${d.tableMin}"></label><button id="saveDesign" class="accent full">Design speichern</button></div></div>`;
  }
  function colorInput(label,key,value){ return `<label class="colorRow"><span>${label}</span><input type="color" data-design-color="${key}" value="${value}"></label>`; }
  function renderAdminSettings(){
    $('#adminSettings').innerHTML = `<div class="adminGrid"><div class="card"><h3>Restaurant</h3><label>Name<input id="restName" value="${esc(data.restaurant.name)}"></label><label>Untertitel<input id="restSub" value="${esc(data.restaurant.subtitle)}"></label><button id="saveRestaurant" class="accent full">Speichern</button></div><div class="card"><h3>PIN ändern</h3><label>Neue PIN<input id="newPin" type="password" inputmode="numeric"></label><button id="savePin" class="accent full">PIN speichern</button></div></div>`;
  }

  function editArea(id){
    const a=id?data.areas.find(x=>x.id===id):{id:uid('area'),name:'Neuer Bereich',icon:'📍',color:'#38bdf8',tables:[]};
    modal(`<h2>Bereich</h2><label>Name<input id="areaName" value="${esc(a.name)}"></label><label>Symbol<input id="areaIcon" value="${esc(a.icon||'')}"></label><label>Farbe<input id="areaColor" type="color" value="${a.color||'#38bdf8'}"></label><label>Tische (Komma-getrennt)<textarea id="areaTables">${esc(a.tables.join(', '))}</textarea></label><div class="modalActions"><button value="cancel">Abbrechen</button>${id?'<button id="deleteArea" class="danger" value="default">Löschen</button>':''}<button id="saveArea" class="accent" value="default">Speichern</button></div>`);
    $('#saveArea').onclick=()=>{ a.name=$('#areaName').value.trim(); a.icon=$('#areaIcon').value.trim(); a.color=$('#areaColor').value; a.tables=$('#areaTables').value.split(',').map(x=>x.trim()).filter(Boolean); if(!id)data.areas.push(a); save(); renderAdmin(); renderAreas(); closeModal(); };
    if(id) $('#deleteArea').onclick=()=>{ if(confirm('Bereich löschen?')){ data.areas=data.areas.filter(x=>x.id!==id); save(); renderAdmin(); closeModal(); } };
  }
  function editGroup(id){
    const g=id?data.groups.find(x=>x.id===id):{id:uid('group'),name:'Neue Hauptgruppe',icon:'',color:palette[0],order:data.groups.length+1};
    modal(`<h2>Hauptgruppe</h2><label>Name<input id="gName" value="${esc(g.name)}"></label><label>Symbol<input id="gIcon" value="${esc(g.icon||'')}"></label><label>Farbe<input id="gColor" type="color" value="${g.color||palette[0]}"></label><label>Reihenfolge<input id="gOrder" type="number" value="${g.order||0}"></label><div class="modalActions"><button value="cancel">Abbrechen</button>${id?'<button id="deleteG" class="danger" value="default">Löschen</button>':''}<button id="saveG" class="accent" value="default">Speichern</button></div>`);
    $('#saveG').onclick=()=>{ g.name=$('#gName').value.trim(); g.icon=$('#gIcon').value.trim(); g.color=$('#gColor').value; g.order=Number($('#gOrder').value)||0; if(!id)data.groups.push(g); save(); renderAdmin(); renderMenu(); closeModal(); };
    if(id) $('#deleteG').onclick=()=>{ if(confirm('Hauptgruppe löschen?')){ data.groups=data.groups.filter(x=>x.id!==id); save(); renderAdmin(); closeModal(); } };
  }
  function editSub(id){
    const s=id?data.subgroups.find(x=>x.id===id):{id:uid('sub'),groupId:data.groups[0]?.id,name:'Neue Untergruppe',icon:'',color:palette[1],order:data.subgroups.length+1};
    modal(`<h2>Untergruppe</h2><label>Hauptgruppe<select id="sGroup">${data.groups.map(g=>`<option value="${g.id}" ${g.id===s.groupId?'selected':''}>${esc(g.name)}</option>`)}</select></label><label>Name<input id="sName" value="${esc(s.name)}"></label><label>Symbol<input id="sIcon" value="${esc(s.icon||'')}"></label><label>Farbe<input id="sColor" type="color" value="${s.color||palette[1]}"></label><label>Reihenfolge<input id="sOrder" type="number" value="${s.order||0}"></label><div class="modalActions"><button value="cancel">Abbrechen</button>${id?'<button id="deleteS" class="danger" value="default">Löschen</button>':''}<button id="saveS" class="accent" value="default">Speichern</button></div>`);
    $('#saveS').onclick=()=>{ s.groupId=$('#sGroup').value; s.name=$('#sName').value.trim(); s.icon=$('#sIcon').value.trim(); s.color=$('#sColor').value; s.order=Number($('#sOrder').value)||0; if(!id)data.subgroups.push(s); save(); renderAdmin(); renderMenu(); closeModal(); };
    if(id) $('#deleteS').onclick=()=>{ if(confirm('Untergruppe löschen?')){ data.subgroups=data.subgroups.filter(x=>x.id!==id); save(); renderAdmin(); closeModal(); } };
  }
  function editAdminItem(id){
    const i=id?data.items.find(x=>x.id===id):{id:uid('item'),name:'Neuer Artikel',groupId:data.groups[0]?.id,subgroupId:data.subgroups[0]?.id,price:0,description:'',contents:'',allergens:'',additives:'',active:true,color:'',order:0};
    modal(`<h2>Artikel</h2><label>Name<input id="iName" value="${esc(i.name)}"></label><label>Preis<input id="iPrice" type="number" step="0.1" value="${i.price||0}"></label><label>Hauptgruppe<select id="iGroup">${data.groups.map(g=>`<option value="${g.id}" ${g.id===i.groupId?'selected':''}>${esc(g.name)}</option>`)}</select></label><label>Untergruppe<select id="iSub">${data.subgroups.map(s=>`<option value="${s.id}" ${s.id===i.subgroupId?'selected':''}>${esc(s.name)}</option>`)}</select></label><label>Farbe optional<input id="iColor" type="color" value="${i.color||'#38bdf8'}"></label><label>Beschreibung<textarea id="iDesc">${esc(i.description||'')}</textarea></label><label>Inhalt / Beilagen<textarea id="iContents">${esc(i.contents||'')}</textarea></label><label>Allergene<textarea id="iAllergens">${esc(i.allergens||'')}</textarea></label><label>Zusatzstoffe<textarea id="iAdditives">${esc(i.additives||'')}</textarea></label><label><input id="iActive" type="checkbox" ${i.active!==false?'checked':''}> Aktiv</label><div class="modalActions"><button value="cancel">Abbrechen</button>${id?'<button id="deleteI" class="danger" value="default">Löschen</button>':''}<button id="saveI" class="accent" value="default">Speichern</button></div>`);
    $('#saveI').onclick=()=>{ i.name=$('#iName').value.trim(); i.price=Number($('#iPrice').value)||0; i.groupId=$('#iGroup').value; i.subgroupId=$('#iSub').value; i.color=$('#iColor').value; i.description=$('#iDesc').value; i.contents=$('#iContents').value; i.allergens=$('#iAllergens').value; i.additives=$('#iAdditives').value; i.active=$('#iActive').checked; if(!id)data.items.push(i); save(); renderAdmin(); renderMenu(); closeModal(); };
    if(id) $('#deleteI').onclick=()=>{ if(confirm('Artikel löschen?')){ data.items=data.items.filter(x=>x.id!==id); save(); renderAdmin(); renderMenu(); closeModal(); } };
  }

  function renderSystem(){
    $('#appInfo').innerHTML = `<strong>Meteora Order ${VERSION}</strong><br>Restaurant: ${esc(data.restaurant.name)}<br>Speicherung: lokal pro Gerät<br>Online: ${navigator.onLine?'ja':'nein'}`;
  }
  function exportBackup(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`meteora-order-3-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  function importBackup(file){ const r=new FileReader(); r.onload=()=>{ try{ data=normalize(JSON.parse(r.result)); save(); alert('Backup importiert.'); showView('tables'); renderAreas(); }catch(e){ alert('Backup konnte nicht gelesen werden.'); } }; r.readAsText(file); }

  document.addEventListener('click', (e)=>{
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.view) { showView(b.dataset.view); return; }
    if(b.dataset.area) { renderTables(b.dataset.area); return; }
    if(b.dataset.table) { openTable(b.dataset.table); return; }
    if(b.id==='backToAreas') renderAreas();
    if(b.id==='toTables') showView('tables');
    if(b.dataset.group) { groupFilter=b.dataset.group; subgroupFilter=''; renderMenu(); }
    if(b.dataset.subgroup) { subgroupFilter=b.dataset.subgroup; renderMenu(); }
    if(b.dataset.addItem) addItem(b.dataset.addItem);
    if(b.dataset.infoItem) infoModal(b.dataset.infoItem);
    if(b.dataset.noteItem) noteForItem(b.dataset.noteItem);
    if(b.dataset.qty) changeQty(b.dataset.line, Number(b.dataset.qty));
    if(b.dataset.removeLine) removeLine(b.dataset.removeLine);
    if(b.dataset.noteLine) noteForLine(b.dataset.noteLine);
    if(b.id==='miscBtn') miscModal();
    if(b.id==='undoBtn') undoLast();
    if(b.id==='restoreBtn') restoreLast();
    if(b.id==='clearTableBtn') { const o=getOrder(); if(confirm(`Tisch ${currentTable} leeren?`)){ o.lines=[]; o.guests=0; o.mergedWith=[]; save(); renderOrder(); renderTables(currentArea); } }
    if(b.id==='mergeBtn') { const t=prompt('Mit welchem Tisch zusammenlegen?'); if(t){ const o=getOrder(); if(!o.mergedWith.includes(t)) o.mergedWith.push(t); save(); renderOrder(); } }
    if(b.id==='splitBtn') { const o=getOrder(); o.mergedWith=[]; save(); alert('Zusammenlegung getrennt.'); }
    if(b.id==='resetFilterBtn') { $('#searchInput').value=''; subgroupFilter=''; renderMenu(); }
    if(b.id==='unlockAdmin') { if($('#pinInput').value===data.pin){ adminUnlocked=true; renderAdmin(); } else alert('Falsche PIN.'); }
    if(b.dataset.adminTab) { $$('.adminTabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$('.adminPane').forEach(x=>x.classList.remove('active')); $(`#admin${cap(b.dataset.adminTab)}`)?.classList.add('active'); }
    if(b.id==='addArea') editArea(null); if(b.dataset.editArea) editArea(b.dataset.editArea);
    if(b.id==='addGroup') editGroup(null); if(b.dataset.editGroup) editGroup(b.dataset.editGroup);
    if(b.id==='addSub') editSub(null); if(b.dataset.editSub) editSub(b.dataset.editSub);
    if(b.id==='addAdminItem') editAdminItem(null); if(b.dataset.editItemAdmin) editAdminItem(b.dataset.editItemAdmin);
    if(b.id==='saveDesign') { $$('[data-design-color]').forEach(inp=>data.design[inp.dataset.designColor]=inp.value); data.design.fontSize=Number($('#fontSizeInput').value); data.design.tableMin=Number($('#tableMinInput').value); save(); alert('Design gespeichert.'); }
    if(b.id==='saveRestaurant') { data.restaurant.name=$('#restName').value.trim(); data.restaurant.subtitle=$('#restSub').value.trim(); save(); alert('Gespeichert.'); }
    if(b.id==='savePin') { const p=$('#newPin').value.trim(); if(p.length<3) return alert('PIN zu kurz.'); data.pin=p; save(); alert('PIN gespeichert.'); }
    if(b.id==='exportBtn') exportBackup();
    if(b.id==='resetBtn') { if(prompt('Zum Löschen bitte LÖSCHEN eingeben')==='LÖSCHEN'){ localStorage.removeItem(KEY); location.reload(); } }
    if(b.id==='installBtn' && deferredInstall){ deferredInstall.prompt(); }
  });
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  $('#guestCount').addEventListener('input',()=>{ const o=getOrder(); o.guests=Number($('#guestCount').value)||0; save(); });
  $('#searchInput').addEventListener('input', renderMenu);
  $('#importInput').addEventListener('change', e=> e.target.files[0] && importBackup(e.target.files[0]));
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredInstall=e; $('#installBtn').classList.remove('hidden'); });
  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(console.warn)); }

  applyDesign(); showView('tables'); renderAreas();
})();
