const VERSION="3.0.0-v0.4";
const ADMIN_DEFAULT_PIN="1234";
const LS_KEY="meteora_order_3_state_v4";
const OLD_KEYS=["meteora_order_3_state_v3","meteora_order_3_state_v2","meteora_order_3_state_v1"];

const defaultState=()=>({
 settings:{restaurantName:"Restaurant Meteora",adminPin:ADMIN_DEFAULT_PIN,design:{restaurantName:"Restaurant Meteora",accent:"#f59e0b",fontSize:17,buttonSize:62,radius:18}},
 areas:[
  {id:"innen",name:"Innen",icon:"🍽️",color:"#2563eb",tables:range(1,10)},
  {id:"aussen",name:"Außen",icon:"☀️",color:"#16a34a",tables:[...range(20,40),223]},
  {id:"ausserhaus",name:"Außer Haus",icon:"🚗",color:"#0ea5e9",tables:[50]},
  {id:"saal",name:"Saal",icon:"🎉",color:"#9333ea",tables:range(100,140)}
 ],
 menu:seedMenu(),orders:{}
});
function range(a,b){return Array.from({length:b-a+1},(_,i)=>a+i)}
function uid(){return Math.random().toString(36).slice(2,10)}
function money(n){return Number(n||0).toFixed(2).replace(".",",")+" €"}
function tableKey(a,n){return a+"_"+n}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escapeAttr(s){return escapeHtml(s).replace(/"/g,"&quot;")}
function seedMenu(){
 return {
  groups:[{id:"speisen",name:"Speisen",icon:"🍽️",color:"#2563eb",sort:1,active:true},{id:"getraenke",name:"Getränke",icon:"🥤",color:"#16a34a",sort:2,active:true}],
  subgroups:[
   {id:"suppen",groupId:"speisen",name:"Suppen",icon:"🥣",color:"#38bdf8",sort:1,active:true},
   {id:"kalte_vorspeisen",groupId:"speisen",name:"Kalte Vorspeisen",icon:"❄️",color:"#38bdf8",sort:2,active:true},
   {id:"warme_vorspeisen",groupId:"speisen",name:"Warme Vorspeisen",icon:"🔥",color:"#f97316",sort:3,active:true},
   {id:"salate",groupId:"speisen",name:"Salate",icon:"🥬",color:"#84cc16",sort:4,active:true},
   {id:"grill",groupId:"speisen",name:"Grillgerichte",icon:"🥩",color:"#f97316",sort:5,active:true},
   {id:"dessert",groupId:"speisen",name:"Dessert",icon:"🍰",color:"#ec4899",sort:6,active:true},
   {id:"alkoholfrei",groupId:"getraenke",name:"Alkoholfrei",icon:"🥤",color:"#38bdf8",sort:1,active:true},
   {id:"bier",groupId:"getraenke",name:"Bier",icon:"🍺",color:"#facc15",sort:2,active:true},
   {id:"wein",groupId:"getraenke",name:"Wein",icon:"🍷",color:"#dc2626",sort:3,active:true},
   {id:"spirituosen",groupId:"getraenke",name:"Spirituosen",icon:"🥃",color:"#9333ea",sort:4,active:true},
   {id:"kaffee",groupId:"getraenke",name:"Kaffee",icon:"☕",color:"#92400e",sort:5,active:true}
  ],
  items:[
   item("1","Bohnensuppe",4.00,"speisen","suppen","Traditionelle Bohnensuppe","",""),
   item("2","Gulaschsuppe",4.00,"speisen","suppen","Pikante Gulaschsuppe","",""),
   item("3","Hühnersuppe",4.00,"speisen","suppen","Mit Hühnerfleisch und Gemüse","",""),
   item("4","Tomatensuppe",4.00,"speisen","suppen","Tomatensuppe mit Sahne","Milch",""),
   item("101","Gyros Spezial",18.90,"speisen","grill","Gyros, Pommes, Tzatziki, Krautsalat","Milch, Senf",""),
   item("102","Souvlaki",17.90,"speisen","grill","Schweinespieße, Pommes, Tzatziki, Salat","Milch",""),
   item("301","Bauernsalat",12.90,"speisen","salate","Tomate, Gurke, Feta, Oliven, Peperoni","Milch",""),
   item("501","Cola 0,4",4.20,"getraenke","alkoholfrei","0,4 l","","koffeinhaltig"),
   item("601","Pils 0,5",4.80,"getraenke","bier","0,5 l","Gluten","alkoholhaltig")
  ]
 }
}
function item(number,name,price,groupId,subgroupId,info,allergens,additives){return{id:uid(),number,name,price,groupId,subgroupId,info,allergens,additives,active:true,color:"",sort:Number(number)||0}}

let state=loadState();
let view={screen:"areas",areaId:null,tableNo:null,groupId:null,subgroupId:null,expandedGroupId:null,search:"",adminTab:"restaurant"};
let logoTapCount=0,logoTapTimer=null;

function loadState(){
 try{
  let raw=localStorage.getItem(LS_KEY);
  if(!raw){for(const k of OLD_KEYS){raw=localStorage.getItem(k); if(raw)break}}
  if(!raw)return defaultState();
  return migrate(JSON.parse(raw));
 }catch(e){console.warn(e);return defaultState()}
}
function migrate(s){
 const d=defaultState();
 const migrated={...d,...s,settings:{...d.settings,...(s.settings||{}),design:{...d.settings.design,...((s.settings||{}).design||{})}},areas:s.areas||d.areas,menu:{groups:(s.menu&&s.menu.groups)||d.menu.groups,subgroups:(s.menu&&s.menu.subgroups)||d.menu.subgroups,items:(s.menu&&s.menu.items)||d.menu.items},orders:s.orders||{}};
 migrated.menu.groups.forEach(g=>{if(g.active===undefined)g.active=true});
 migrated.menu.subgroups.forEach(sg=>{if(sg.active===undefined)sg.active=true});
 migrated.menu.items.forEach(i=>{if(i.active===undefined)i.active=true});
 return migrated;
}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(state));renderStatus()}
function applyDesign(){const d=state.settings.design||{};document.documentElement.style.setProperty("--accent",d.accent||"#f59e0b");document.documentElement.style.setProperty("--fontSize",(d.fontSize||17)+"px");document.documentElement.style.setProperty("--buttonSize",(d.buttonSize||62)+"px");document.documentElement.style.setProperty("--radius",(d.radius||18)+"px");document.getElementById("restaurantName").textContent=d.restaurantName||state.settings.restaurantName||"Meteora Order"}
function renderStatus(){document.getElementById("statusLine").textContent=(navigator.onLine?"Online":"Offline bereit")+" · "+VERSION}
function app(c){document.getElementById("app").innerHTML=c;applyDesign();renderStatus()}
function getArea(){return state.areas.find(a=>a.id===view.areaId)}
function getOrder(a,n){const k=tableKey(a,n);state.orders[k]||={areaId:a,tableNo:n,guests:0,lines:[],trash:[],updatedAt:Date.now()};return state.orders[k]}
function orderIsBusy(a,n){const o=state.orders[tableKey(a,n)];return!!(o&&o.lines&&o.lines.length)}
function hasVisibleGroupItems(gid){return state.menu.items.some(i=>i.active!==false&&i.groupId===gid)}

function renderAreas(){view.screen="areas";app(`<section class="row space"><h1>Bereich wählen</h1><span class="pill">Admin versteckt: Logo 5× tippen oder lange drücken</span></section><div class="grid area-grid">${state.areas.map(a=>`<button class="card area-card" style="border-left:9px solid ${a.color}" onclick="openArea('${a.id}')"><div>${a.icon} ${escapeHtml(a.name)}</div><small>${a.tables.length} Tische</small></button>`).join("")}</div>`)}
function openArea(id){view.areaId=id;view.screen="tables";renderTables()}
function renderTables(){const a=getArea();app(`<div class="row space"><div><h1>${a.icon} ${escapeHtml(a.name)}</h1><span class="pill">Tischübersicht</span></div><button class="btn secondary" onclick="renderAreas()">← Bereiche</button></div><div class="grid table-grid">${a.tables.map(no=>{const busy=orderIsBusy(a.id,no);const o=state.orders[tableKey(a.id,no)]||{};return`<button class="card table-card ${busy?'busy':'free'}" onclick="openTable('${a.id}',${JSON.stringify(no)})"><div>${busy?'🔴':'🟢'} Tisch ${escapeHtml(no)}</div><span class="pill">👥 ${o.guests||0}</span></button>`}).join("")}</div>`)}
function openTable(a,no){view.areaId=a;view.tableNo=no;view.screen="order";const groups=activeGroups();view.groupId=view.groupId||groups[0]?.id;view.expandedGroupId=view.groupId;view.subgroupId=null;getOrder(a,no);renderOrder()}
function activeGroups(){return state.menu.groups.filter(g=>g.active!==false&&hasVisibleGroupItems(g.id)).sort((a,b)=>(a.sort||0)-(b.sort||0))}
function activeSubs(gid){return state.menu.subgroups.filter(s=>s.active!==false&&s.groupId===gid).sort((a,b)=>(a.sort||0)-(b.sort||0))}
function renderOrder(){
 const a=getArea(),order=getOrder(view.areaId,view.tableNo),groups=activeGroups(),q=view.search.trim().toLowerCase();
 let items=state.menu.items.filter(i=>i.active!==false);
 if(view.groupId)items=items.filter(i=>i.groupId===view.groupId);
 if(view.subgroupId)items=items.filter(i=>i.subgroupId===view.subgroupId);
 if(q)items=state.menu.items.filter(i=>i.active!==false&&(i.number+" "+i.name+" "+(i.info||"")).toLowerCase().includes(q));
 items.sort((a,b)=>(a.sort||0)-(b.sort||0)||String(a.number).localeCompare(String(b.number)));
 app(`<div class="row space"><div><h2>${a.icon} ${escapeHtml(a.name)} › Tisch ${escapeHtml(view.tableNo)}</h2><span class="pill">${order.lines.length?"🔴 Besetzt":"🟢 Frei"}</span></div><div class="row"><button class="btn secondary" onclick="renderTables()">← Tische</button><button class="btn secondary" onclick="renderAreas()">Bereiche</button></div></div>
 <div class="order-layout">
  <aside class="panel sidebar">
   <label>Gäste <input type="number" min="0" value="${order.guests||0}" onchange="setGuests(this.value)"></label><hr><h3>Hauptgruppen</h3>
   ${groups.map(g=>renderGroupTree(g)).join("")}
  </aside>
  <section class="panel items">
   <input class="search" placeholder="Suche nach Name oder Artikelnummer..." value="${escapeAttr(view.search)}" oninput="view.search=this.value; renderOrder()">
   <div class="row space"><h3>Artikel</h3><button class="btn small secondary" onclick="addCustom()">➕ Sonstiges</button></div>
   ${items.length?items.map(i=>`<div class="item" style="${i.color?`border-left:6px solid ${i.color}`:''}"><div class="item-no">${escapeHtml(i.number||"")}</div><button class="item-add" onclick="addItem('${i.id}')">${escapeHtml(i.name)}</button><div class="price">${money(i.price)}</div><button class="info-btn" onclick="showInfo('${i.id}')">ℹ️</button></div>`).join(""):`<div class="empty">Keine Artikel gefunden.</div>`}
  </section>
  <aside class="panel orderbox">
   <div class="row space"><h3>Bestellung</h3><span class="pill">${order.lines.reduce((s,l)=>s+l.qty,0)} Pos.</span></div>
   ${order.lines.length?order.lines.map(l=>`<div class="order-line"><strong>${l.qty} × ${escapeHtml(l.name)}</strong>${l.note?`<div class="note">💬 ${escapeHtml(l.note)}</div>`:""}<div class="qty"><button class="btn small secondary" onclick="changeQty('${l.id}',1)">＋</button><button class="btn small secondary" onclick="changeQty('${l.id}',-1)">－</button><button class="btn small ghost" onclick="editNote('${l.id}')">💬</button><button class="btn small danger" onclick="removeLine('${l.id}')">🗑️</button></div></div>`).join(""):`<div class="empty">Noch keine Positionen.</div>`}
   <hr><div class="row"><button class="btn" onclick="saveOrderAndBack()">✅ Speichern</button><button class="btn secondary" onclick="undo()">↩️ Zurück</button><button class="btn secondary" onclick="restore()">♻️ Wiederherstellen</button><button class="btn danger" onclick="clearTable()">Tisch leeren</button></div>
  </aside>
 </div>`)
}
function renderGroupTree(g){const expanded=view.expandedGroupId===g.id;const subs=activeSubs(g.id);return`<button class="group-head ${view.groupId===g.id?'active':''}" style="border-left-color:${g.color}" onclick="toggleGroup('${g.id}')"><span>${g.icon||""} ${escapeHtml(g.name)}</span><span>${expanded?"⌃":"›"}</span></button>${expanded?`<div class="sub-list"><button class="sub-btn ${view.groupId===g.id&&!view.subgroupId?'active':''}" onclick="selectGroupAll('${g.id}')">Alle</button>${subs.map(s=>`<button class="sub-btn ${view.subgroupId===s.id?'active':''}" style="border-left:5px solid ${s.color}" onclick="selectSub('${g.id}','${s.id}')">${s.icon||""} ${escapeHtml(s.name)} ›</button>`).join("")}</div>`:""}`}
function toggleGroup(gid){view.expandedGroupId=view.expandedGroupId===gid?null:gid;view.groupId=gid;view.subgroupId=null;view.search="";renderOrder()}
function selectGroupAll(gid){view.groupId=gid;view.expandedGroupId=gid;view.subgroupId=null;view.search="";renderOrder()}
function selectSub(gid,sid){view.groupId=gid;view.expandedGroupId=gid;view.subgroupId=sid;view.search="";renderOrder()}
function setGuests(v){getOrder(view.areaId,view.tableNo).guests=Number(v)||0;save();renderOrder()}
function addItem(id){const i=state.menu.items.find(x=>x.id===id);if(!i)return;const o=getOrder(view.areaId,view.tableNo);let l=o.lines.find(x=>x.itemId===id&&!x.note);if(l)l.qty++;else o.lines.push({id:uid(),itemId:i.id,number:i.number,name:i.name,price:i.price,qty:1,note:""});save();renderOrder()}
function addCustom(){const name=prompt("Sonstiges eingeben:");if(!name)return;const qty=Number(prompt("Menge:","1")||1);getOrder(view.areaId,view.tableNo).lines.push({id:uid(),custom:true,name:"Sonstiges: "+name,price:0,qty:Math.max(1,qty),note:""});save();renderOrder()}
function changeQty(id,d){const o=getOrder(view.areaId,view.tableNo),l=o.lines.find(x=>x.id===id);if(!l)return;l.qty+=d;if(l.qty<=0)removeLine(id);else{save();renderOrder()}}
function removeLine(id){const o=getOrder(view.areaId,view.tableNo),idx=o.lines.findIndex(x=>x.id===id);if(idx<0)return;o.trash||=[];o.trash.push(o.lines[idx]);o.lines.splice(idx,1);save();renderOrder()}
function undo(){const o=getOrder(view.areaId,view.tableNo);if(!o.lines.length)return;o.trash||=[];o.trash.push(o.lines.pop());save();renderOrder()}
function restore(){const o=getOrder(view.areaId,view.tableNo);if(!o.trash||!o.trash.length)return;o.lines.push(o.trash.pop());save();renderOrder()}
function editNote(id){const o=getOrder(view.areaId,view.tableNo),l=o.lines.find(x=>x.id===id);if(!l)return;const note=prompt("Bemerkung:",l.note||"");if(note!==null){l.note=note;save();renderOrder()}}
function clearTable(){if(!confirm("Tisch wirklich leeren?"))return;const o=getOrder(view.areaId,view.tableNo);o.lines=[];o.trash=[];o.guests=0;save();renderTables()}
function saveOrderAndBack(){save();renderTables()}
function showInfo(id){const i=state.menu.items.find(x=>x.id===id);if(!i)return;showModal(`<h2>${escapeHtml(i.number)} ${escapeHtml(i.name)}</h2><p><strong>Enthält / Beilagen</strong><br>${escapeHtml(i.info||"Keine Angaben").replace(/\\n/g,"<br>")}</p><p><strong>Allergene</strong><br>${escapeHtml(i.allergens||"Keine Angaben")}</p><p><strong>Zusatzstoffe</strong><br>${escapeHtml(i.additives||"Keine Angaben")}</p>`)}
function showModal(c){document.getElementById("modalContent").innerHTML=c;document.getElementById("modal").showModal()}

document.getElementById("logoBtn").addEventListener("click",()=>{logoTapCount++;clearTimeout(logoTapTimer);logoTapTimer=setTimeout(()=>logoTapCount=0,1200);if(logoTapCount>=5){logoTapCount=0;unlockAdmin()}})
let pressTimer;document.getElementById("logoBtn").addEventListener("pointerdown",()=>pressTimer=setTimeout(unlockAdmin,900));document.getElementById("logoBtn").addEventListener("pointerup",()=>clearTimeout(pressTimer));
function unlockAdmin(){const pin=prompt("Admin-PIN:");if(pin===state.settings.adminPin)renderAdmin();else if(pin!==null)alert("PIN falsch.")}
function renderAdmin(){app(`<div class="row space"><h1>Admin</h1><button class="btn secondary" onclick="renderAreas()">Schließen</button></div><div class="admin-grid"><aside class="panel sidebar">${["restaurant","tische","speisekarte","hauptgruppen","untergruppen","design","system"].map(t=>`<button class="group-btn ${view.adminTab===t?'active':''}" onclick="view.adminTab='${t}';renderAdmin()">${tabName(t)}</button>`).join("")}</aside><section class="panel items">${adminContent()}</section></div>`)}
function tabName(t){return{restaurant:"🏢 Restaurant",tische:"🪑 Tische",speisekarte:"🍽️ Speisekarte",hauptgruppen:"🟢 Hauptgruppen",untergruppen:"🟣 Untergruppen",design:"🎨 Design",system:"⚙️ System"}[t]}
function adminContent(){if(view.adminTab==="restaurant")return`<h2>Restaurant</h2><p class="admin-note">Admin ist im Service nicht sichtbar. Öffnen über Logo 5× tippen oder lange drücken.</p><div class="form"><label>Name <input value="${escapeAttr(state.settings.design.restaurantName)}" onchange="state.settings.design.restaurantName=this.value;save();applyDesign()"></label><label>Admin-PIN ändern <input type="password" placeholder="Neue PIN" onchange="if(this.value){state.settings.adminPin=this.value;save();alert('PIN geändert.')}"></label></div>`;if(view.adminTab==="tische")return adminTables();if(view.adminTab==="hauptgruppen")return adminGroups();if(view.adminTab==="untergruppen")return adminSubgroups();if(view.adminTab==="speisekarte")return adminMenu();if(view.adminTab==="design")return`<h2>Design</h2><div class="form"><label>Akzentfarbe <input type="color" value="${state.settings.design.accent}" onchange="state.settings.design.accent=this.value;save();applyDesign()"></label><label>Schriftgröße <input type="number" min="14" max="26" value="${state.settings.design.fontSize}" onchange="state.settings.design.fontSize=Number(this.value)||17;save();applyDesign()"></label><label>Button-/Tischgröße <input type="number" min="46" max="110" value="${state.settings.design.buttonSize}" onchange="state.settings.design.buttonSize=Number(this.value)||62;save();applyDesign()"></label></div>`;return`<h2>System</h2><div class="row"><button class="btn" onclick="exportBackup()">Backup exportieren</button><button class="btn secondary" onclick="document.getElementById('importFile').click()">Backup importieren</button><button class="btn danger" onclick="resetData()">Daten zurücksetzen</button></div><p class="pill">Version ${VERSION}</p>`}
function adminTables(){return`<h2>Bereiche & Tische</h2><div class="list">${state.areas.map(a=>`<div class="card" style="padding:12px;border-left:8px solid ${a.color}"><div class="row space"><strong>${a.icon} ${escapeHtml(a.name)}</strong><button class="btn small secondary" onclick="addTable('${a.id}')">+ Tisch</button></div><div class="row" style="margin-top:8px">${a.tables.map(t=>`<span class="pill">Tisch ${escapeHtml(t)} <button class="btn small danger" onclick="deleteTable('${a.id}',${JSON.stringify(t)})">×</button></span>`).join("")}</div></div>`).join("")}</div>`}
function adminGroups(){return`<h2>Hauptgruppen</h2><button class="btn" onclick="newGroup()">+ Hauptgruppe</button><hr><div class="list">${state.menu.groups.map(g=>`<div class="list-row"><div><strong>${g.icon||""} ${escapeHtml(g.name)}</strong><br><span class="pill">${g.id} · ${g.active!==false?"🟢 aktiv":"⚪ inaktiv"}</span></div><div class="row"><button class="btn small secondary" onclick="toggleGroupActive('${g.id}')">Aktiv</button><button class="btn small secondary" onclick="editGroup('${g.id}')">Bearbeiten</button></div></div>`).join("")}</div>`}
function adminSubgroups(){return`<h2>Untergruppen</h2><button class="btn" onclick="newSubgroup()">+ Untergruppe</button><hr><div class="list">${state.menu.subgroups.map(s=>{const g=state.menu.groups.find(g=>g.id===s.groupId);return`<div class="list-row"><div><strong>${s.icon||""} ${escapeHtml(s.name)}</strong><br><span class="pill">${g?escapeHtml(g.name):s.groupId} · ${s.active!==false?"🟢 aktiv":"⚪ inaktiv"}</span></div><div class="row"><button class="btn small secondary" onclick="toggleSubActive('${s.id}')">Aktiv</button><button class="btn small secondary" onclick="editSubgroup('${s.id}')">Bearbeiten</button></div></div>`}).join("")}</div>`}
function adminMenu(){return`<h2>Speisekarte / Artikel</h2><div class="row"><button class="btn" onclick="editItem(null)">+ Artikel</button></div><hr><div class="list">${state.menu.items.slice().sort((a,b)=>(a.sort||0)-(b.sort||0)).map(i=>`<div class="list-row"><div><strong>${escapeHtml(i.number)} ${escapeHtml(i.name)}</strong><br><span class="pill">${money(i.price)} · ${i.active!==false?"🟢 aktiv":"⚪ inaktiv"}</span></div><div class="row"><button class="btn small secondary" onclick="toggleItemActive('${i.id}')">Aktiv</button><button class="btn small secondary" onclick="editItem('${i.id}')">Bearbeiten</button><button class="btn small danger" onclick="deleteItem('${i.id}')">Löschen</button></div></div>`).join("")}</div>`}
function addTable(aid){const no=prompt("Tischnummer:");if(!no)return;const a=state.areas.find(x=>x.id===aid),n=isNaN(Number(no))?no:Number(no);if(!a.tables.some(t=>String(t)===String(n)))a.tables.push(n);a.tables.sort((x,y)=>Number(x)-Number(y));save();renderAdmin()}
function deleteTable(aid,no){if(!confirm("Tisch löschen?"))return;const a=state.areas.find(x=>x.id===aid);a.tables=a.tables.filter(t=>String(t)!==String(no));delete state.orders[tableKey(aid,no)];save();renderAdmin()}
function newGroup(){const name=prompt("Name der Hauptgruppe:");if(!name)return;const gid=slug(name);state.menu.groups.push({id:gid,name,icon:"",color:"#64748b",sort:state.menu.groups.length+1,active:true});save();renderAdmin()}
function editGroup(id){const g=state.menu.groups.find(x=>x.id===id);if(!g)return;g.name=prompt("Name:",g.name)||g.name;g.icon=prompt("Symbol:",g.icon||"")||g.icon;g.color=prompt("Farbe:",g.color)||g.color;save();renderAdmin()}
function toggleGroupActive(id){const g=state.menu.groups.find(x=>x.id===id);g.active=!g.active;save();renderAdmin()}
function newSubgroup(){const name=prompt("Name der Untergruppe:");if(!name)return;const groupId=prompt("Hauptgruppe-ID: "+state.menu.groups.map(g=>g.id).join(", "),state.menu.groups[0]?.id||"");if(!groupId)return;state.menu.subgroups.push({id:slug(name),groupId,name,icon:"",color:"#64748b",sort:state.menu.subgroups.length+1,active:true});save();renderAdmin()}
function editSubgroup(id){const s=state.menu.subgroups.find(x=>x.id===id);if(!s)return;s.name=prompt("Name:",s.name)||s.name;s.groupId=prompt("Hauptgruppe-ID:",s.groupId)||s.groupId;s.icon=prompt("Symbol:",s.icon||"")||s.icon;s.color=prompt("Farbe:",s.color)||s.color;save();renderAdmin()}
function toggleSubActive(id){const s=state.menu.subgroups.find(x=>x.id===id);s.active=!s.active;save();renderAdmin()}
function editItem(itemId){const i=itemId?state.menu.items.find(x=>x.id===itemId):{id:uid(),number:"",name:"",price:0,groupId:state.menu.groups[0]?.id||"",subgroupId:"",info:"",allergens:"",additives:"",active:true,color:"",sort:999};const number=prompt("Artikelnummer:",i.number||"");if(number===null)return;const name=prompt("Name:",i.name||"");if(!name)return;const price=Number((prompt("Preis:",i.price||0)||"0").replace(",","."));const groupId=prompt("Hauptgruppe-ID:",i.groupId)||i.groupId;const subgroupId=prompt("Untergruppe-ID:",i.subgroupId)||i.subgroupId;Object.assign(i,{number,name,price,groupId,subgroupId,info:prompt("Info / Beilagen:",i.info||"")||"",allergens:prompt("Allergene:",i.allergens||"")||"",additives:prompt("Zusatzstoffe:",i.additives||"")||"",sort:Number(number)||999});if(!itemId)state.menu.items.push(i);save();renderAdmin()}
function toggleItemActive(id){const i=state.menu.items.find(x=>x.id===id);i.active=!i.active;save();renderAdmin()}
function deleteItem(id){if(confirm("Artikel löschen?")){state.menu.items=state.menu.items.filter(i=>i.id!==id);save();renderAdmin()}}
function slug(s){return s.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_äöüß]/gi,"")}
function exportBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="meteora-order-3-backup.json";a.click();URL.revokeObjectURL(a.href)}
document.getElementById("importFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{state=migrate(JSON.parse(await f.text()));save();alert("Import erfolgreich.");renderAreas()}catch(err){alert("Import fehlgeschlagen.")}})
function resetData(){if(prompt('Zum Zurücksetzen "LÖSCHEN" eingeben:')==="LÖSCHEN"){localStorage.removeItem(LS_KEY);state=defaultState();save();renderAreas()}}
window.addEventListener("online",renderStatus);window.addEventListener("offline",renderStatus);if("serviceWorker"in navigator){navigator.serviceWorker.register("./service-worker.js").catch(()=>{})}applyDesign();renderAreas();
