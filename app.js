<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Optimum Water Sales</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column}
button,input,select,textarea{font-family:inherit;box-sizing:border-box}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes gpsPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.8}50%{transform:translate(-50%,-50%) scale(1.6);opacity:.3}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5)}50%{box-shadow:0 0 0 6px rgba(251,191,36,0)}}
.spinner{width:9px;height:9px;border:2px solid #0ea5e9;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .7s linear infinite;vertical-align:middle}
.slide-up{animation:slideUp .25s ease}
.glow{animation:glow 2.5s ease-in-out infinite}
.gps-ring{animation:gpsPulse 2s ease-in-out infinite}
</style>
</head>
<body>
<div id="app"></div>
<script>
var STATUS_CFG={pending:{label:'Not Visited',color:'#6b7280',bg:'#f3f4f6',dot:'#9ca3af'},checked_in:{label:'Checked In',color:'#0ea5e9',bg:'#e0f2fe',dot:'#0ea5e9'},not_interested:{label:'Not Interested',color:'#ef4444',bg:'#fee2e2',dot:'#ef4444'},sale:{label:'SALE!',color:'#16a34a',bg:'#dcfce7',dot:'#16a34a'},callback:{label:'Call Back',color:'#f59e0b',bg:'#fef3c7',dot:'#f59e0b'},no_answer:{label:'No Answer',color:'#8b5cf6',bg:'#ede9fe',dot:'#8b5cf6'}};
var BIZ_TYPES=['Restaurant','Medical','Laundry','Spa/Wellness','Auto','Bakery','Retail','Office','Gym','Hotel','Other'];
var SAMPLE=[{id:1,name:'Tim Hortons',address:'1240 King St W',type:'Restaurant',lat:43.642,lng:-79.434},{id:2,name:'Metro Dental Clinic',address:'882 College St',type:'Medical',lat:43.655,lng:-79.421},{id:3,name:'Sunrise Laundromat',address:'334 Roncesvalles Ave',type:'Laundry',lat:43.648,lng:-79.449},{id:4,name:'Bella Cucina',address:'567 Bloor St W',type:'Restaurant',lat:43.661,lng:-79.441},{id:5,name:'GreenLeaf Spa',address:'221 Ossington Ave',type:'Spa/Wellness',lat:43.652,lng:-79.431},{id:6,name:'Parkdale Auto Shop',address:'1100 Queen St W',type:'Auto',lat:43.638,lng:-79.436},{id:7,name:'Corner Bakery Co.',address:'489 Dufferin St',type:'Bakery',lat:43.644,lng:-79.445},{id:8,name:'Dr. Patel Chiropractic',address:'75 Runnymede Rd',type:'Medical',lat:43.651,lng:-79.461}];

function hav(lat1,lng1,lat2,lng2){var R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180,a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function fmt(km){return km<1?Math.round(km*1000)+‘m’:km.toFixed(1)+‘km’;}

var leads,view,activeId,gps,gpsStatus,gpsError,watchId,filterStatus,modal,modalNotes,checkoutStatus,addModal,newBiz,addingGps,animFrame;

function init(){
try{var s=localStorage.getItem(‘ow_v5’);leads=s?JSON.parse(s):null;}catch(e){leads=null;}
if(!leads)leads=SAMPLE.map(function(l){return Object.assign({},l,{status:‘pending’,checkInTime:null,checkOutTime:null,notes:’’,checkedInAt:null});});
view=‘map’;activeId=null;gps=null;gpsStatus=‘idle’;gpsError=’’;watchId=null;filterStatus=‘all’;modal=null;modalNotes=’’;checkoutStatus=‘not_interested’;addModal=false;newBiz={name:’’,address:’’,type:‘Restaurant’,lat:null,lng:null};addingGps=false;animFrame=null;
render();
}

function save(){try{localStorage.setItem(‘ow_v5’,JSON.stringify(leads));}catch(e){}}

function getStats(){
var visited=leads.filter(function(l){return l.status!=‘pending’;}).length;
var sales=leads.filter(function(l){return l.status==‘sale’;}).length;
return{total:leads.length,visited:visited,sales:sales,ni:leads.filter(function(l){return l.status==‘not_interested’;}).length,cb:leads.filter(function(l){return l.status==‘callback’;}).length,na:leads.filter(function(l){return l.status==‘no_answer’;}).length,conv:visited>0?Math.round((sales/visited)*100):0};
}

function getNearest(){
if(!gps)return null;
var pending=leads.filter(function(l){return l.status==‘pending’;}).map(function(l){return Object.assign({},l,{dist:hav(gps.lat,gps.lng,l.lat,l.lng)});});
if(!pending.length)return null;
return pending.sort(function(a,b){return a.dist-b.dist;})[0];
}

function pin(lead,minLat,maxLat,minLng,maxLng){
var x=((lead.lng-minLng)/(maxLng-minLng))*100;
var y=(1-(lead.lat-minLat)/(maxLat-minLat))*100;
return{x:Math.max(3,Math.min(97,x)),y:Math.max(3,Math.min(97,y))};
}

function startGps(){
if(!navigator.geolocation){gpsStatus=‘error’;gpsError=‘GPS not supported.’;render();return;}
gpsStatus=‘loading’;render();
watchId=navigator.geolocation.watchPosition(function(pos){gps={lat:pos.coords.latitude,lng:pos.coords.longitude};gpsStatus=‘ok’;render();},function(err){gpsStatus=‘error’;gpsError=err.code===1?‘Location permission denied.’:‘Could not get location.’;render();},{enableHighAccuracy:true,maximumAge:10000,timeout:15000});
}
function stopGps(){if(watchId!=null)navigator.geolocation.clearWatch(watchId);gps=null;gpsStatus=‘idle’;render();}

function drawMap(canvas){
if(!canvas)return;
if(animFrame)cancelAnimationFrame(animFrame);
var ctx=canvas.getContext(‘2d’);var t=0;
function draw(){
canvas.width=canvas.offsetWidth||window.innerWidth;canvas.height=canvas.offsetHeight||300;
var w=canvas.width,h=canvas.height;
ctx.fillStyle=’#0d1b2a’;ctx.fillRect(0,0,w,h);
ctx.strokeStyle=’#1e293b’;ctx.lineWidth=1;
for(var x=0;x<w;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
for(var y=0;y<h;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
ctx.strokeStyle=’#334155’;ctx.lineWidth=3;
[120,300,480].forEach(function(x){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();});
[120,240,360].forEach(function(y){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();});
ctx.strokeStyle=‘rgba(14,165,233,’+(0.25+0.12*Math.sin(t*0.05))+’)’;
ctx.lineWidth=4;ctx.setLineDash([10,6]);ctx.lineDashOffset=-t*0.5;
ctx.beginPath();ctx.moveTo(60,60);ctx.lineTo(300,60);ctx.lineTo(300,240);ctx.lineTo(500,240);ctx.stroke();
ctx.setLineDash([]);t++;animFrame=requestAnimationFrame(draw);
}
draw();
}

function render(){
var st=getStats(),nr=getNearest();
var allLats=leads.map(function(l){return l.lat;}),allLngs=leads.map(function(l){return l.lng;});
var minLat=Math.min.apply(null,allLats)-0.006,maxLat=Math.max.apply(null,allLats)+0.006;
var minLng=Math.min.apply(null,allLngs)-0.012,maxLng=Math.max.apply(null,allLngs)+0.012;
var activeLead=leads.find(function(l){return l.id===activeId;});

var h=’’;

// HEADER
h+=’<header style="background:#0a1628;border-bottom:1px solid #1e293b;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">’;
h+=’<div style="display:flex;align-items:center;gap:9px;"><div style="width:30px;height:30px;background:linear-gradient(135deg,#0ea5e9,#0369a1);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:11px;">OW</div>’;
h+=’<div><div style="font-weight:700;font-size:13px;color:#f8fafc;">OPTIMUM WATER</div><div style="font-size:8px;color:#475569;letter-spacing:.12em;">FIELD SALES TRACKER</div></div></div>’;
h+=’<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">’;
var gpsBg=gpsStatus==‘ok’?’#0ea5e9’:gpsStatus==‘loading’?’#0c2a45’:’#1e293b’;
var gpsCol=gpsStatus==‘ok’?’#fff’:’#94a3b8’;
var gpsLbl=gpsStatus==‘loading’?’<span class="spinner"></span> Locating…’:gpsStatus==‘ok’?‘GPS ON’:‘GPS’;
h+=’<button onclick="toggleGps()" style="padding:5px 9px;border-radius:6px;border:none;cursor:pointer;font-size:11px;background:'+gpsBg+';color:'+gpsCol+';">’+gpsLbl+’</button>’;
[‘map’,‘list’,‘stats’].forEach(function(v){h+=’<button onclick="setView(\''+v+'\')" style="padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-size:11px;background:'+(view==v?'#0ea5e9':'#1e293b')+';color:'+(view==v?'#fff':'#94a3b8')+';">’+v+’</button>’;});
h+=’</div></header>’;

// GPS ERROR
if(gpsStatus==‘error’)h+=’<div style="background:#450a0a;padding:8px 14px;font-size:11px;color:#fca5a5;display:flex;justify-content:space-between;align-items:center;"><span>’+gpsError+’</span><button onclick="dismissErr()" style="background:none;border:none;color:#fca5a5;cursor:pointer;font-size:16px;">X</button></div>’;

// NEAREST BANNER
if(nr&&view==‘map’){
h+=’<div onclick="setActive('+nr.id+')" class="glow" style="background:linear-gradient(90deg,#1c1500,#231d00);border-bottom:2px solid #f59e0b;padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">’;
h+=’<div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;"></div><div><div style="font-size:9px;color:#f59e0b;letter-spacing:.12em;text-transform:uppercase;">NEAREST UNVISITED</div><div style="font-size:15px;font-weight:700;color:#fef9c3;">’+nr.name+’</div><div style="font-size:10px;color:#92400e;">’+nr.address+’</div></div></div>’;
h+=’<div style="text-align:right;flex-shrink:0;"><div style="font-size:22px;font-weight:900;color:#f59e0b;">’+fmt(nr.dist)+’</div><div style="font-size:9px;color:#78350f;">AWAY - TAP</div></div></div>’;
}

// STATS BAR
h+=’<div style="background:#0a1220;border-bottom:1px solid #1e293b;padding:7px 14px;display:flex;gap:16px;align-items:center;overflow-x:auto;">’;
[[‘Total’,st.total,’#64748b’],[‘Visited’,st.visited,’#0ea5e9’],[‘Sales’,st.sales,’#16a34a’],[‘Conv.’,st.conv+’%’,st.conv>=20?’#16a34a’:’#f59e0b’]].forEach(function(s){h+=’<div style="display:flex;align-items:baseline;gap:4px;white-space:nowrap;"><span style="font-size:9px;color:#334155;text-transform:uppercase;">’+s[0]+’</span><span style="font-size:16px;font-weight:800;color:'+s[2]+';">’+s[1]+’</span></div>’;});
h+=’<div style="margin-left:auto;display:flex;gap:6px;flex-shrink:0;"><button onclick="openAdd()" style="padding:5px 11px;background:#0ea5e9;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;font-weight:700;">+ Add</button><button onclick="resetAll()" style="padding:5px 9px;background:transparent;border:1px solid #1e293b;border-radius:6px;color:#475569;font-size:11px;cursor:pointer;">Reset</button></div></div>’;

// MAP VIEW
if(view==‘map’){
h+=’<div style="flex:1;display:flex;flex-direction:column;position:relative;min-height:400px;">’;
h+=’<canvas id="mc" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>’;
if(gps){
var gx=((gps.lng-minLng)/(maxLng-minLng))*100,gy=(1-(gps.lat-minLat)/(maxLat-minLat))*100;
h+=’<div class="gps-ring" style="position:absolute;left:'+gx+'%;top:'+gy+'%;width:40px;height:40px;border-radius:50%;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.3);transform:translate(-50%,-50%);pointer-events:none;"></div>’;
h+=’<div style="position:absolute;left:'+gx+'%;top:'+gy+'%;width:10px;height:10px;border-radius:50%;background:#0ea5e9;border:2px solid #fff;transform:translate(-50%,-50%);z-index:30;pointer-events:none;"></div>’;
}
leads.forEach(function(lead){
var p=pin(lead,minLat,maxLat,minLng,maxLng),cfg=STATUS_CFG[lead.status];
var isA=lead.id===activeId,isN=nr&&nr.id===lead.id,sz=isA?21:isN?18:14;
var border=isN?‘2.5px solid #f59e0b’:isA?‘3px solid #0ea5e9’:‘2px solid rgba(255,255,255,.15)’;
var shadow=isA?‘0 0 0 5px rgba(14,165,233,.3)’:isN?‘0 0 0 4px rgba(245,158,11,.25)’:‘none’;
h+=’<button onclick="setActive('+lead.id+')" style="position:absolute;left:'+p.x+'%;top:'+p.y+'%;transform:translate(-50%,-50%);background:'+(isA?'#fff':cfg.dot)+';border:'+border+';border-radius:50%;width:'+sz+'px;height:'+sz+'px;cursor:pointer;padding:0;box-shadow:'+shadow+';z-index:'+(isA?22:isN?18:10)+';"></button>’;
});
if(activeLead){
var cfg2=STATUS_CFG[activeLead.status];
var dist2=gps?hav(gps.lat,gps.lng,activeLead.lat,activeLead.lng):null;
h+=’<div class="slide-up" style="position:absolute;bottom:0;left:0;right:0;background:#0a1628;border-top:2px solid #1e293b;padding:14px 14px 18px;">’;
h+=’<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;"><div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:15px;color:#f8fafc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">’+activeLead.name+’</div><div style="font-size:10px;color:#94a3b8;margin-top:1px;">’+activeLead.address+’</div>’+(dist2!=null?’<div style="font-size:10px;color:#f59e0b;margin-top:2px;">’+fmt(dist2)+’ away</div>’:’’)+’</div>’;
h+=’<div style="background:'+cfg2.bg+';border-radius:20px;padding:3px 8px;display:flex;align-items:center;gap:4px;margin-left:8px;flex-shrink:0;"><span style="width:6px;height:6px;border-radius:50%;background:'+cfg2.dot+';display:inline-block;"></span><span style="font-size:9px;font-weight:700;color:'+cfg2.color+';">’+cfg2.label+’</span></div></div>’;
if(activeLead.notes)h+=’<div style="font-size:10px;color:#64748b;margin-bottom:8px;font-style:italic;">’+activeLead.notes+’</div>’;
h+=’<div style="display:flex;gap:7px;">’;
if(activeLead.status==‘pending’)h+=’<button onclick="openIn('+activeLead.id+')" style="flex:1;padding:10px;background:#0ea5e9;border:none;border-radius:8px;color:#fff;font-weight:800;font-size:12px;cursor:pointer;">CHECK IN</button>’;
if(activeLead.status==‘checked_in’)h+=’<button onclick="openOut('+activeLead.id+')" style="flex:1;padding:10px;background:#f59e0b;border:none;border-radius:8px;color:#000;font-weight:800;font-size:12px;cursor:pointer;">CHECK OUT</button>’;
if([‘not_interested’,‘no_answer’,‘callback’,‘sale’].indexOf(activeLead.status)>=0)h+=’<div style="flex:1;text-align:center;font-size:11px;color:#475569;padding:10px;">Visit complete</div>’;
h+=’<button onclick="setActive(null)" style="padding:10px 13px;background:#1e293b;border:none;border-radius:8px;color:#94a3b8;cursor:pointer;font-size:13px;flex-shrink:0;">X</button></div></div>’;
}
h+=’<div style="position:absolute;top:10px;right:10px;background:rgba(10,18,32,.9);border-radius:8px;padding:8px 10px;">’;
if(gpsStatus==‘ok’)h+=’<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;"><span style="width:8px;height:8px;border-radius:50%;background:#0ea5e9;display:inline-block;"></span><span style="font-size:8px;color:#7dd3fc;">You (live)</span></div>’;
Object.keys(STATUS_CFG).filter(function(k){return k!=‘checked_in’;}).forEach(function(k){var v=STATUS_CFG[k];h+=’<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;"><span style="width:6px;height:6px;border-radius:50%;background:'+v.dot+';display:inline-block;flex-shrink:0;"></span><span style="font-size:8px;color:#64748b;">’+v.label+’</span></div>’;});
h+=’</div>’;
if(gpsStatus==‘idle’)h+=’<div onclick="toggleGps()" style="position:absolute;top:10px;left:10px;background:rgba(10,18,32,.88);border-radius:8px;padding:8px 10px;cursor:pointer;"><div style="font-size:9px;color:#64748b;">Tap GPS button</div><div style="font-size:8px;color:#334155;margin-top:1px;">to find nearest lead</div></div>’;
h+=’</div>’;
}

// LIST VIEW
if(view==‘list’){
var filters=[[‘all’,‘All’],[‘pending’,‘Not Visited’],[‘checked_in’,‘Checked In’],[‘sale’,‘Sale’],[‘not_interested’,‘Not Interested’],[‘callback’,‘Call Back’],[‘no_answer’,‘No Answer’]];
var filtered=filterStatus==‘all’?leads.slice():leads.filter(function(l){return l.status==filterStatus;});
if(gps)filtered=filtered.map(function(l){return Object.assign({},l,{dist:hav(gps.lat,gps.lng,l.lat,l.lng)});}).sort(function(a,b){return a.dist-b.dist;});
h+=’<div style="flex:1;padding:13px;overflow-y:auto;"><div style="display:flex;gap:6px;margin-bottom:11px;flex-wrap:wrap;">’;
filters.forEach(function(f){h+=’<button onclick="setFilter(\''+f[0]+'\')" style="padding:3px 10px;border-radius:20px;border:none;cursor:pointer;font-size:10px;background:'+(filterStatus==f[0]?'#0ea5e9':'#1e293b')+';color:'+(filterStatus==f[0]?'#fff':'#94a3b8')+';">’+f[1]+’</button>’;});
h+=’</div>’;
filtered.forEach(function(lead){
var cfg3=STATUS_CFG[lead.status],isN2=nr&&nr.id==lead.id;
var d=lead.dist!=null?lead.dist:gps?hav(gps.lat,gps.lng,lead.lat,lead.lng):null;
h+=’<div style="background:#0d1a2e;border-radius:9px;margin-bottom:7px;padding:10px 12px;border:1px solid '+(isN2?'#f59e0b':lead.status=='sale'?'#16a34a':'#1e293b')+';">’;
h+=’<div style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:13px;color:#f1f5f9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">’+lead.name+’</div><div style="font-size:10px;color:#475569;margin-top:1px;">’+lead.address+’ - ‘+lead.type+’</div>’+(d!=null?’<div style="font-size:10px;color:'+(isN2?'#f59e0b':'#334155')+';margin-top:2px;">’+fmt(d)+’ away</div>’:’’)+(lead.notes?’<div style="font-size:9px;color:#475569;margin-top:3px;font-style:italic;">’+lead.notes+’</div>’:’’)+’</div>’;
h+=’<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-left:10px;"><div style="background:'+cfg3.bg+';border-radius:20px;padding:2px 7px;display:flex;align-items:center;gap:4px;"><span style="width:5px;height:5px;border-radius:50%;background:'+cfg3.dot+';display:inline-block;"></span><span style="font-size:8px;font-weight:700;color:'+cfg3.color+';white-space:nowrap;">’+cfg3.label+’</span></div>’;
if(lead.status==‘pending’)h+=’<button onclick="setActive('+lead.id+');openIn('+lead.id+')" style="padding:5px 9px;background:#0ea5e9;border:none;border-radius:6px;color:#fff;font-size:10px;cursor:pointer;font-weight:700;">Check In</button>’;
if(lead.status==‘checked_in’)h+=’<button onclick="setActive('+lead.id+');openOut('+lead.id+')" style="padding:5px 9px;background:#f59e0b;border:none;border-radius:6px;color:#000;font-size:10px;cursor:pointer;font-weight:700;">Check Out</button>’;
h+=’</div></div></div>’;
});
if(!filtered.length)h+=’<div style="text-align:center;padding:40px 20px;color:#334155;font-size:12px;">No businesses in this filter</div>’;
h+=’</div>’;
}

// STATS VIEW
if(view==‘stats’){
h+=’<div style="flex:1;padding:16px;overflow-y:auto;">’;
h+=’<div style="margin-bottom:16px;"><div style="font-size:9px;color:#475569;letter-spacing:.12em;text-transform:uppercase;">TODAY'S PERFORMANCE</div><div style="font-size:10px;color:#334155;">’+new Date().toLocaleDateString(‘en-CA’,{weekday:‘long’,year:‘numeric’,month:‘long’,day:‘numeric’})+’</div></div>’;
h+=’<div style="background:linear-gradient(135deg,#052e16,#14532d);border:1px solid #166534;border-radius:12px;padding:18px 20px;margin-bottom:16px;text-align:center;"><div style="font-size:58px;font-weight:900;color:#4ade80;line-height:1;">’+st.sales+’</div><div style="font-size:11px;color:#86efac;margin-top:4px;letter-spacing:.1em;">SALES TODAY</div><div style="font-size:10px;color:#4ade80;margin-top:5px;opacity:.7;">’+st.conv+’% conversion rate</div></div>’;
h+=’<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">’;
[[‘Visited’,st.visited,st.total,’#0ea5e9’],[‘Not Interested’,st.ni,st.visited||1,’#ef4444’],[‘Callbacks’,st.cb,st.visited||1,’#f59e0b’],[‘No Answer’,st.na,st.visited||1,’#8b5cf6’]].forEach(function(s){
h+=’<div style="background:#0d1a2e;border-radius:9px;padding:12px;border:1px solid #1e293b;"><div style="font-size:26px;font-weight:800;color:'+s[3]+';">’+s[1]+’</div><div style="font-size:9px;color:#475569;margin-top:2px;">’+s[0]+’</div><div style="margin-top:7px;height:3px;background:#1e293b;border-radius:2px;"><div style="height:100%;width:'+Math.min(100,Math.round((s[1]/(s[2]||1))*100))+'%;background:'+s[3]+';border-radius:2px;"></div></div></div>’;
});
h+=’</div>’;
if(st.sales>0){
h+=’<div style="background:#0d1a2e;border-radius:9px;padding:13px;border:1px solid #166534;margin-bottom:10px;"><div style="font-size:9px;color:#4ade80;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;">SALES</div>’;
leads.filter(function(l){return l.status==‘sale’;}).forEach(function(l){h+=’<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><div><div style="font-size:12px;font-weight:700;color:#f1f5f9;">’+l.name+’</div><div style="font-size:9px;color:#475569;">’+l.address+’</div></div>’+(l.checkOutTime?’<div style="font-size:9px;color:#4ade80;">’+l.checkOutTime+’</div>’:’’)+’</div>’;});
h+=’</div>’;
}
if(st.cb>0){
h+=’<div style="background:#0d1a2e;border-radius:9px;padding:13px;border:1px solid #78350f;"><div style="font-size:9px;color:#fbbf24;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;">CALLBACKS</div>’;
leads.filter(function(l){return l.status==‘callback’;}).forEach(function(l){h+=’<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><div><div style="font-size:12px;font-weight:700;color:#f1f5f9;">’+l.name+’</div><div style="font-size:9px;color:#475569;">’+l.address+’</div>’+(l.notes?’<div style="font-size:9px;color:#78350f;font-style:italic;">’+l.notes+’</div>’:’’)+’</div><div style="font-size:9px;color:#f59e0b;">callback</div></div>’;});
h+=’</div>’;
}
h+=’</div>’;
}

// CHECK IN/OUT MODAL
if(modal){
var mcfg=STATUS_CFG[modal.lead.status];
h+=’<div style="position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:flex-end;z-index:100;"><div class="slide-up" style="background:#0a1628;border-top:2px solid #0ea5e9;border-radius:16px 16px 0 0;padding:20px 16px 28px;width:100%;">’;
h+=’<div style="margin-bottom:13px;"><div style="font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:.12em;">’+(modal.mode==‘checkin’?‘CHECKING IN AT’:‘CHECKING OUT OF’)+’</div><div style="font-size:18px;font-weight:700;color:#f8fafc;margin-top:3px;">’+modal.lead.name+’</div><div style="font-size:10px;color:#64748b;">’+modal.lead.address+’</div></div>’;
if(modal.mode==‘checkout’){
h+=’<div style="margin-bottom:13px;"><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:8px;">OUTCOME</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">’;
[‘sale’,‘not_interested’,‘callback’,‘no_answer’].forEach(function(s){var sc=STATUS_CFG[s];h+=’<button onclick="setCO(\''+s+'\')" style="padding:11px 7px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;border:2px solid '+(checkoutStatus==s?sc.dot:'#1e293b')+';background:'+(checkoutStatus==s?sc.bg:'#111827')+';color:'+(checkoutStatus==s?sc.color:'#475569')+';">’+sc.label+’</button>’;});
h+=’</div></div>’;
}
h+=’<div style="margin-bottom:13px;"><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:6px;">NOTES</div><textarea id="mn" oninput="modalNotes=this.value" placeholder="'+(modal.mode=='checkin'?'Owner present, showed interest...':'Left brochure, follow up next week...')+'" style="width:100%;background:#1a2640;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:13px;padding:10px 12px;resize:none;height:70px;outline:none;">’+modalNotes+’</textarea></div>’;
var confirmBg=modal.mode==‘checkin’?’#0ea5e9’:checkoutStatus==‘sale’?’#16a34a’:checkoutStatus==‘callback’?’#f59e0b’:’#ef4444’;
h+=’<div style="display:flex;gap:8px;"><button onclick="confirmM()" style="flex:1;padding:13px;background:'+confirmBg+';border:none;border-radius:9px;color:#fff;font-weight:900;font-size:12px;cursor:pointer;">’+(modal.mode==‘checkin’?‘CONFIRM CHECK IN’:‘CONFIRM CHECK OUT’)+’</button><button onclick="closeM()" style="padding:13px 15px;background:#1e293b;border:none;border-radius:9px;color:#94a3b8;cursor:pointer;font-size:16px;">X</button></div>’;
h+=’</div></div>’;
}

// ADD MODAL
if(addModal){
h+=’<div style="position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:flex-end;z-index:100;"><div class="slide-up" style="background:#0a1628;border-top:2px solid #16a34a;border-radius:16px 16px 0 0;padding:20px 16px 28px;width:100%;max-height:85vh;overflow-y:auto;">’;
h+=’<div style="margin-bottom:15px;"><div style="font-size:9px;color:#475569;text-transform:uppercase;">ADD NEW BUSINESS</div><div style="font-size:17px;font-weight:700;color:#f8fafc;margin-top:3px;">Walk-in Lead</div></div>’;
h+=’<div style="display:flex;flex-direction:column;gap:12px;">’;
h+=’<div><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:5px;">BUSINESS NAME</div><input id="bn" oninput="newBiz.name=this.value" value="'+newBiz.name+'" placeholder="e.g. Fresh Cut Barbershop" style="width:100%;background:#1a2640;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:13px;padding:10px 12px;outline:none;"/></div>’;
h+=’<div><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:5px;">ADDRESS</div><input id="ba" oninput="newBiz.address=this.value" value="'+newBiz.address+'" placeholder="e.g. 450 Queen St W" style="width:100%;background:#1a2640;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:13px;padding:10px 12px;outline:none;"/></div>’;
h+=’<div><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:5px;">TYPE</div><select onchange="newBiz.type=this.value" style="width:100%;background:#1a2640;border:1px solid #334155;border-radius:8px;color:#e2e8f0;font-size:13px;padding:10px 12px;outline:none;">’;
BIZ_TYPES.forEach(function(t){h+=’<option’+(newBiz.type==t?’ selected’:’’)+’>’+t+’</option>’;});
h+=’</select></div>’;
h+=’<div><div style="font-size:9px;color:#475569;text-transform:uppercase;margin-bottom:5px;">GPS LOCATION</div>’;
if(gpsStatus==‘ok’)h+=’<button onclick="tagGps()" style="width:100%;padding:11px;background:'+(addingGps?'#052e16':'#0d1a2e')+';border:2px solid '+(addingGps?'#16a34a':'#1e3a5f')+';border-radius:8px;color:'+(addingGps?'#4ade80':'#7dd3fc')+';font-size:11px;cursor:pointer;">’+(addingGps?‘GPS location tagged!’:‘Tag my current GPS location’)+’</button>’;
else h+=’<div style="padding:10px 12px;background:#0d1a2e;border-radius:8px;border:1px solid #1e3a5f;font-size:10px;color:#334155;">GPS not active - turn on GPS to pin location.</div>’;
if(newBiz.lat)h+=’<div style="font-size:9px;color:#4ade80;margin-top:4px;">Pinned: ‘+newBiz.lat.toFixed(5)+’, ‘+newBiz.lng.toFixed(5)+’</div>’;
h+=’</div></div>’;
var canAdd=newBiz.name.trim()&&newBiz.address.trim();
h+=’<div style="display:flex;gap:8px;margin-top:16px;"><button onclick="addBiz()" style="flex:1;padding:13px;border-radius:9px;border:none;font-weight:900;font-size:12px;cursor:pointer;background:'+(canAdd?'#16a34a':'#1e293b')+';color:'+(canAdd?'#fff':'#334155')+';">ADD TO MY ROUTE</button><button onclick="closeAdd()" style="padding:13px 15px;background:#1e293b;border:none;border-radius:9px;color:#94a3b8;cursor:pointer;font-size:16px;">X</button></div>’;
h+=’</div></div>’;
}

document.getElementById(‘app’).innerHTML=h;

if(view==‘map’){var c=document.getElementById(‘mc’);if(c)drawMap(c);}
}

// GLOBAL ACTIONS
window.toggleGps=function(){gpsStatus==‘ok’?stopGps():startGps();};
window.setView=function(v){view=v;if(animFrame){cancelAnimationFrame(animFrame);animFrame=null;}render();};
window.setActive=function(id){activeId=activeId===id?null:id;render();};
window.setFilter=function(f){filterStatus=f;render();};
window.dismissErr=function(){gpsStatus=‘idle’;render();};
window.resetAll=function(){if(confirm(‘Reset all leads for a fresh day?’)){leads=leads.map(function(l){return Object.assign({},l,{status:‘pending’,checkInTime:null,checkOutTime:null,notes:’’,checkedInAt:null});});save();activeId=null;render();}};
window.openIn=function(id){modal={lead:leads.find(function(l){return l.id===id;}),mode:‘checkin’};modalNotes=’’;render();};
window.openOut=function(id){modal={lead:leads.find(function(l){return l.id===id;}),mode:‘checkout’};checkoutStatus=‘not_interested’;modalNotes=leads.find(function(l){return l.id===id;}).notes||’’;render();};
window.closeM=function(){modal=null;render();};
window.setCO=function(s){checkoutStatus=s;render();};
window.confirmM=function(){
var notes=document.getElementById(‘mn’)?document.getElementById(‘mn’).value:modalNotes;
if(modal.mode==‘checkin’){leads=leads.map(function(l){return l.id===modal.lead.id?Object.assign({},l,{status:‘checked_in’,checkInTime:new Date().toLocaleTimeString(),checkedInAt:Date.now(),notes:notes}):l;});}
else{leads=leads.map(function(l){return l.id===modal.lead.id?Object.assign({},l,{status:checkoutStatus,checkOutTime:new Date().toLocaleTimeString(),notes:notes}):l;});activeId=null;}
save();modal=null;render();
};
window.openAdd=function(){addModal=true;newBiz={name:’’,address:’’,type:‘Restaurant’,lat:null,lng:null};render();};
window.closeAdd=function(){addModal=false;render();};
window.tagGps=function(){if(gps){newBiz=Object.assign({},newBiz,{lat:gps.lat,lng:gps.lng});addingGps=true;render();setTimeout(function(){addingGps=false;render();},2500);}};
window.addBiz=function(){
var name=document.getElementById(‘bn’)?document.getElementById(‘bn’).value.trim():newBiz.name.trim();
var addr=document.getElementById(‘ba’)?document.getElementById(‘ba’).value.trim():newBiz.address.trim();
if(!name||!addr)return;
var nl={id:Date.now(),name:name,address:addr,type:newBiz.type,lat:newBiz.lat||(gps?gps.lat+(Math.random()-.5)*.003:43.649+(Math.random()-.5)*.02),lng:newBiz.lng||(gps?gps.lng+(Math.random()-.5)*.003:-79.435+(Math.random()-.5)*.03),status:‘pending’,checkInTime:null,checkOutTime:null,notes:’’,checkedInAt:null,addedManually:true};
leads=[].concat(leads,[nl]);save();addModal=false;activeId=nl.id;view=‘map’;render();
};

init();
</script>

</body>
</html>