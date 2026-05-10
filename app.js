<!DOCTYPE html>

<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>OW Field Sales</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:monospace;background:#111827;color:#f9fafb;min-height:100vh;display:flex;flex-direction:column}
button{font-family:monospace;cursor:pointer}
input,select,textarea{font-family:monospace}
.hdr{background:#1f2937;border-bottom:2px solid #374151;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.logo{display:flex;align-items:center;gap:8px}
.logo-box{width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:white}
.logo-text{font-size:13px;font-weight:700;color:white}
.logo-sub{font-size:9px;color:#9ca3af;letter-spacing:.1em}
.nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.nav button{padding:6px 10px;border-radius:6px;border:none;font-size:11px;font-weight:700}
.statbar{background:#1a2332;border-bottom:1px solid #374151;padding:8px 16px;display:flex;gap:16px;align-items:center;overflow-x:auto}
.stat{display:flex;align-items:baseline;gap:4px;white-space:nowrap}
.stat-label{font-size:9px;color:#6b7280;text-transform:uppercase}
.stat-val{font-size:18px;font-weight:900}
.main{flex:1;overflow-y:auto;padding:14px}
.card{background:#1f2937;border-radius:10px;margin-bottom:8px;padding:12px;border:1px solid #374151}
.card.sale{border-color:#16a34a}
.card.nearest{border-color:#f59e0b}
.card-top{display:flex;justify-content:space-between;align-items:flex-start}
.card-name{font-weight:700;font-size:14px;color:white;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card-addr{font-size:10px;color:#9ca3af;margin-top:2px}
.card-dist{font-size:10px;color:#f59e0b;margin-top:2px}
.badge{border-radius:20px;padding:3px 8px;display:flex;align-items:center;gap:4px;flex-shrink:0;margin-left:8px}
.badge-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.badge-text{font-size:9px;font-weight:700;white-space:nowrap}
.btn-checkin{padding:6px 10px;background:#2563eb;border:none;border-radius:6px;color:white;font-size:10px;font-weight:700;margin-top:6px}
.btn-checkout{padding:6px 10px;background:#d97706;border:none;border-radius:6px;color:black;font-size:10px;font-weight:700;margin-top:6px}
.filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.filters button{padding:4px 10px;border-radius:20px;border:none;font-size:10px;font-weight:700}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:flex-end;z-index:100}
.sheet{background:#1f2937;border-top:2px solid #2563eb;border-radius:16px 16px 0 0;padding:20px 16px 32px;width:100%;max-height:80vh;overflow-y:auto}
.sheet-title{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em}
.sheet-name{font-size:18px;font-weight:700;color:white;margin-top:4px}
.sheet-addr{font-size:10px;color:#6b7280;margin-top:2px}
.outcome-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.outcome-btn{padding:12px 8px;border-radius:8px;font-size:11px;font-weight:700;border:2px solid #374151;background:#111827;color:#6b7280}
.outcome-btn.selected{border-color:#2563eb}
.notes-label{font-size:9px;color:#9ca3af;text-transform:uppercase;margin:12px 0 6px}
.notes-input{width:100%;background:#111827;border:1px solid #374151;border-radius:8px;color:#f9fafb;font-size:13px;padding:10px;resize:none;height:70px;outline:none}
.field-input{width:100%;background:#111827;border:1px solid #374151;border-radius:8px;color:#f9fafb;font-size:13px;padding:10px;outline:none;margin-top:4px}
.field-label{font-size:9px;color:#9ca3af;text-transform:uppercase;margin-top:12px;margin-bottom:2px}
.sheet-btns{display:flex;gap:8px;margin-top:16px}
.btn-confirm{flex:1;padding:14px;border:none;border-radius:10px;color:white;font-weight:900;font-size:13px}
.btn-cancel{padding:14px 16px;background:#374151;border:none;border-radius:10px;color:#9ca3af;font-size:16px}
.nearest-banner{background:#1c1a00;border-bottom:2px solid #f59e0b;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
.nb-label{font-size:9px;color:#f59e0b;text-transform:uppercase;letter-spacing:.1em}
.nb-name{font-size:15px;font-weight:700;color:#fef9c3}
.nb-addr{font-size:10px;color:#92400e}
.nb-dist{font-size:24px;font-weight:900;color:#f59e0b;text-align:right}
.nb-tap{font-size:9px;color:#78350f}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.stats-card{background:#1f2937;border-radius:10px;padding:14px;border:1px solid #374151}
.stats-big{font-size:30px;font-weight:900}
.stats-lbl{font-size:9px;color:#9ca3af;margin-top:2px}
.progress{height:3px;background:#374151;border-radius:2px;margin-top:8px}
.progress-bar{height:100%;border-radius:2px}
.sales-hero{background:linear-gradient(135deg,#052e16,#166534);border:1px solid #16a34a;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center}
.sales-num{font-size:64px;font-weight:900;color:#4ade80;line-height:1}
.sales-lbl{font-size:12px;color:#86efac;margin-top:4px}
.sales-conv{font-size:10px;color:#4ade80;margin-top:6px;opacity:.8}
@keyframes up{from{transform:translateY(100%)}to{transform:translateY(0)}}
.sheet{animation:up .2s ease}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
.nearest-banner{animation:pulse 2s infinite}
</style>
</head>
<body>

<div id="root"></div>

<script>
var SCFG = {
  pending: {label:'Not Visited', color:'#6b7280', bg:'#374151', dot:'#9ca3af'},
  checked_in: {label:'Checked In', color:'#60a5fa', bg:'#1e3a5f', dot:'#3b82f6'},
  not_interested: {label:'Not Interested', color:'#f87171', bg:'#450a0a', dot:'#ef4444'},
  sale: {label:'SALE!', color:'#4ade80', bg:'#052e16', dot:'#16a34a'},
  callback: {label:'Call Back', color:'#fbbf24', bg:'#451a03', dot:'#f59e0b'},
  no_answer: {label:'No Answer', color:'#c084fc', bg:'#2e1065', dot:'#a855f7'}
};

var BTYPES = ['Restaurant','Medical','Laundry','Spa/Wellness','Auto','Bakery','Retail','Office','Gym','Hotel','Other'];

var SAMPLE = [
  {id:1,name:'Tim Hortons',address:'1240 King St W',type:'Restaurant',lat:43.642,lng:-79.434},
  {id:2,name:'Metro Dental',address:'882 College St',type:'Medical',lat:43.655,lng:-79.421},
  {id:3,name:'Sunrise Laundromat',address:'334 Roncesvalles Ave',type:'Laundry',lat:43.648,lng:-79.449},
  {id:4,name:'Bella Cucina',address:'567 Bloor St W',type:'Restaurant',lat:43.661,lng:-79.441},
  {id:5,name:'GreenLeaf Spa',address:'221 Ossington Ave',type:'Spa/Wellness',lat:43.652,lng:-79.431},
  {id:6,name:'Parkdale Auto',address:'1100 Queen St W',type:'Auto',lat:43.638,lng:-79.436},
  {id:7,name:'Corner Bakery',address:'489 Dufferin St',type:'Bakery',lat:43.644,lng:-79.445},
  {id:8,name:'Dr. Patel Chiro',address:'75 Runnymede Rd',type:'Medical',lat:43.651,lng:-79.461}
];

function hav(a,b,c,d){
  var R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180;
  var p=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)*Math.sin(y/2);
  return R*2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p));
}
function fdist(k){return k<1?Math.round(k*1000)+'m':k.toFixed(1)+'km';}
function mkLead(l){return {id:l.id,name:l.name,address:l.address,type:l.type,lat:l.lat,lng:l.lng,status:'pending',checkInTime:null,checkOutTime:null,notes:'',checkedInAt:null};}

var state = {
  leads: null,
  view: 'list',
  gps: null,
  gpsOn: false,
  watchId: null,
  filter: 'all',
  modal: null,
  modalNotes: '',
  coStatus: 'not_interested',
  addOpen: false,
  newName: '',
  newAddr: '',
  newType: 'Restaurant',
  newLat: null,
  newLng: null
};

function load(){
  try{var s=localStorage.getItem('ow6');if(s)state.leads=JSON.parse(s);}catch(e){}
  if(!state.leads)state.leads=SAMPLE.map(mkLead);
}
function save(){try{localStorage.setItem('ow6',JSON.stringify(state.leads));}catch(e){}}

function nearest(){
  if(!state.gps)return null;
  var p=state.leads.filter(function(l){return l.status=='pending';});
  if(!p.length)return null;
  var mapped=p.map(function(l){return {l:l,d:hav(state.gps.lat,state.gps.lng,l.lat,l.lng)};});
  mapped.sort(function(a,b){return a.d-b.d;});
  return {lead:mapped[0].l,dist:mapped[0].d};
}

function calcStats(){
  var v=state.leads.filter(function(l){return l.status!='pending';}).length;
  var s=state.leads.filter(function(l){return l.status=='sale';}).length;
  return {
    total:state.leads.length,
    visited:v,
    sales:s,
    ni:state.leads.filter(function(l){return l.status=='not_interested';}).length,
    cb:state.leads.filter(function(l){return l.status=='callback';}).length,
    na:state.leads.filter(function(l){return l.status=='no_answer';}).length,
    conv:v>0?Math.round(s/v*100):0
  };
}

function startGps(){
  if(!navigator.geolocation){alert('GPS not available');return;}
  state.gpsOn=true;
  state.watchId=navigator.geolocation.watchPosition(
    function(p){state.gps={lat:p.coords.latitude,lng:p.coords.longitude};draw();},
    function(e){state.gpsOn=false;alert(e.code==1?'Location denied. Allow in Settings.':'GPS error.');draw();},
    {enableHighAccuracy:true,maximumAge:10000,timeout:15000}
  );
  draw();
}
function stopGps(){
  if(state.watchId!=null)navigator.geolocation.clearWatch(state.watchId);
  state.gps=null;state.gpsOn=false;draw();
}

function draw(){
  var st=calcStats();
  var nr=nearest();
  var html='';

  // HEADER
  html+='<div class="hdr">';
  html+='<div class="logo"><div class="logo-box">OW</div><div><div class="logo-text">OPTIMUM WATER</div><div class="logo-sub">FIELD SALES</div></div></div>';
  html+='<div class="nav">';
  var gpsBg=state.gpsOn?'#2563eb':'#374151';
  var gpsCol=state.gpsOn?'white':'#9ca3af';
  var gpsLbl=state.gpsOn?'GPS ON':'GPS';
  html+='<button onclick="toggleGps()" style="background:'+gpsBg+';color:'+gpsCol+';">'+gpsLbl+'</button>';
  ['list','stats'].forEach(function(v){
    html+='<button onclick="setView(\''+v+'\')" style="background:'+(state.view==v?'#2563eb':'#374151')+';color:'+(state.view==v?'white':'#9ca3af')+';">'+v+'</button>';
  });
  html+='</div></div>';

  // STATS BAR
  html+='<div class="statbar">';
  html+='<div class="stat"><span class="stat-label">Total</span><span class="stat-val" style="color:#9ca3af;">'+st.total+'</span></div>';
  html+='<div class="stat"><span class="stat-label">Visited</span><span class="stat-val" style="color:#60a5fa;">'+st.visited+'</span></div>';
  html+='<div class="stat"><span class="stat-label">Sales</span><span class="stat-val" style="color:#4ade80;">'+st.sales+'</span></div>';
  html+='<div class="stat"><span class="stat-label">Conv</span><span class="stat-val" style="color:'+(st.conv>=20?'#4ade80':'#fbbf24')+';">'+st.conv+'%</span></div>';
  html+='<div style="margin-left:auto;display:flex;gap:6px;flex-shrink:0;">';
  html+='<button onclick="openAdd()" style="padding:6px 12px;background:#2563eb;border:none;border-radius:6px;color:white;font-size:11px;font-weight:700;">+ Add</button>';
  html+='<button onclick="doReset()" style="padding:6px 10px;background:transparent;border:1px solid #374151;border-radius:6px;color:#6b7280;font-size:11px;">Reset</button>';
  html+='</div></div>';

  // NEAREST BANNER
  if(nr&&state.view=='list'){
    html+='<div class="nearest-banner" onclick="setFilter(\'nearest\')">';
    html+='<div><div class="nb-label">NEAREST UNVISITED</div><div class="nb-name">'+nr.lead.name+'</div><div class="nb-addr">'+nr.lead.address+'</div></div>';
    html+='<div><div class="nb-dist">'+fdist(nr.dist)+'</div><div class="nb-tap">away</div></div>';
    html+='</div>';
  }

  // MAIN CONTENT
  html+='<div class="main">';

  if(state.view=='list'){
    // FILTERS
    html+='<div class="filters">';
    var flist=[['all','All'],['pending','Not Visited'],['checked_in','Checked In'],['sale','Sale'],['not_interested','Not Interested'],['callback','Callback'],['no_answer','No Answer']];
    if(nr)flist.splice(1,0,['nearest','Nearest']);
    flist.forEach(function(f){
      var on=state.filter==f[0];
      html+='<button onclick="setFilter(\''+f[0]+'\')" style="background:'+(on?'#2563eb':'#374151')+';color:'+(on?'white':'#9ca3af')+';">'+f[1]+'</button>';
    });
    html+='</div>';

    // LEADS
    var shown=state.leads.slice();
    if(state.filter=='nearest'&&nr){shown=[nr.lead];}
    else if(state.filter!='all'){shown=shown.filter(function(l){return l.status==state.filter;});}
    if(state.gps){
      shown=shown.map(function(l){return {l:l,d:hav(state.gps.lat,state.gps.lng,l.lat,l.lng)};});
      shown.sort(function(a,b){return a.d-b.d;});
      shown=shown.map(function(x){return x.l;});
    }

    shown.forEach(function(lead){
      var cfg=SCFG[lead.status];
      var isNr=nr&&nr.lead.id==lead.id;
      var dist=state.gps?hav(state.gps.lat,state.gps.lng,lead.lat,lead.lng):null;
      html+='<div class="card'+(lead.status=='sale'?' sale':'')+(isNr?' nearest':'')+'\">';
      html+='<div class="card-top">';
      html+='<div style="flex:1;min-width:0;"><div class="card-name">'+lead.name+'</div>';
      html+='<div class="card-addr">'+lead.address+' &middot; '+lead.type+'</div>';
      if(dist!=null)html+='<div class="card-dist">'+fdist(dist)+' away</div>';
      if(lead.notes)html+='<div style="font-size:9px;color:#6b7280;margin-top:3px;font-style:italic;">'+lead.notes+'</div>';
      html+='</div>';
      html+='<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">';
      html+='<div class="badge" style="background:'+cfg.bg+'"><span class="badge-dot" style="background:'+cfg.dot+'"></span><span class="badge-text" style="color:'+cfg.color+';">'+cfg.label+'</span></div>';
      if(lead.status=='pending')html+='<button class="btn-checkin" onclick="openIn('+lead.id+')">Check In</button>';
      if(lead.status=='checked_in')html+='<button class="btn-checkout" onclick="openOut('+lead.id+')">Check Out</button>';
      html+='</div></div></div>';
    });

    if(!shown.length)html+='<div style="text-align:center;padding:40px;color:#374151;font-size:12px;">No leads here</div>';
  }

  if(state.view=='stats'){
    html+='<div class="sales-hero"><div class="sales-num">'+st.sales+'</div><div class="sales-lbl">SALES TODAY</div><div class="sales-conv">'+st.conv+'% conversion rate</div></div>';
    html+='<div class="stats-grid">';
    [{l:'Visited',v:st.visited,t:st.total,c:'#60a5fa'},{l:'Not Interested',v:st.ni,t:st.visited||1,c:'#f87171'},{l:'Callbacks',v:st.cb,t:st.visited||1,c:'#fbbf24'},{l:'No Answer',v:st.na,t:st.visited||1,c:'#c084fc'}].forEach(function(s){
      html+='<div class="stats-card"><div class="stats-big" style="color:'+s.c+';">'+s.v+'</div><div class="stats-lbl">'+s.l+'</div><div class="progress"><div class="progress-bar" style="width:'+Math.min(100,Math.round(s.v/(s.t||1)*100))+'%;background:'+s.c+';"></div></div></div>';
    });
    html+='</div>';
    var sales=state.leads.filter(function(l){return l.status=='sale';});
    if(sales.length){
      html+='<div style="background:#1f2937;border-radius:10px;padding:14px;border:1px solid #16a34a;margin-bottom:10px;"><div style="font-size:9px;color:#4ade80;text-transform:uppercase;margin-bottom:8px;">SALES</div>';
      sales.forEach(function(l){html+='<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><div><div style="font-size:13px;font-weight:700;">'+l.name+'</div><div style="font-size:9px;color:#6b7280;">'+l.address+'</div></div>'+(l.checkOutTime?'<div style="font-size:9px;color:#4ade80;">'+l.checkOutTime+'</div>':'')+'</div>';});
      html+='</div>';
    }
    var cbs=state.leads.filter(function(l){return l.status=='callback';});
    if(cbs.length){
      html+='<div style="background:#1f2937;border-radius:10px;padding:14px;border:1px solid #d97706;"><div style="font-size:9px;color:#fbbf24;text-transform:uppercase;margin-bottom:8px;">CALLBACKS</div>';
      cbs.forEach(function(l){html+='<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><div><div style="font-size:13px;font-weight:700;">'+l.name+'</div><div style="font-size:9px;color:#6b7280;">'+l.address+'</div>'+(l.notes?'<div style="font-size:9px;color:#92400e;font-style:italic;">'+l.notes+'</div>':'')+'</div><div style="font-size:9px;color:#fbbf24;">callback</div></div>';});
      html+='</div>';
    }
  }

  html+='</div>'; // end main

  // CHECK IN MODAL
  if(state.modal&&state.modal.mode=='in'){
    var lead=state.modal.lead;
    html+='<div class="overlay"><div class="sheet">';
    html+='<div class="sheet-title">CHECKING IN AT</div>';
    html+='<div class="sheet-name">'+lead.name+'</div>';
    html+='<div class="sheet-addr">'+lead.address+'</div>';
    html+='<div class="notes-label">NOTES</div>';
    html+='<textarea class="notes-input" id="mnotes" placeholder="Owner present, showed interest...">'+state.modalNotes+'</textarea>';

```
html+='<div class="sheet-btns">';
html+='<button class="btn-confirm" style="background:#2563eb;" onclick="confirmIn()">CONFIRM CHECK IN</button>';
html+='<button class="btn-cancel" onclick="closeModal()">X</button>';
html+='</div></div></div>';
```

}

// CHECK OUT MODAL
if(state.modal&&state.modal.mode==‘out’){
var lead2=state.modal.lead;
html+=’<div class="overlay"><div class="sheet">’;
html+=’<div class="sheet-title">CHECKING OUT OF</div>’;
html+=’<div class="sheet-name">’+lead2.name+’</div>’;
html+=’<div class="sheet-addr">’+lead2.address+’</div>’;
html+=’<div class="notes-label">OUTCOME</div>’;
html+=’<div class="outcome-grid">’;
[‘sale’,‘not_interested’,‘callback’,‘no_answer’].forEach(function(s){
var cfg2=SCFG[s];
var sel=state.coStatus==s;
html+=’<button class="outcome-btn'+(sel?' selected':'')+'" style="'+(sel?'background:'+cfg2.bg+';color:'+cfg2.color+';border-color:'+cfg2.dot+';':'')+'" onclick="setCO(\''+s+'\')">’+cfg2.label+’</button>’;
});
html+=’</div>’;
html+=’<div class="notes-label">NOTES</div>’;
html+=’<textarea class="notes-input" id="mnotes" placeholder="Left brochure, follow up next week...">’+state.modalNotes+’</textarea>’;
html+=’<div class="sheet-btns">’;
var cbg=state.coStatus==‘sale’?’#16a34a’:state.coStatus==‘callback’?’#d97706’:’#dc2626’;
html+=’<button class="btn-confirm" style="background:'+cbg+';" onclick="confirmOut()">CONFIRM CHECK OUT</button>’;
html+=’<button class="btn-cancel" onclick="closeModal()">X</button>’;
html+=’</div></div></div>’;
}

// ADD MODAL
if(state.addOpen){
html+=’<div class="overlay"><div class="sheet">’;
html+=’<div class="sheet-title">ADD NEW BUSINESS</div>’;
html+=’<div class="sheet-name" style="font-size:15px;">Walk-in Lead</div>’;
html+=’<div class="field-label">BUSINESS NAME</div>’;
html+=’<input class="field-input" id="newname" value="'+state.newName+'" placeholder="e.g. Fresh Cut Barbershop" oninput="state.newName=this.value"/>’;
html+=’<div class="field-label">ADDRESS</div>’;
html+=’<input class="field-input" id="newaddr" value="'+state.newAddr+'" placeholder="e.g. 450 Queen St W" oninput="state.newAddr=this.value"/>’;
html+=’<div class="field-label">TYPE</div>’;
html+=’<select class="field-input" onchange="state.newType=this.value">’;
BTYPES.forEach(function(t){html+=’<option’+(state.newType==t?’ selected’:’’)+’>’+t+’</option>’;});
html+=’</select>’;
if(state.gps){
html+=’<div class="field-label">GPS</div>’;
html+=’<button onclick="tagGps()" style="width:100%;padding:10px;background:'+(state.newLat?'#052e16':'#1f2937')+';border:2px solid '+(state.newLat?'#16a34a':'#374151')+';border-radius:8px;color:'+(state.newLat?'#4ade80':'#60a5fa')+';font-size:11px;">’+(state.newLat?‘GPS Tagged: ‘+state.newLat.toFixed(4)+’, ‘+state.newLng.toFixed(4):‘Tag My Location’)+’</button>’;
}
html+=’<div class="sheet-btns">’;
var canAdd=state.newName.trim()&&state.newAddr.trim();
html+=’<button class="btn-confirm" style="background:'+(canAdd?'#16a34a':'#374151')+';color:'+(canAdd?'white':'#6b7280')+';" onclick="addBiz()">ADD TO ROUTE</button>’;
html+=’<button class="btn-cancel" onclick="closeAdd()">X</button>’;
html+=’</div></div></div>’;
}

document.getElementById(‘root’).innerHTML=html;
}

window.toggleGps=function(){state.gpsOn?stopGps():startGps();};
window.setView=function(v){state.view=v;draw();};
window.setFilter=function(f){state.filter=f;draw();};
window.doReset=function(){if(confirm(‘Reset all leads?’)){state.leads=state.leads.map(function(l){return Object.assign({},l,{status:‘pending’,checkInTime:null,checkOutTime:null,notes:’’,checkedInAt:null});});save();draw();}};
window.openIn=function(id){state.modal={lead:state.leads.find(function(l){return l.id==id;}),mode:‘in’};state.modalNotes=’’;draw();};
window.openOut=function(id){var lead=state.leads.find(function(l){return l.id==id;});state.modal={lead:lead,mode:‘out’};state.coStatus=‘not_interested’;state.modalNotes=lead.notes||’’;draw();};
window.closeModal=function(){state.modal=null;draw();};
window.setCO=function(s){state.coStatus=s;draw();};
window.confirmIn=function(){
var n=document.getElementById(‘mnotes’)?document.getElementById(‘mnotes’).value:state.modalNotes;
state.leads=state.leads.map(function(l){return l.id==state.modal.lead.id?Object.assign({},l,{status:‘checked_in’,checkInTime:new Date().toLocaleTimeString(),checkedInAt:Date.now(),notes:n}):l;});
save();state.modal=null;draw();
};
window.confirmOut=function(){
var n=document.getElementById(‘mnotes’)?document.getElementById(‘mnotes’).value:state.modalNotes;
state.leads=state.leads.map(function(l){return l.id==state.modal.lead.id?Object.assign({},l,{status:state.coStatus,checkOutTime:new Date().toLocaleTimeString(),notes:n}):l;});
save();state.modal=null;draw();
};
window.openAdd=function(){state.addOpen=true;state.newName=’’;state.newAddr=’’;state.newType=‘Restaurant’;state.newLat=null;state.newLng=null;draw();};
window.closeAdd=function(){state.addOpen=false;draw();};
window.tagGps=function(){if(state.gps){state.newLat=state.gps.lat;state.newLng=state.gps.lng;draw();}};
window.addBiz=function(){
var n=document.getElementById(‘newname’)?document.getElementById(‘newname’).value.trim():state.newName.trim();
var a=document.getElementById(‘newaddr’)?document.getElementById(‘newaddr’).value.trim():state.newAddr.trim();
if(!n||!a)return;
var nl={id:Date.now(),name:n,address:a,type:state.newType,
lat:state.newLat||(state.gps?state.gps.lat+(Math.random()-.5)*.003:43.649+(Math.random()-.5)*.02),
lng:state.newLng||(state.gps?state.gps.lng+(Math.random()-.5)*.003:-79.435+(Math.random()-.5)*.03),
status:‘pending’,checkInTime:null,checkOutTime:null,notes:’’,checkedInAt:null};
state.leads.push(nl);save();state.addOpen=false;draw();
};

load();
draw();
</script>

</body>
</html>