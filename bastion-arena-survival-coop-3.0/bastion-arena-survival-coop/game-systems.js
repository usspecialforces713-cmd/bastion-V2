const ELEM={'Pyro':'fire','Dragon':'fire','Météore':'fire','Pirate':'fire','Givre':'ice','Marée':'water','Volt':'lightning','Géo':'earth','Sable':'earth','Vent':'wind','Toxine':'poison','Néant':'void','Paladin':'light','Tireur':'light','PlantG':'plant','Magnétique':'metal','Ingénieur':'metal','Boomerang':'metal','Chasseur':'metal','Mecha':'metal','Nécro':'dark','Ombre':'dark','Mage':'arcane'};
function hv(p,e){return Math.abs((p.y||0)-(e.position.y-1))<e.userData.rad+1.5}
function inE(p,r,fn){for(const e of E.slice())if(Math.hypot(e.position.x-p.x,e.position.z-p.z)<r+e.userData.rad)fn(e)}
function dmg(e,d){const j=E.indexOf(e);if(j>=0)hitE(j,d)}
function pullTo(e,p,st){const ex=p.x-e.position.x,ez=p.z-e.position.z,d=Math.hypot(ex,ez);if(d>.5){const s=Math.min(d,st*(e.userData.boss?.35:1));e.position.x+=ex/d*s;e.position.z+=ez/d*s}e.userData.hold=.15}
function zone(p,rad,dur,every,col,fn){const m=disc(rad,col,.3);m.position.set(p.x,.1,p.z);scene.add(m);Z.push({c:null,t:dur,k:0,m,run(z,dt){m.material.opacity=.2+.1*Math.sin(z.t*8);if(z.k<=0){z.k=every;inE(p,rad,e=>fn(e,z))}}})}
function sing(p){const g=disc(12,0x220033,.4);g.position.set(p.x,.1,p.z);scene.add(g);Z.push({c:null,t:2,k:0,m:g,end(){flash(p,7,0x8a5cff);inR(p,7,18+S.dm*3,0)},run(z,dt){inE(p,12,e=>pullTo(e,p,6*dt))}})}
function eclipse(q){C.forEach(o=>{if(o.alive)o.hp=Math.min(o.max,o.hp+o.max*.3)});hud();flash(q,12,0xfff2b0);inR(q,12,12+S.dm*2,0)}
const RX={
 'fire|water':['Vapeur',p=>zone(p,9,4,.3,0xdddddd,e=>{if(!(e.userData.blind>0))e.userData.ba=(Math.random()-.5)*5;e.userData.blind=.5;e.userData.slow=.4;dmg(e,1.5+S.dm*.5)})],
 'fire|ice':['Fonte',p=>{inE(p,8,e=>e.userData.slow=3);inR(p,8,12+S.dm*2,0)}],
 'lightning|water':['Électrocution',p=>inE(p,13,e=>{e.userData.hold=1.2;line(p,e.position,0xf5f06a,1.4,.4);dmg(e,14+S.dm*2)})],
 'ice|lightning':['Supraconduction',p=>inE(p,9,e=>{e.userData.hold=2;e.material.emissive.setHex(0x66ccff);dmg(e,6+S.dm)})],
 'fire|wind':['Tempête de feu',p=>zone(p,9,3.5,.3,0xff6a1a,e=>{pullTo(e,p,1.2);dmg(e,4+S.dm*.8)})],
 'fire|poison':['Explosion toxique',p=>{inR(p,8,20+S.dm*3,3);puddle(p.x,p.z,6,4,2)}],
 'earth|water':['Boue',p=>zone(p,9,6,.4,0x6b4a2a,e=>{e.userData.slow=.6;dmg(e,.5)})],
 'poison|wind':['Brume toxique',p=>zone(p,14,4,.4,0xb040b0,e=>{e.userData.slow=.6;dmg(e,2+S.dm*.6)})],
 'fire|plant':['Brasier',p=>{inR(p,9,14+S.dm*2,0);puddle(p.x,p.z,7,5,3,0xff6a1a)}],
 'plant|water':['Croissance',p=>{C.forEach(o=>{if(o.alive)o.hp=Math.min(o.max,o.hp+o.max*.25)});hud();inE(p,10,e=>e.userData.hold=2)}],
 'lightning|metal':['Surcharge',p=>inE(p,14,e=>{line(p,e.position,0xf5f06a,1.4,.4);dmg(e,10+S.dm*2)})],
 'earth|wind':['Poussière',p=>zone(p,10,4,.3,0xc9a96a,e=>{if(!(e.userData.blind>0))e.userData.ba=(Math.random()-.5)*5;e.userData.blind=.5;e.userData.slow=.5})],
 'ice|wind':['Blizzard',p=>zone(p,10,3,.3,0x9fe8ff,e=>{e.userData.slow=.5;dmg(e,2+S.dm*.6)})],
 'lightning|wind':['Orage',p=>{let n=0;const g=new THREE.Group();scene.add(g);Z.push({c:null,t:2,k:0,m:g,run(z,dt){if(z.k<=0&&n<8){z.k=.25;n++;const a=Math.random()*6.283,r=Math.random()*10;strike(p.x+Math.sin(a)*r,p.z+Math.cos(a)*r)}}})}],
 'earth|fire':['Magma',p=>{puddle(p.x,p.z,8,6,4+S.dm,0xff4a1a);inR(p,6,8+S.dm*1.5,2)}],
 'ice|water':['Glaciation',p=>inE(p,8,e=>{e.userData.hold=2;e.material.emissive.setHex(0x66ccff);dmg(e,5+S.dm)})],
 'poison|water':['Marécage',p=>puddle(p.x,p.z,9,5,2,0x6a8a2a)]};
function react(a,b,p){const k=[a,b].sort().join('|');let nm,fn;
  if(RX[k]){nm=RX[k][0];fn=RX[k][1]}
  else if(a=='void'||b=='void'){if(a=='light'||b=='light'){nm='Éclipse';fn=eclipse}else{nm='Singularité';fn=sing}}
  else if((a=='light'&&b=='dark')||(a=='dark'&&b=='light')){nm='Éclipse';fn=eclipse}
  else{nm='Résonance';fn=q=>inR(q,7,8+S.dm*1.5,2)}
  banner(t('reaction',{n:nm}));flash(p,10,0xffffff);burst(new THREE.Vector3(p.x,1,p.z),0xffffff);snd(520,.25,'triangle');fn(p)}
function zp(z){const q=z.m.position;return(Math.abs(q.x)+Math.abs(q.z)>.01)?q:z.p}
function tagZ(n0,el,c){if(!el)return;for(let i=n0;i<Z.length;i++){const z=Z[i],q=z.m.position;z.el=el;z.p=(Math.abs(q.x)+Math.abs(q.z)>.01)?{x:q.x,z:q.z}:{x:c.g.position.x,z:c.g.position.z}}}
function checkRx(){const L=Z.filter(z=>z.el);
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.el==b.el||(a.rxs&&a.rxs.has(b)))continue;
    const p=zp(a),q=zp(b);if(Math.hypot(p.x-q.x,p.z-q.z)<11){(a.rxs=a.rxs||new Set()).add(b);(b.rxs=b.rxs||new Set()).add(a);react(a.el,b.el,{x:(p.x+q.x)/2,z:(p.z+q.z)/2});return}}}
let AC=null,SN=0,MUTED=false;try{MUTED=localStorage.getItem('bastion-muted')==='1'}catch(e){}
function setMuted(v){MUTED=!!v;try{localStorage.setItem('bastion-muted',MUTED?'1':'0')}catch(e){}const b=$('mute');if(b){b.textContent=MUTED?'🔇':'🔊';b.setAttribute('aria-label',MUTED?'Activer le son':'Couper le son')}}
function snd(f,d,t){if(MUTED)return;try{const n=performance.now();if(n-SN<40)return;SN=n;AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(.04,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function num(p,v,crit){if(!SETTINGS.nums||v<.5||$('dn').childElementCount>40)return;const q=new THREE.Vector3(p.x,p.y+1.8,p.z).project(cam),d=document.createElement('div');d.className='dn';d.textContent=v>=10?Math.round(v):v.toFixed(1);d.style.left=((q.x*.5+.5)*innerWidth)+'px';d.style.top=((-q.y*.5+.5)*innerHeight)+'px';d.style.fontSize=(crit?26:v>=10?22:15)+'px';d.style.color=crit?'#ff5a7a':v>=10?'#ffd23f':'#fff';if(crit){d.textContent+='!';d.classList.add('crit')}$('dn').appendChild(d);setTimeout(()=>d.remove(),700)}
// 3.0 power-ups: dropped by enemies (10%) and spawned on the map every ~20 s.
const PU={heal:{col:0x5effa0,w:4},overdrive:{col:0xffd166,w:2},shield:{col:0x19f0ff,w:2},nuke:{col:0xff2bd6,w:1},coin:{col:0xffc94a,w:2}};
const PU_GEO=KEEP(new THREE.OctahedronGeometry(.55,0)),PU_RING=KEEP(new THREE.TorusGeometry(1.05,.06,6,32));
function drop(x,z,kind){if(!kind){const tot=Object.values(PU).reduce((a,b)=>a+b.w,0);let r=Math.random()*tot;for(const k in PU){r-=PU[k].w;if(r<=0){kind=k;break}}}
  const col=PU[kind].col,g=new THREE.Group(),gem=new THREE.Mesh(PU_GEO,new THREE.MeshBasicMaterial({color:col})),ring=new THREE.Mesh(PU_RING,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8})),pillar=new THREE.Mesh(new THREE.CylinderGeometry(.5,.9,5,12,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));
  ring.rotation.x=Math.PI/2;ring.position.y=.12;pillar.position.y=2.5;g.add(gem);g.add(ring);g.add(pillar);g.position.set(x,0,z);scene.add(g);
  Z.push({c:null,t:14,k:0,m:g,run(z2,dt){gem.rotation.y+=dt*3;gem.position.y=1+Math.sin(z2.t*4)*.22;ring.scale.setScalar(1+.12*Math.sin(z2.t*6));if(z2.t<3)g.visible=Math.sin(z2.t*20)>0;
    for(const c of C){if(c.alive&&!c.off&&Math.hypot(c.g.position.x-x,c.g.position.z-z)<1.7&&c.g.position.y<2.5){applyPU(kind,c);flash({x,z},2.6,col);burst(new THREE.Vector3(x,1,z),col);z2.t=0;break}}}})}
function applyPU(kind,c){snd(880,.15,'triangle');banner(t('powerup',{n:t('pu_'+kind)}),1100);
  if(kind==='heal'){C.forEach(o=>{if(o.alive)o.hp=Math.min(o.max,o.hp+o.max*.3)});hud()}
  else if(kind==='overdrive'){if(!(S.odT>0))S.rm*=.6;S.odT=8}
  else if(kind==='shield'){C.forEach(o=>{if(o.alive){o.shieldHP=45;showBubble(o,true)}})}
  else if(kind==='nuke'){QK=Math.max(QK,.35);flash(c.g.position,R,0xff2bd6);for(let j=E.length-1;j>=0;j--){if(!E[j].userData.mega)hitE(j,12+S.dm*2)}}
  else if(kind==='coin'){S.bonusCoins=(S.bonusCoins||0)+25}}
const BUBBLE_GEO=KEEP(new THREE.SphereGeometry(1.5,20,14)),BUBBLE_MAT=KEEP(new THREE.MeshBasicMaterial({color:0x19f0ff,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));
function showBubble(c,on){let b=c.g.userData.bubble;if(!b&&on){b=new THREE.Mesh(BUBBLE_GEO,BUBBLE_MAT);b.position.y=1.5;c.g.add(b);c.g.userData.bubble=b}if(b)b.visible=!!on}
function absorb(c,d){if(c.shieldHP>0){const a=Math.min(c.shieldHP,d);c.shieldHP-=a;d-=a;if(c.shieldHP<=0)showBubble(c,false)}return d}
// Deferred actions (spawns/explosions triggered while enemy arrays are being iterated).
const DEFER=[];function defer(fn){DEFER.push(fn)}function runDefer(){let n=0;while(DEFER.length&&n++<60)DEFER.shift()()}
function clampArena(e,m=1){const q=Math.hypot(e.position.x,e.position.z);if(q>R-m){e.position.x*=(R-m)/q;e.position.z*=(R-m)/q}}
function teleLine(p,ux,uz,len,col,life){const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,len),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55,depthWrite:false}));m.position.set(p.x+ux*len/2,.08,p.z+uz*len/2);m.rotation.y=Math.atan2(ux,uz);m.userData={v:new THREE.Vector3(),l:life,ring:1};scene.add(m);F.push(m);return m}
function bomberBlast(p){const q={x:p.x,z:p.z};flash(q,3.4,0xffa31a);burst(new THREE.Vector3(q.x,1,q.z),0xffa31a);burst(new THREE.Vector3(q.x,1,q.z),0xff2e63);QK=Math.max(QK,.22);snd(90,.25,'sawtooth');
  for(const c of C)if(c.alive&&!c.off&&c.inv<=0&&c.g.position.y<2.2&&Math.hypot(c.g.position.x-q.x,c.g.position.z-q.z)<3.4)hurt(c,22);
  defer(()=>inR(q,3.4,4,1.2))}
// Behaviour for the new enemy types. Returns true when it fully handled movement this frame.
function aiStep(e,dt,pp,dx,dz,l){const u=e.userData;u.stT-=dt;
  if(u.ai==='k'){
    if(u.st==='chase'){e.rotation.y=Math.atan2(dx,dz);if(l<12&&u.stT<=0){u.st='aim';u.stT=.75;u.dx=dx/l;u.dz=dz/l;teleLine(e.position,u.dx,u.dz,14,0xff2e63,.75)}return false}
    if(u.st==='aim'){e.rotation.y=Math.atan2(u.dx,u.dz);e.position.x+=(Math.random()-.5)*.06;if(u.stT<=0){u.st='dash';u.stT=.42;snd(160,.12,'sawtooth')}return true}
    if(u.st==='dash'){const sp=26*(S.enemySpd||1);e.position.x+=u.dx*sp*dt;e.position.z+=u.dz*sp*dt;clampArena(e);if(Math.random()<.4)burst(e.position.clone(),0xff2e63);if(u.stT<=0){u.st='rest';u.stT=.9}return true}
    if(u.stT<=0){u.st='chase';u.stT=1.4+Math.random()*1.2}return true}
  if(u.ai==='x'){
    if(u.st==='chase'){if(l<2.9){u.st='arm';u.stT=.85;const r=teleRing(e.position,3.4,0xffa31a,.85)}return false}
    const k=Math.sin(u.stT*34)>0;e.material.emissiveIntensity=k?2.2:.4;e.scale.setScalar(1+(.85-u.stT)*.6);
    if(u.stT<=0&&!u.dead){u.dead=1;defer(()=>{const j=E.indexOf(e);if(j>=0){bomberBlast(e.position);scene.remove(e);E.splice(j,1)}})}return true}
  if(u.ai==='n'){
    if(u.st==='chase'){const k=l>18?1:l<13?-1:0;e.position.x+=dx/l*k*u.sp*dt;e.position.z+=dz/l*k*u.sp*dt;clampArena(e,1.5);e.rotation.y+=dt*1.6;
      if(u.stT<=0&&l<28){u.st='aim';u.stT=1.05;u.tx=pp.x;u.tz=pp.z;u.las=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,1),new THREE.MeshBasicMaterial({color:0xff2e63,transparent:true,opacity:.85}));u.las.userData={v:new THREE.Vector3(),l:3,ring:1};scene.add(u.las);F.push(u.las)}return true}
    u.tx+=(pp.x-u.tx)*Math.min(1,dt*2.2);u.tz+=(pp.z-u.tz)*Math.min(1,dt*2.2);const ax=u.tx-e.position.x,az=u.tz-e.position.z,al=Math.hypot(ax,az)||1;
    if(u.las){u.las.position.set(e.position.x+ax/2,1.4,e.position.z+az/2);u.las.rotation.y=Math.atan2(ax,az);u.las.scale.z=al;u.las.visible=u.stT>.25||Math.sin(u.stT*60)>0}
    e.rotation.y=Math.atan2(ax,az);
    if(u.stT<=0){if(u.las){scene.remove(u.las);u.las=null}eshot(e.position,ax/al,az/al,16,36,0xff2e63);snd(1200,.06,'square');u.st='chase';u.stT=2.4+Math.random()*1.4}return true}
  return false}
function teleRing(p,rad,col,life){const m=new THREE.Mesh(new THREE.RingGeometry(rad*.88,rad,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(p.x,.09,p.z);m.userData={v:new THREE.Vector3(),l:life,ring:1};scene.add(m);F.push(m);return m}
function bestTxt(){let b={wave:0,score:0};try{b=JSON.parse(localStorage.getItem('bastion-best'))||b}catch(e){}
  const nw=S.score>b.score;if(nw){b={wave:S.wave,score:S.score};try{localStorage.setItem('bastion-best',JSON.stringify(b))}catch(e){}}
  let profile={runs:0,kills:0,highestLevel:1};try{profile=JSON.parse(localStorage.getItem('bastion-profile'))||profile}catch(e){}
  profile.runs=(profile.runs||0)+1;profile.kills=(profile.kills||0)+(S.runKills||S.kills||0);profile.highestLevel=Math.max(profile.highestLevel||1,S.level||1);
  try{localStorage.setItem('bastion-profile',JSON.stringify(profile))}catch(e){}
  try{if(window.BastionCloud&&typeof window.BastionCloud.save==='function'){window.BastionCloud.save({profile,best:b}).catch(()=>{})}}catch(e){}
  return (nw?' Nouveau record !':' Record : '+b.score+' points (vague '+b.wave+').')+'<br><small>Parties : '+profile.runs+' · Éliminations cumulées : '+profile.kills+' · Niveau max : '+profile.highestLevel+'</small>'}
function cycleOrd(){ORD=(ORD+1)%3;hud()}
function pause(){if(S.mode!='play')return;S.mode='pause';down=false;rdown=false;const o=$('ov');o.hidden=false;o.className='ui-screen pause';
  const alive=C.filter(c=>c.alive).length,K=(k,l)=>'<div class="key-row"><kbd>'+k+'</kbd><span>'+l+'</span></div>';
  o.innerHTML='<div class="up-wrap pause-box"><div class="up-kick">'+(UI.MODES[S.modeId]?UI.MODES[S.modeId].icon+' '+t('m_'+S.modeId):'')+'</div><h1 class="up-title">'+t('paused')+'</h1>'+
   '<div class="res-stats"><div><small>'+t('wave')+'</small><b>'+S.wave+'</b></div><div><small>'+t('score')+'</small><b>'+S.score+'</b></div><div><small>'+t('level')+'</small><b>'+(S.level||1)+'</b></div><div><small>'+t('heroesAlive')+'</small><b>'+alive+'/'+C.length+'</b></div></div>'+
   '<div class="res-actions col"><button id="rs" class="play-btn small"><span>'+t('resume')+'</span><i>▶</i></button><div class="row3"><button id="snd-t" class="ghost">'+(MUTED?t('soundOff'):t('soundOn'))+'</button><button id="rst" class="ghost">↻ '+t('restart')+'</button><button id="qm" class="ghost">🏠 '+t('mainMenu')+'</button></div></div>'+
   '<details class="keys"><summary>'+t('controls')+'</summary><div class="pause-keys">'+K('ZQSD / WASD',t('c_move'))+K('🖱',t('c_aim'))+K('Click / Space',t('c_attack'))+K('Shift',t('c_dodge'))+K('E / RMB',t('c_special'))+K('Hold R',t('c_charge'))+K('1–6 / Tab',t('c_switch'))+K('V',t('c_order'))+K('F',t('c_focus'))+K('M',t('c_mute'))+K('P / Esc',t('c_pause'))+'</div></details></div>';
  $('rs').onclick=resume;$('snd-t').onclick=()=>{setMuted(!MUTED);$('snd-t').textContent=MUTED?t('soundOff'):t('soundOn')};
  $('rst').onclick=()=>{if(S.mega)megaClean();UI.launch(S.modeId||'survival')};$('qm').onclick=()=>{if(S.mega)megaClean();UI.lobby()}}
function resume(){if(S.mode!='pause')return;S.mode='play';$('ov').hidden=true;$('ov').className=''}
$('ord').onclick=cycleOrd;if($('mute'))$('mute').onclick=()=>setMuted(!MUTED);setMuted(MUTED);$('pz').onclick=()=>{if(S.mode=='pause')resume();else pause()};$('sp').onclick=()=>{keys.KeyE=true;setTimeout(()=>keys.KeyE=false,150)};$('dg').onclick=tryDodge;$('jp').onclick=()=>{if(S.mega&&A&&(A.jc||0)<2){A.vy=12;A.jc=(A.jc||0)+1}};
function hurt(c,d){snd(80,.12,'square');d=absorb(c,d);if(d<=0){c.inv=Math.max(c.inv||0,.25);return}c.hp-=d;c.inv=Math.max(c.inv||0,.4);if(c===A){QK=Math.max(QK,.16);const df=$('damage-flash');if(df){df.classList.remove('show');void df.offsetWidth;df.classList.add('show')}combatImpact(c.g.position,0xff3b68,true);}if(c.hp<=0){c.alive=false;c.g.visible=false;c.tf=0;c.g.scale.setScalar(1);burst(c.g.position,c.r.col);if(c==A){const n=C.findIndex(o=>o.alive);if(n>=0)pick(n)}}hud()}
function eshot(p,ux,uz,d,sp,col,vy){const m=new THREE.Mesh(bGeo,new THREE.MeshBasicMaterial({color:col}));m.scale.setScalar(1.6);m.position.set(p.x,p.y+.2,p.z);m.userData={v:new THREE.Vector3(ux,vy||0,uz).multiplyScalar(sp),l:3.5,d};scene.add(m);EP.push(m)}
function node(x,z){const m=disc(5,0x8a3dd4,.3);m.position.set(x,.08,z);scene.add(m);
  Z.push({c:null,t:2.5,k:0,m,end(){const q={x,z};flash(q,3.2,0xff4a4a);burst(new THREE.Vector3(x,.5,z),0xff4a4a);inR(q,3.2,5+S.dm*1.5,0)},
    run(z2,dt){m.rotation.z+=dt*4;for(const e of E){const ex=x-e.position.x,ez=z-e.position.z,d=Math.hypot(ex,ez);if(d<6+e.userData.rad){e.userData.hold=.12;if(d>.6){const k=e.userData.boss?.35:1,st=Math.min(d,5*k*dt);e.position.x+=ex/d*st;e.position.z+=ez/d*st}}}}})}
function magShot(c){const p=c.g.position,a=c.g.rotation.y;shootX(p.x,p.z,a,0x8a3dd4,{mag:1,d:S.dm+1,l:1.3,v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(24)})}
function push(p,a,len,w,kb,d,extra){for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z,dd=Math.hypot(ex,ez)||1;if(dd<len+e.userData.rad&&adf(ex,ez,a)<w&&hv(p,e)){const k=e.userData.boss?.3:1;e.position.x+=ex/dd*kb*k;e.position.z+=ez/dd*kb*k;if(kb)e.userData.hold=.12;if(extra)extra(e);hitE(j,d)}}}
function jet(c){const p=c.g.position,a=c.g.rotation.y;slash(p,a,6,0x4fc3ff,.5);push(p,a,6,.55,.9,.5+S.dm*.3)}
function gust(c){const p=c.g.position,a=c.g.rotation.y;slash(p,a,7,0xdff5e8,.9);
  for(const q of EP){const ex=q.position.x-p.x,ez=q.position.z-p.z;if(Math.hypot(ex,ez)<8&&adf(ex,ez,a)<1){q.userData.v.multiplyScalar(-1.4);q.userData.back=1;q.userData.l=3}}push(p,a,7,.9,2.5,.8+S.dm*.3,e=>{e.userData.slow=1})}
function sandjet(c){const p=c.g.position,a=c.g.rotation.y;slash(p,a,6,0xe0b870,.55);push(p,a,6,.6,0,.4+S.dm*.2,e=>{e.userData.blind=1.5;e.userData.ba=(Math.random()-.5)*5})}
function pull(c){const p=c.g.position;flash(p,9,0x8a3dd4);for(let j=E.length-1;j>=0;j--){const e=E[j],ex=p.x-e.position.x,ez=p.z-e.position.z,d=Math.hypot(ex,ez)||1;if(d<9+e.userData.rad){const k=e.userData.boss?.3:1,st=Math.min(Math.max(0,d-1.6),3.5*k);e.position.x+=ex/d*st;e.position.z+=ez/d*st;e.userData.hold=.3;hitE(j,1+S.dm*.4)}}}
function tsunami(c){const p=c.g.position,a=c.g.rotation.y,ux=Math.sin(a),uz=Math.cos(a),sx=p.x-ux*3,sz=p.z-uz*3,g=new THREE.Group(),w=new THREE.Mesh(new THREE.BoxGeometry(18,3.5,2.2),new THREE.MeshBasicMaterial({color:0x2fa8ff,transparent:true,opacity:.6})),hit=new Set();
  w.position.y=1.75;g.add(w);g.rotation.y=a;scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const d=(6-z.t)*9,cx=sx+ux*d,cz=sz+uz*d;g.position.set(cx,0,cz);w.scale.y=1+.15*Math.sin(z.t*14);
    for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-cx,ez=e.position.z-cz,f=ex*ux+ez*uz,s=Math.abs(ex*uz-ez*ux);
      if(s<9+e.userData.rad&&Math.abs(f)<2.5+e.userData.rad){const k=e.userData.boss?.4:1;e.position.x+=ux*11*k*dt;e.position.z+=uz*11*k*dt;e.userData.hold=.2;
        const q2=Math.hypot(e.position.x,e.position.z);if(q2>R-.5){e.position.x*=(R-.5)/q2;e.position.z*=(R-.5)/q2}
        if(!hit.has(e)){hit.add(e);hitE(j,8+S.dm*2)}}}}})}
function tornado(c){const t=tgt(c,14,7),RAD=9,g=new THREE.Group(),got=new Set();let rel=0;
  for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(1+i*.9,.3+i*.7,1.4,12,1,true),new THREE.MeshBasicMaterial({color:0xcfeedd,transparent:true,opacity:.35,side:THREE.DoubleSide}));m.position.y=.7+i*1.4;g.add(m)}
  g.position.set(t.x,0,t.z);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,end(){got.forEach(e=>{const j=E.indexOf(e);if(j>=0)hitE(j,6+S.dm*1.5)})},
    run(z,dt){const el=6-z.t;g.children.forEach((m,i)=>m.rotation.y+=dt*(8-i));
      if(el<3.5){for(const e of E){const ex=t.x-e.position.x,ez=t.z-e.position.z,d=Math.hypot(ex,ez);if(d<RAD+e.userData.rad){got.add(e);e.userData.hold=.12;const k=e.userData.boss?.4:1,st=Math.min(d,5*k*dt),sp=18*k*dt;
          if(d>.5){e.position.x+=ex/d*st+(-ez/d)*sp;e.position.z+=ez/d*st+(ex/d)*sp}}}
        if(z.k<=0){z.k=.5;got.forEach(e=>{const j=E.indexOf(e);if(j>=0)hitE(j,1+S.dm*.4)})}}
      else if(!rel){rel=1;got.forEach(e=>{let ux=e.position.x-t.x,uz=e.position.z-t.z;if(Math.hypot(ux,uz)<.1){ux=Math.random()-.5;uz=Math.random()-.5}const m=Math.hypot(ux,uz)||1,v=e.userData.boss?15:40;e.userData.fly={vx:ux/m*v,vz:uz/m*v,t:1.1,d:1.1}})}}})}
function sandstorm(c){const t=tgt(c,14,7),RAD=9,g=new THREE.Group();g.add(disc(RAD,0xe0b870,.25));
  for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(2.4,3,.2),new THREE.MeshBasicMaterial({color:0xe0b870,transparent:true,opacity:.3}));m.userData.an=i*.785;g.add(m)}
  g.position.set(t.x,0,t.z);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const el=6-z.t;g.children.forEach((m,i)=>{if(i){const an=m.userData.an+el*2.2;m.position.set(Math.sin(an)*RAD*.7,1.5,Math.cos(an)*RAD*.7);m.rotation.y=an}});
    for(const e of E)if(Math.hypot(e.position.x-t.x,e.position.z-t.z)<RAD+e.userData.rad){e.userData.slow=.4;if(!(e.userData.blind>0))e.userData.ba=(Math.random()-.5)*5;e.userData.blind=.5}
    if(z.k<=0){z.k=.4;for(let j=E.length-1;j>=0;j--){const e=E[j];if(Math.hypot(e.position.x-t.x,e.position.z-t.z)<RAD+e.userData.rad)hitE(j,.8+S.dm*.4+e.userData.hp*.02)}}}})}
function magnet(c){c.inv=Math.max(c.inv,2);const t=tgt(c,14,7),RAD=10,g=new THREE.Group(),core=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0x8a3dd4})),rg=new THREE.Mesh(new THREE.TorusGeometry(2.4,.15,8,32),new THREE.MeshBasicMaterial({color:0xff4a4a}));
  core.position.y=2;rg.position.y=2;g.add(core);g.add(rg);g.add(disc(RAD,0x8a3dd4,.15));g.position.set(t.x,0,t.z);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,end(){flash(t,6,0xff4a4a);burst(new THREE.Vector3(t.x,1,t.z),0xff4a4a);inR(t,6,14+S.dm*3,3)},
    run(z,dt){rg.rotation.x+=dt*5;rg.rotation.y+=dt*3;for(const e of E){const ex=t.x-e.position.x,ez=t.z-e.position.z,d=Math.hypot(ex,ez);if(d<RAD+e.userData.rad){e.userData.hold=.12;const k=e.userData.boss?.35:1,st=Math.min(d,(2+(1-d/RAD)*6)*k*dt);if(d>.8){e.position.x+=ex/d*st;e.position.z+=ez/d*st}}}
      if(z.k<=0){z.k=.5;inR(t,3,1+S.dm*.4,0)}}})}
function cone(p,a,len,w,d){for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z;if(Math.hypot(ex,ez)<len+e.userData.rad&&adf(ex,ez,a)<w&&hv(p,e))hitE(j,d)}}
function breathe(c){const p=c.g.position,a=c.g.rotation.y;slash(p,a,5,0xff6a1a,.6);cone(p,a,5,.7,1.5+S.dm*.6)}
function thorn(c){const p=c.g.position,a=c.g.rotation.y;shootX(p.x,p.z,a,0x9acb4a,{pierce:1,hs:new Set(),hr:.4,l:.9,d:S.dm+1.2,v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(32)})}
function gun(c){const p=c.g.position,a=c.g.rotation.y+(Math.random()-.5)*.18;shootX(p.x,p.z,a,0xffd060,{d:.8+S.dm*.5,l:1})}
function cannon(c){const p=c.g.position,a=c.g.rotation.y;shootX(p.x,p.z,a,0x99aabb,{aoe:1,ar:3.2,hr:.7,d:4+S.dm*1.3,l:1.2,v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(22)})}
function transform(c){const r=c.r;c.tf=6;c.tk=Math.random()<.5?'bear':'wolf';c.g.scale.setScalar(r==ROLES.dragon?2.2:r==ROLES.mecha?2.4:(c.tk=='bear'?2:1.3));c.hp=Math.min(c.max,c.hp+c.max*.4);hud();flash(c.g.position,4,r.col);burst(c.g.position,r.col)}
function tfAtk(c){const r=c.r,p=c.g.position,a=c.g.rotation.y;
  if(r==ROLES.dragon){slash(p,a,12,0xff6a1a,.8);cone(p,a,12,.9,6+S.dm*1.5)}
  else if(r==ROLES.mecha){for(const k of [-.1,.1])shootX(p.x,p.z,a+k,0xffa030,{aoe:1,ar:3.5,hr:.9,d:5+S.dm*1.2,l:1.3})}
  else if(c.tk=='bear'){flash(p,4,0x8a5a2a);inR(p,4,4+S.dm,1.6)}
  else{slash(p,a,3,0xdddddd,.7);cone(p,a,3,.8,2.5+S.dm)}
  c.cd=r.trate*S.rm}
function boom(c){const p=c.g.position,a=c.g.rotation.y,ux=Math.sin(a),uz=Math.cos(a),m=new THREE.Mesh(new THREE.TorusGeometry(.6,.18,6,12),new THREE.MeshBasicMaterial({color:0xcfd8e8})),h1=new Set(),h2=new Set(),sx=p.x,sz=p.z;m.rotation.x=Math.PI/2;scene.add(m);
  Z.push({c:null,t:1.1,k:9,m,run(z,dt){const el=1.1-z.t;let x,zz,hs;if(el<.55){const u=el/.55;x=sx+ux*10*u;zz=sz+uz*10*u;hs=h1}else{const u=Math.min(1,(el-.55)/.55);x=(sx+ux*10)*(1-u)+p.x*u;zz=(sz+uz*10)*(1-u)+p.z*u;hs=h2}
    m.position.set(x,1.4,zz);m.rotation.z+=dt*20;
    for(let j=E.length-1;j>=0;j--){const e=E[j];if(!hs.has(e)&&Math.hypot(e.position.x-x,e.position.z-zz)<1.3+e.userData.rad){hs.add(e);hitE(j,2+S.dm)}}}})}
function blades(c){const g=new THREE.Group(),bs=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.7,.2,6,12),new THREE.MeshBasicMaterial({color:0xcfd8e8}));m.rotation.x=Math.PI/2;g.add(m);bs.push({m,vx:0,vz:0})}scene.add(g);let ln=0;
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const el=6-z.t,p=c.g.position;
    bs.forEach((b,i)=>{if(el<3){const an=el*6+i*1.5708;b.m.position.set(p.x+Math.sin(an)*3.5,1.4,p.z+Math.cos(an)*3.5)}
      else{if(!ln){const dx=b.m.position.x-p.x,dz=b.m.position.z-p.z,d=Math.hypot(dx,dz)||1;b.vx=dx/d*14;b.vz=dz/d*14}
        b.m.position.x+=b.vx*dt;b.m.position.z+=b.vz*dt;const l=Math.hypot(b.m.position.x,b.m.position.z);if(l>R-1){const nx=b.m.position.x/l,nz=b.m.position.z/l,dp=b.vx*nx+b.vz*nz;if(dp>0){b.vx-=2*dp*nx;b.vz-=2*dp*nz}}}
      b.m.rotation.z+=dt*20});
    if(el>=3)ln=1;
    if(z.k<=0){z.k=.25;bs.forEach(b=>inR(b.m.position,1.7,2.5+S.dm*.8,0))}}})}
function joke(c){const p=c.g.position,a=c.g.rotation.y,t=tgt(c,14,6),i=Math.random()*6|0;
  if(i==0)shootX(p.x,p.z,a,0xff6a1a,{aoe:1,ar:2.5,hr:.6,d:2+S.dm});
  else if(i==1)shootX(p.x,p.z,a,0x9fe8ff,{slow:1,d:S.dm+2});
  else if(i==2){const h=C.filter(o=>o.alive).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(h){h.hp=Math.min(h.max,h.hp+10);flash(h.g.position,2,0x66ff99);hud()}}
  else if(i==3)strike(t.x,t.z);
  else if(i==4){flash(t,3.2,0xff7ab8);inR(t,3.2,4+S.dm,2)}
  else{flash(p,5,0xff7ab8);inR(p,5,.5+S.dm*.3,3.5)}}
function roulette(c){const N=['Météore','Trou noir','Soin total','Tempête','Séisme','Golem','Rien...'],i=Math.random()*7|0;banner('Joker : '+N[i]);
  [()=>meteorFall(c),()=>hole(c,tgt(c,14,6),true),()=>{C.forEach(o=>{if(o.alive)o.hp=o.max});hud()},()=>storm(c),()=>quake(c),()=>golem(c),()=>{flash(c.g.position,3,0xff7ab8);burst(c.g.position,0xff7ab8)}][i]()}
function navy(c){const t=tgt(c,16,10),ang=Math.atan2(t.x,t.z),g=new THREE.Group(),hull=new THREE.Mesh(new THREE.BoxGeometry(5,1.6,12),new THREE.MeshStandardMaterial({color:0x5a3a1a})),mast=new THREE.Mesh(new THREE.BoxGeometry(.3,7,.3),new THREE.MeshStandardMaterial({color:0x3a2610})),sail=new THREE.Mesh(new THREE.BoxGeometry(4,4,.1),new THREE.MeshBasicMaterial({color:0xeeeeee}));
  hull.position.y=.8;mast.position.y=4;sail.position.y=5;g.add(hull);g.add(mast);g.add(sail);g.position.set(Math.sin(ang)*(R+5),0,Math.cos(ang)*(R+5));g.rotation.y=ang+Math.PI/2;scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){g.position.y=Math.sin(z.t*3)*.25;if(z.k<=0){z.k=.3;const aa=ang+(Math.random()-.5)*1.3,r=R*(.2+Math.random()*.7),x=Math.sin(aa)*r,zz=Math.cos(aa)*r;flash({x,z:zz},3,0xffa030);burst(new THREE.Vector3(x,.5,zz),0xffa030);inR({x,z:zz},3,4+S.dm*1.2,1.5)}}})}
function cage(c){let best=null;for(const e of E){if(!best||(e.userData.boss&&!best.userData.boss)||(!!e.userData.boss==!!best.userData.boss&&e.userData.hp>best.userData.hp))best=e}if(!best)return;
  const e=best,m=new THREE.Mesh(new THREE.BoxGeometry(e.userData.rad*2.6,3,e.userData.rad*2.6),new THREE.MeshBasicMaterial({color:0xdddddd,wireframe:true}));scene.add(m);
  Z.push({c:null,t:6,k:0,m,end(){const j=E.indexOf(e);if(j>=0){flash(e.position,3,0xdddddd);hitE(j,15+S.dm*3)}},
    run(z,dt){const j=E.indexOf(e);if(j<0){z.t=0;return}e.userData.hold=.15;e.userData.slow=0;m.position.set(e.position.x,1.5,e.position.z);if(z.k<=0){z.k=.5;hitE(j,4+S.dm*1.2)}}})}
function holyRay(c){const p=c.g.position,a=c.g.rotation.y,ux=Math.sin(a),uz=Math.cos(a),L=14;
  line({x:p.x,z:p.z},{x:p.x+ux*L,z:p.z+uz*L},0xfff2b0,1.5,.12);
  for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z,f=ex*ux+ez*uz,s=Math.abs(ex*uz-ez*ux);if(f>0&&f<L&&s<1+e.userData.rad)hitE(j,1.5+S.dm*.6)}
  let h=0;C.forEach(o=>{if(o==c||!o.alive)return;const ex=o.g.position.x-p.x,ez=o.g.position.z-p.z,f=ex*ux+ez*uz,s=Math.abs(ex*uz-ez*ux);if(f>0&&f<L&&s<1.6&&o.hp<o.max){o.hp=Math.min(o.max,o.hp+4);h=1}});if(h)hud()}
function sanctuary(c){const d=C.find(o=>!o.alive);
  if(d){d.alive=true;d.hp=d.max*.7;d.g.visible=true;d.g.position.set(c.g.position.x+2,0,c.g.position.z);d.inv=1.5;flash(d.g.position,3,0xfff2b0);burst(d.g.position,0xfff2b0)}
  aura(c,6,0xfff2b0,.5,q=>{C.forEach(o=>{if(o.alive&&Math.hypot(o.g.position.x-q.x,o.g.position.z-q.z)<6)o.hp=Math.min(o.max,o.hp+o.max*.05)});inR(q,6,2+S.dm*.5,0);hud()});hud()}
function arrow(c){const a=c.g.rotation.y;shootX(c.g.position.x,c.g.position.z,a,0xe0c070,{pierce:1,hs:new Set(),hr:.6,l:1.6,d:S.dm+2,v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(42)})}
function rain(c){const t=tgt(c,16,8),RAD=8,g=new THREE.Group();g.add(disc(RAD,0xe0c070,.18));g.position.set(t.x,0,t.z);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){if(z.k<=0){z.k=.12;for(let i=0;i<2;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*RAD,x=t.x+Math.sin(a)*r,zz=t.z+Math.cos(a)*r;
    const b=new THREE.Mesh(new THREE.BoxGeometry(.12,6,.12),new THREE.MeshBasicMaterial({color:0xffe9a0,transparent:true}));b.position.set(x,3,zz);b.userData={v:new THREE.Vector3(),l:.15,ring:1};scene.add(b);F.push(b);inR({x,z:zz},2.6,3+S.dm*.8,0)}}}})}
function blink(c){const p=c.g.position,q=near(c==A?aim:p,E);if(!q.o)return;const e=q.o,ex=e.position.x-p.x,ez=e.position.z-p.z,d=Math.hypot(ex,ez);if(d>16||d<.1)return;
  const ux=ex/d,uz=ez/d,ox=p.x,oz=p.z;p.x=e.position.x+ux*(e.userData.rad+1.2);p.z=e.position.z+uz*(e.userData.rad+1.2);
  const pl=Math.hypot(p.x,p.z);if(pl>R-1){p.x*=(R-1)/pl;p.z*=(R-1)/pl}
  c.g.rotation.y=Math.atan2(-ux,-uz);c.inv=Math.max(c.inv,.3);line({x:ox,z:oz},{x:p.x,z:p.z},0x8a5cff,1.2,.25);slash(p,c.g.rotation.y,3.4,0x8a5cff,1.2);
  for(let j=E.length-1;j>=0;j--){const f=E[j],fx=f.position.x-p.x,fz=f.position.z-p.z;if(Math.hypot(fx,fz)<3+f.userData.rad&&adf(fx,fz,c.g.rotation.y)<1.3)hitE(j,3+S.dm*1.2)}}
function ally(c,col,sc,life,spd,dmg,every){const g=human(col),p=c.g.position;g.scale.setScalar(sc);g.position.set(p.x+(Math.random()-.5)*3,0,p.z+(Math.random()-.5)*3);scene.add(g);let tt=0;
  Z.push({c:null,t:life,k:0,m:g,run(z,dt){const q=near(g.position,E);tt+=dt*10;g.userData.legs[0].rotation.x=Math.sin(tt)*.7;g.userData.legs[1].rotation.x=-Math.sin(tt)*.7;
    if(q.o){const dx=q.o.position.x-g.position.x,dz=q.o.position.z-g.position.z,d=Math.hypot(dx,dz)||1;g.rotation.y=Math.atan2(dx,dz);
      if(d>1.5+q.o.userData.rad){g.position.x+=dx/d*spd*dt;g.position.z+=dz/d*spd*dt}else if(z.k<=0){z.k=every;slash(g.position,g.rotation.y,2.6,col,1.2);const j=E.indexOf(q.o);if(j>=0)hitE(j,dmg)}}}})}
function clones(c){for(let i=0;i<3;i++)ally(c,0x8a5cff,.95,6,10,2+S.dm*.8,.3)}
function iaido(c){const p=c.g.position,segs=[],g=new THREE.Group(),used=new Set();let cx=p.x,cz=p.z;
  for(let i=0;i<5;i++){const q=near({x:cx,z:cz},E.filter(e=>!used.has(e)));if(!q.o||q.d>20)break;used.add(q.o);
    const ex=q.o.position.x-cx,ez=q.o.position.z-cz,d=Math.hypot(ex,ez)||1;let nx=cx+ex/d*(d+2.5),nz=cz+ez/d*(d+2.5);const pl=Math.hypot(nx,nz);if(pl>R-1){nx*=(R-1)/pl;nz*=(R-1)/pl}
    segs.push({ax:cx,az:cz,bx:nx,bz:nz});cx=nx;cz=nz}
  if(!segs.length)return;
  segs.forEach(s=>{const len=Math.hypot(s.bx-s.ax,s.bz-s.az)||.1,m=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,len),new THREE.MeshBasicMaterial({color:0xffffff}));m.position.set((s.ax+s.bx)/2,1.3,(s.az+s.bz)/2);m.rotation.y=Math.atan2(s.bx-s.ax,s.bz-s.az);g.add(m);flash({x:s.bx,z:s.bz},1.5,0xffffff)});
  p.x=cx;p.z=cz;c.inv=.6;scene.add(g);
  Z.push({c:null,t:5.5,k:0,m:g,end(){segs.forEach(s=>{const vx=s.bx-s.ax,vz=s.bz-s.az,len=Math.hypot(vx,vz)||1;for(let j=E.length-1;j>=0;j--){const e=E[j],t=Math.max(0,Math.min(1,((e.position.x-s.ax)*vx+(e.position.z-s.az)*vz)/(len*len))),d=Math.hypot(e.position.x-(s.ax+vx*t),e.position.z-(s.az+vz*t));if(d<2+e.userData.rad){flash(e.position,1.6,0xffffff);hitE(j,9+S.dm*2)}}})},
    run(z,dt){g.children.forEach(m=>m.material.color.setHex(z.t<.6&&Math.sin(z.t*60)>0?0xff3b3b:0xffffff))}})}
function shootX(x,z,a,col,o){const m=new THREE.Mesh(bGeo,new THREE.MeshBasicMaterial({color:col}));m.position.set(x,(o&&o.y!=null?o.y:CY+1.5),z);m.userData=Object.assign({v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(30),l:1.2,d:S.dm+1},o);scene.add(m);B.push(m)}
function tgt(c,md,def){const p=c.g.position,q=near(p,E),t=(c==A)?aim:(q.o?q.o.position:null);let x=t?t.x:p.x+Math.sin(c.g.rotation.y)*def,z=t?t.z:p.z+Math.cos(c.g.rotation.y)*def;const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d>md){x=p.x+dx/d*md;z=p.z+dz/d*md}return{x,z}}
function disc(rad,col,op){const m=new THREE.Mesh(new THREE.CircleGeometry(rad,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.08;return m}
function line(a,b,col,h,l){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||.1,m=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,len),new THREE.MeshBasicMaterial({color:col,transparent:true}));m.position.set((a.x+b.x)/2,h,(a.z+b.z)/2);m.rotation.y=Math.atan2(dx,dz);m.userData={v:new THREE.Vector3(),l:l,ring:1};scene.add(m);F.push(m)}
function blizzard(c){const t=tgt(c,15,7),RAD=8,g=new THREE.Group(),zn=disc(RAD,0x9fe8ff,.3),sp=[];g.add(zn);g.position.set(t.x,0,t.z);
  for(let i=0;i<9;i++){const a=Math.random()*6.283,r=Math.random()*RAD*.9,s=new THREE.Mesh(new THREE.ConeGeometry(.6,3,5),new THREE.MeshBasicMaterial({color:0xcff4ff}));s.position.set(Math.sin(a)*r,1.5,Math.cos(a)*r);s.scale.y=.01;g.add(s);sp.push(s)}
  scene.add(g);let fr=0;
  Z.push({c:null,t:6,k:0,m:g,end(){for(let j=E.length-1;j>=0;j--){const e=E[j];if(Math.hypot(e.position.x-t.x,e.position.z-t.z)<RAD+e.userData.rad){flash(e.position,1.8,0x9fe8ff);hitE(j,14+S.dm*2)}}},
    run(z,dt){const el=6-z.t;sp.forEach(s=>s.scale.y=Math.max(.01,Math.min(1,el/.8)));zn.material.opacity=.25+.1*Math.sin(el*6);
      for(const e of E){if(Math.hypot(e.position.x-t.x,e.position.z-t.z)<RAD+e.userData.rad){if(el<4.5)e.userData.slow=.5;else if(!fr){e.userData.hold=1.6;e.material.emissive.setHex(0x66ccff)}}}
      if(el>=4.5)fr=1;
      if(z.k<=0&&el<4.5){z.k=.5;inR(t,RAD,1+S.dm*.4,0)}}})}
function field(c){const p=c.g.position,a=c.g.rotation.y;slash(p,a,7,0xf5f06a,.9);
  for(let i=0;i<3;i++){const b=a+(Math.random()-.5)*1.5,l=3+Math.random()*3.5;line({x:p.x,z:p.z},{x:p.x+Math.sin(b)*l,z:p.z+Math.cos(b)*l},0xffffff,1.3,.12)}
  for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z;if(Math.hypot(ex,ez)<7+e.userData.rad&&adf(ex,ez,a)<1.1&&hv(p,e)){e.userData.slow=1.5;hitE(j,2.5+S.dm)}}}
function chain(c){const p=c.g.position,q=near(c==A?aim:p,E);if(!q.o||Math.hypot(q.o.position.x-p.x,q.o.position.z-p.z)>18)return;
  let cur=q.o,prev={x:p.x,z:p.z};const done=new Set();
  for(let i=0;i<5&&cur;i++){done.add(cur);const cp={x:cur.position.x,z:cur.position.z};line(prev,cp,0xf5f06a,1.4,.15);
    let nx=null,nd=7;for(const e of E){if(done.has(e))continue;const d=Math.hypot(e.position.x-cp.x,e.position.z-cp.z);if(d<nd){nd=d;nx=e}}
    const j=E.indexOf(cur);if(j>=0)hitE(j,2+S.dm);prev=cp;cur=nx}}
function strike(x,z){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,30,.5),new THREE.MeshBasicMaterial({color:0xf5f06a,transparent:true}));b.position.set(x,15,z);b.userData={v:new THREE.Vector3(),l:.2,ring:1};scene.add(b);F.push(b);flash({x,z},2.6,0xf5f06a);inR({x,z},2.6,6+S.dm*1.5,0)}
function storm(c){const g=new THREE.Group();scene.add(g);Z.push({c:null,t:6,k:0,m:g,run(z,dt){if(z.k<=0){z.k=.25;const e=E[Math.random()*E.length|0];if(e)strike(e.position.x,e.position.z);else{const a=Math.random()*6.283,r=Math.random()*R;strike(Math.sin(a)*r,Math.cos(a)*r)}}}})}
function skel(c,force){if(!force&&Z.filter(z=>z.mn).length>=8)return;const g=human(0xe8dcb0),p=c.g.position;g.scale.setScalar(.6);g.position.set(p.x+(Math.random()-.5)*3,0,p.z+(Math.random()-.5)*3);scene.add(g);let tt=0;
  Z.push({c:null,mn:1,t:10,k:0,m:g,run(z,dt){const q=near(g.position,E);tt+=dt*10;g.userData.legs[0].rotation.x=Math.sin(tt)*.7;g.userData.legs[1].rotation.x=-Math.sin(tt)*.7;
    if(q.o){const dx=q.o.position.x-g.position.x,dz=q.o.position.z-g.position.z,d=Math.hypot(dx,dz)||1;g.rotation.y=Math.atan2(dx,dz);
      if(d>1.4+q.o.userData.rad){g.position.x+=dx/d*6*dt;g.position.z+=dz/d*6*dt}else if(z.k<=0){z.k=.5;const j=E.indexOf(q.o);if(j>=0)hitE(j,1+S.dm*.5)}}}})}
function golem(c){const g=human(0x6a6a7a),p=c.g.position;g.scale.setScalar(3);g.position.set(p.x,0,p.z);scene.add(g);let tt=0;
  for(let i=0;i<4;i++)skel(c,true);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const q=near(g.position,E);tt+=dt*6;g.userData.legs[0].rotation.x=Math.sin(tt)*.6;g.userData.legs[1].rotation.x=-Math.sin(tt)*.6;
    if(q.o){const dx=q.o.position.x-g.position.x,dz=q.o.position.z-g.position.z,d=Math.hypot(dx,dz)||1;g.rotation.y=Math.atan2(dx,dz);if(d>2.5){g.position.x+=dx/d*4.5*dt;g.position.z+=dz/d*4.5*dt}}
    if(z.k<=0){z.k=.4;inR(g.position,4.5,3+S.dm,.9);flash(g.position,4.5,0x6a6a7a)}}})}
function barrier(c){const p=c.g.position,cx=p.x,cz=p.z,RAD=6,g=new THREE.Group(),sp=new THREE.Mesh(new THREE.SphereGeometry(RAD,24,16),new THREE.MeshBasicMaterial({color:0x6a8aff,transparent:true,opacity:.18,side:THREE.DoubleSide}));
  g.add(sp);g.add(disc(RAD,0x6a8aff,.25));g.position.set(cx,0,cz);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){
    for(const o of C)if(o.alive&&Math.hypot(o.g.position.x-cx,o.g.position.z-cz)<RAD){o.inv=Math.max(o.inv,.2);if(z.k<=0)o.hp=Math.min(o.max,o.hp+o.max*.03)}
    if(z.k<=0){z.k=.5;hud()}
    for(const e of E){const ex=e.position.x-cx,ez=e.position.z-cz,d=Math.hypot(ex,ez)||.1,m=RAD+e.userData.rad;if(d<m){e.position.x=cx+ex/d*m;e.position.z=cz+ez/d*m}}}})}
function turrets(c){const p=c.g.position,g=new THREE.Group(),ts=[],ms=[],bm=new THREE.MeshStandardMaterial({color:0xb8651b});
  for(let i=0;i<3;i++){const a=i/3*6.283,t=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(1,.7,1),bm),gun=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,1.4),new THREE.MeshStandardMaterial({color:0x444455}));
    gun.position.set(0,.9,.7);b.position.y=.35;t.add(b);t.add(gun);t.position.set(p.x+Math.sin(a)*2.5,0,p.z+Math.cos(a)*2.5);g.add(t);ts.push({m:t,cd:0})}
  const tg=tgt(c,12,7);
  for(let i=0;i<5;i++){const a=Math.random()*6.283,r=Math.random()*4,m=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.15,10),new THREE.MeshBasicMaterial({color:0xff3a3a}));m.position.set(tg.x+Math.sin(a)*r,.08,tg.z+Math.cos(a)*r);g.add(m);ms.push({m,on:1})}
  scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){
    ts.forEach(t=>{t.cd-=dt;const q=near(t.m.position,E);if(q.o&&q.d<18){t.m.rotation.y=Math.atan2(q.o.position.x-t.m.position.x,q.o.position.z-t.m.position.z);if(t.cd<=0){t.cd=.3;shootX(t.m.position.x,t.m.position.z,t.m.rotation.y,0xffc060,{y:1.5})}}});
    ms.forEach(mn=>{if(!mn.on)return;for(const e of E){if(Math.hypot(e.position.x-mn.m.position.x,e.position.z-mn.m.position.z)<1.7+e.userData.rad){mn.on=0;g.remove(mn.m);const q={x:mn.m.position.x,z:mn.m.position.z};flash(q,3.2,0xff6a3a);burst(new THREE.Vector3(q.x,.5,q.z),0xff6a3a);inR(q,3.2,8+S.dm*2,2);break}}})}})}
function puddle(x,z,rad,dur,dmg,col){const m=disc(rad,col||0xd048c8,.4);m.position.set(x,.08,z);scene.add(m);Z.push({c:null,t:dur,k:0,m,run(z2,dt){if(z2.k<=0){z2.k=.4;inR({x,z},rad,dmg,0)}}})}
function vial(c,t){const p=c.g.position;let tx=t?t.x:p.x+Math.sin(c.g.rotation.y)*8,tz=t?t.z:p.z+Math.cos(c.g.rotation.y)*8;const dx=tx-p.x,dz=tz-p.z,dl=Math.hypot(dx,dz);if(dl>16){tx=p.x+dx/dl*16;tz=p.z+dz/dl*16}
  const sx=p.x,sz=p.z,m=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),new THREE.MeshBasicMaterial({color:0xd048c8}));scene.add(m);
  Z.push({c:null,t:.6,k:9,m,end(){puddle(tx,tz,2.8,4,1+S.dm*.4)},run(z,dt){const u=Math.min(1,1-z.t/.6);m.position.set(sx+(tx-sx)*u,1.6+Math.sin(Math.PI*u)*4,sz+(tz-sz)*u)}})}
function cloud(c){const t=tgt(c,12,6),RAD=6,g=new THREE.Group();g.add(disc(RAD,0xd048c8,.3));
  for(let i=0;i<7;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(1.8,10,8),new THREE.MeshBasicMaterial({color:0xb040b0,transparent:true,opacity:.35}));s.position.set((Math.random()-.5)*RAD,1.2+Math.random(),(Math.random()-.5)*RAD);g.add(s)}
  g.position.set(t.x,0,t.z);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const q=near(g.position,E);if(q.o){const dx=q.o.position.x-g.position.x,dz=q.o.position.z-g.position.z,d=Math.hypot(dx,dz)||1;if(d>1){g.position.x+=dx/d*3.5*dt;g.position.z+=dz/d*3.5*dt}}
    if(z.k<=0){z.k=.4;for(const e of E)if(Math.hypot(e.position.x-g.position.x,e.position.z-g.position.z)<RAD+e.userData.rad)e.userData.slow=1.2;inR(g.position,RAD,2+S.dm*.6,0)}}})}
function plantGrab(c){
  const p=c.g.position,q=near(p,E),t=(c==A)?aim:(q.o?q.o.position:null);
  let cx=t?t.x:p.x+Math.sin(c.g.rotation.y)*8,cz=t?t.z:p.z+Math.cos(c.g.rotation.y)*8;
  const dx=cx-p.x,dz=cz-p.z,dl=Math.hypot(dx,dz);if(dl>16){cx=p.x+dx/dl*16;cz=p.z+dz/dl*16}
  const RAD=7,g=new THREE.Group(),gm=new THREE.MeshStandardMaterial({color:0x2fa84f}),
    zone=new THREE.Mesh(new THREE.TorusGeometry(RAD,.18,8,48),new THREE.MeshBasicMaterial({color:0x3fd96b,transparent:true,opacity:.7})),
    sg=new THREE.CylinderGeometry(.35,.6,1,8),stem=new THREE.Mesh(sg,gm),head=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshStandardMaterial({color:0xd94f8a}));
  sg.translate(0,.5,0);zone.rotation.x=Math.PI/2;zone.position.y=.1;
  for(let i=0;i<6;i++){const a=i/6*6.283,pt=new THREE.Mesh(new THREE.ConeGeometry(.7,2.2,6),gm);pt.position.set(Math.sin(a)*1.6,.3,Math.cos(a)*1.6);head.add(pt)}
  g.add(zone);g.add(stem);g.add(head);g.position.set(cx,0,cz);scene.add(g);
  const got=new Set();let launched=0;
  Z.push({c:null,t:6,k:0,m:g,
    end(){got.forEach(e=>{const j=E.indexOf(e);if(j>=0){flash(e.position,2,0x3fd96b);hitE(j,10+S.dm*2)}})},
    run(z,dt){const el=6-z.t;let H=Math.min(1,el/.8)*5;if(el>=4.8)H=5*Math.max(.01,(6-el)/1.2);
      stem.scale.y=Math.max(.01,H);head.position.y=H+1;head.rotation.y+=dt*2;zone.material.opacity=.5+.3*Math.sin(el*10);
      if(el<4.8){
        for(let j=E.length-1;j>=0;j--){const e=E[j],fx=cx-e.position.x,fz=cz-e.position.z,fd=Math.hypot(fx,fz);
          if(el>.5&&(got.has(e)||fd<RAD+e.userData.rad)){got.add(e);e.userData.hold=.12;if(fd>1){const st=Math.min(fd,(e.userData.boss?1:4)*dt);e.position.x+=fx/fd*st;e.position.z+=fz/fd*st}}}
        if(z.k<=0&&el>.5){z.k=.5;got.forEach(e=>{const j=E.indexOf(e);if(j>=0)hitE(j,1+S.dm*.4)})}
      }else if(!launched){launched=1;
        got.forEach(e=>{let ux=e.position.x-cx,uz=e.position.z-cz;const n=Math.hypot(ux,uz);if(n<.1){ux=Math.random()-.5;uz=Math.random()-.5}const m=Math.hypot(ux,uz)||1,v=e.userData.boss?15:45;
          e.userData.fly={vx:ux/m*v,vz:uz/m*v,t:1.1,d:1.1}});
      }}});
}
function stairs(c){
  const p=c.g.position,a=c.g.rotation.y,ux=Math.sin(a),uz=Math.cos(a),sx=p.x,sz=p.z,g=new THREE.Group(),bl=[];
  for(let i=0;i<7;i++){const H=.7+.5*i,geo=new THREE.BoxGeometry(2.2,1,1.6);geo.translate(0,.5,0);
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:i%2?0x7a5a36:0x8b6a40}));
    m.position.set(sx+ux*(2.2+i*1.5),0,sz+uz*(2.2+i*1.5));m.rotation.y=a;m.scale.set(1,.01,1);m.visible=false;g.add(m);bl.push({m,H,on:0})}
  scene.add(g);
  Z.push({c:null,t:1.3,k:9,m:g,run(z,dt){const el=1.3-z.t;
    bl.forEach((b,i)=>{
      if(!b.on&&el>i*.06){b.on=1;b.m.visible=true;
        for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-b.m.position.x,ez=e.position.z-b.m.position.z;
          if(Math.hypot(ex,ez)<1.5+e.userData.rad){const f=e.userData.boss?.3:1;e.userData.hold=.5;e.position.x+=ux*1.2*f;e.position.z+=uz*1.2*f;hitE(j,3+S.dm*.8)}}}
      if(b.on){const grow=Math.min(1,(el-i*.06)/.15),sink=Math.min(1,z.t/.3);b.m.scale.y=Math.max(.01,b.H*grow*sink)}
    })}})}
function quake(c){
  QK=6;const g=new THREE.Group(),p=c.g.position;
  for(let i=0;i<14;i++){const L=6+Math.random()*16,a=Math.random()*6.283,b=new THREE.Mesh(new THREE.BoxGeometry(.35,.05,L),new THREE.MeshBasicMaterial({color:0x2a1c10}));
    b.rotation.y=a;b.position.set(p.x+Math.sin(a)*L/2,.07,p.z+Math.cos(a)*L/2);g.add(b)}
  scene.add(g);flash(p,R,0x8b6a40);
  Z.push({c:null,t:6,k:0,m:g,end(){floor.position.y=0},run(z,dt){floor.position.y=Math.sin(z.t*50)*.12;
    if(z.k<=0){z.k=.5;for(let j=E.length-1;j>=0;j--){const e=E[j];if(!e.userData.boss)e.userData.hold=.55;if(Math.random()<.15)burst(e.position,0x8b6a40);hitE(j,1.5+S.dm*.6)}}}})}
function rock(c,t){const p=c.g.position;let tx=t?t.x:p.x+Math.sin(c.g.rotation.y)*9,tz=t?t.z:p.z+Math.cos(c.g.rotation.y)*9;
  const dx=tx-p.x,dz=tz-p.z,dl=Math.hypot(dx,dz);if(dl>18){tx=p.x+dx/dl*18;tz=p.z+dz/dl*18}
  const sx=p.x,sz=p.z,m=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,0),new THREE.MeshStandardMaterial({color:0x8a7a68}));m.scale.setScalar(1.6);scene.add(m);
  Z.push({c:null,t:.7,k:9,m,end(){const q={x:tx,z:tz};inR(q,3.2,4+S.dm*1.5,1.5);flash(q,3.2,0xb08a5a);burst(new THREE.Vector3(tx,.5,tz),0xb08a5a)},
    run(z,dt){const u=Math.min(1,1-z.t/.7);m.position.set(sx+(tx-sx)*u,1.6+Math.sin(Math.PI*u)*6,sz+(tz-sz)*u);m.rotation.x+=dt*6;m.rotation.y+=dt*4}})}
function meteorFall(c){
  const p=c.g.position,q=near(p,E),t=(c==A)?aim:(q.o?q.o.position:null);
  let tx=t?t.x:p.x+Math.sin(c.g.rotation.y)*10,tz=t?t.z:p.z+Math.cos(c.g.rotation.y)*10;
  const dx=tx-p.x,dz=tz-p.z,dl=Math.hypot(dx,dz);if(dl>18){tx=p.x+dx/dl*18;tz=p.z+dz/dl*18}
  const g=new THREE.Group(),flat=(rad,col,op)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(rad,.2,8,48),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op}));r.rotation.x=Math.PI/2;r.position.y=.1;g.add(r);return r},
    ring=flat(9,0xff3a1a,.6),crater=flat(5.5,0xff7a2a,.8),met=new THREE.Mesh(new THREE.IcosahedronGeometry(3.2,1),new THREE.MeshBasicMaterial({color:0xff7a2a}));
  crater.visible=false;met.position.y=40;g.add(met);g.position.set(tx,0,tz);scene.add(g);
  Z.push({c:null,t:6,k:0,m:g,run(z,dt){const el=6-z.t;
    if(el<1.6){met.position.y=40-37*(el/1.6);met.rotation.x+=dt*3;ring.material.opacity=.45+.3*Math.sin(el*14)}
    else{if(!z.hit){z.hit=1;inR(g.position,9,25+S.dm*3,3);flash(g.position,9,0xff7a2a);burst(g.position,0xff7a2a);burst(g.position,0xffc02a);met.visible=false;ring.visible=false;crater.visible=true}
      if(z.k<=0){z.k=.4;inR(g.position,5.5,2+S.dm*.7,0)}}}})}
function flame(c){const a=c.g.rotation.y+(Math.random()-.5)*.45,m=new THREE.Mesh(bGeo,new THREE.MeshBasicMaterial({color:Math.random()<.5?0xff4a1a:0xffc02a,transparent:true,opacity:.85}));
  m.scale.setScalar(2+Math.random()*1.5);m.position.set(c.g.position.x+Math.sin(a)*.8,c.g.position.y+1.5,c.g.position.z+Math.cos(a)*.8);
  m.userData={v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(14+Math.random()*4),l:.38,d:.6+S.dm*.3,hr:.8,pierce:1,hs:new Set()};scene.add(m);B.push(m)}
function lasso(c){
  const p=c.g.position,q=near(p,E),t=(c==A)?aim:(q.o?q.o.position:null);
  let cx=t?t.x:p.x+Math.sin(c.g.rotation.y)*7,cz=t?t.z:p.z+Math.cos(c.g.rotation.y)*7;
  const dx=cx-p.x,dz=cz-p.z,dl=Math.hypot(dx,dz);if(dl>15){cx=p.x+dx/dl*15;cz=p.z+dz/dl*15}
  const g=new THREE.Group(),fm=new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.9}),
    ring=new THREE.Mesh(new THREE.TorusGeometry(1,.14,8,48),fm),rope=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,1),fm);
  ring.rotation.x=Math.PI/2;g.add(ring);g.add(rope);g.position.set(cx,.6,cz);scene.add(g);
  Z.push({c,t:6,k:0,m:g,end(){inR(g.position,4,10+S.dm*2,0);flash(g.position,4,0xff6a1a);burst(g.position,0xff9a1a)},
    run(z,dt){const r=2.2+5.3*(z.t/6),h=c.g.position,ex=h.x-cx,ez=h.z-cz,d=Math.hypot(ex,ez)||1;
      ring.scale.setScalar(r);rope.position.set(ex/2,.8,ez/2);rope.rotation.y=Math.atan2(ex,ez);rope.scale.z=d;
      const burn=z.k<=0;if(burn)z.k=.3;
      for(let j=E.length-1;j>=0;j--){const e=E[j],fx=cx-e.position.x,fz=cz-e.position.z,fd=Math.hypot(fx,fz);
        if(fd<r+e.userData.rad){e.userData.hold=.12;if(fd>.4){const st=Math.min(fd,(e.userData.boss?1.5:6)*dt);e.position.x+=fx/fd*st;e.position.z+=fz/fd*st}if(burn)hitE(j,1.2+S.dm*.5)}}}});
}
const adf=(x,z,a)=>{let d=Math.atan2(x,z)-a;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;return Math.abs(d)};
function slash(p,a,len,col,w){const m=new THREE.Mesh(new THREE.RingGeometry(len*.45,len,28,1,-Math.PI/2-w,w*2),new THREE.MeshBasicMaterial({color:col,transparent:true,side:THREE.DoubleSide}));
  m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,a,0);m.position.set(p.x,1.3,p.z);m.userData={v:new THREE.Vector3(),l:.25,ring:1};scene.add(m);F.push(m)}
function whirl(c){const g=new THREE.Group(),mt=new THREE.MeshBasicMaterial({color:0xffc080});
  [3.3,-3.3].forEach(z=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,6.4),mt);b.position.z=z;g.add(b)});scene.add(g);
  Z.push({c,t:6,k:0,m:g,run(z,dt){const p=c.g.position;g.position.set(p.x,1.4,p.z);g.rotation.y+=dt*9;if(z.k<=0){z.k=.2;inR(p,6.4,1+S.dm*.5,.8)}}})}
function hole(c,t,big){
  const p=c.g.position;let hx=t?t.x:p.x+Math.sin(c.g.rotation.y)*8,hz=t?t.z:p.z+Math.cos(c.g.rotation.y)*8;
  const dx=hx-p.x,dz=hz-p.z,dl=Math.hypot(dx,dz);if(dl>16){hx=p.x+dx/dl*16;hz=p.z+dz/dl*16}
  const rad=big?9:5.5,dur=big?6:2.5,sc=big?2.4:1.6;
  const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:0x000000})),rg=new THREE.Mesh(new THREE.TorusGeometry(1.5,.12,8,32),new THREE.MeshBasicMaterial({color:0x8a5cff}));
  rg.rotation.x=Math.PI/2;m.add(rg);m.position.set(hx,1.4,hz);m.scale.setScalar(sc);scene.add(m);
  Z.push({c:null,t:dur,k:0,m,end(){inR(m.position,rad*1.15,big?30+S.dm*3:14+S.dm*2,0);flash(m.position,rad*1.15,0x8a5cff);burst(m.position,0x8a5cff)},
    run(z,dt){m.rotation.y+=dt*6;rg.rotation.z+=dt*8;m.scale.setScalar(sc*(1+.08*Math.sin(z.t*12)));
      for(const e of E){const ex=m.position.x-e.position.x,ez=m.position.z-e.position.z,d=Math.hypot(ex,ez);
        if(d<rad*1.8){e.userData.hold=.12;const st=Math.min(d,(e.userData.boss?3:8)*dt);if(d>.3){e.position.x+=ex/d*st;e.position.z+=ez/d*st}}}}});
}
function inR(p,r,d,kb){for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z,dd=Math.hypot(ex,ez)||1;if(dd<r+e.userData.rad&&hv(p,e)){if(kb){e.position.x+=ex/dd*kb;e.position.z+=ez/dd*kb}hitE(j,d)}}}
function aura(c,rad,col,every,fn){const m=new THREE.Mesh(new THREE.TorusGeometry(rad,.15,8,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7}));m.rotation.x=Math.PI/2;scene.add(m);
  Z.push({c,t:6,k:0,m,run(z,dt){const p=c.g.position;m.position.set(p.x,.4,p.z);if(z.k<=0){z.k=every;fn(p)}}})}
function special(c){
  const p=c.g.position,a=c.g.rotation.y,dx=Math.sin(a),dz=Math.cos(a),r=c.r;
  if(r==ROLES.miroir){if(LS){c.r=LS;special(c);c.r=ROLES.miroir}return}if(!r.trate)LS=r;
  if(r==ROLES.neant){const q=near(p,E);hole(c,q.o?q.o.position:null,true);return}
  if(r==ROLES.pyro){lasso(c);return}
  if(r==ROLES.meteor){meteorFall(c);return}
  if(r==ROLES.terre){quake(c);return}
  if(r==ROLES.plant){plantGrab(c);return}
  if(r==ROLES.givre){blizzard(c);return}if(r==ROLES.volt){storm(c);return}if(r==ROLES.necro){golem(c);return}
  if(r==ROLES.gardien){barrier(c);return}if(r==ROLES.ingenieur){turrets(c);return}if(r==ROLES.toxine){cloud(c);return}
  if(r==ROLES.archer){rain(c);return}if(r==ROLES.ombre){clones(c);return}if(r==ROLES.samourai){iaido(c);return}if(r==ROLES.paladin){sanctuary(c);return}
  if(r.trate){transform(c);return}if(r==ROLES.boomerang){blades(c);return}if(r==ROLES.joker){roulette(c);return}if(r==ROLES.pirate){navy(c);return}if(r==ROLES.chasseur){cage(c);return}
  if(r==ROLES.maree){tsunami(c);return}if(r==ROLES.vent){tornado(c);return}if(r==ROLES.sable){sandstorm(c);return}if(r==ROLES.magnet){magnet(c);return}
  if(r==ROLES.tireur){
    const L=40,m=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,L),new THREE.MeshBasicMaterial({color:0x99ffff,transparent:true}));
    m.position.set(p.x+dx*L/2,1.5,p.z+dz*L/2);m.rotation.y=a;scene.add(m);Z.push({c,t:6,k:0,m,run(z,dt){const q=c.g.position,a2=c.g.rotation.y,ux=Math.sin(a2),uz=Math.cos(a2);m.position.set(q.x+ux*20,1.5,q.z+uz*20);m.rotation.y=a2;m.material.opacity=.45+.2*Math.sin(z.t*20);if(z.k<=0){z.k=.3;for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-q.x,ez=e.position.z-q.z,f=ex*ux+ez*uz,s=Math.abs(ex*uz-ez*ux);if(f>0&&s<1.5+e.userData.rad)hitE(j,1.5+S.dm*.5)}}}});
    for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z,f=ex*dx+ez*dz,s=Math.abs(ex*dz-ez*dx);
      if(f>0&&s<1.5+e.userData.rad)hitE(j,8+S.dm*2)}
  }else if(r==ROLES.mage){
    const m=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0x5aa0ff,transparent:true,opacity:.8}));
    m.position.set(p.x,1.8,p.z);m.scale.setScalar(1.4);scene.add(m);const v=new THREE.Vector3(dx,0,dz).multiplyScalar(4.5);Z.push({c:null,t:6,k:0,m,run(z,dt){m.position.addScaledVector(v,dt);const l=Math.hypot(m.position.x,m.position.z);if(l>R-2){m.position.x*=(R-2)/l;m.position.z*=(R-2)/l}m.rotation.y+=dt;if(z.k<=0){z.k=.35;inR(m.position,5.5,3+S.dm,0);flash(m.position,5.5,0x5aa0ff)}}});
  }else if(r==ROLES.assassin){
    let tx=p.x+dx*12,tz=p.z+dz*12;const pl=Math.hypot(tx,tz);if(pl>R-1){tx*=(R-1)/pl;tz*=(R-1)/pl}
    const sx=p.x,sz=p.z,vx=tx-sx,vz=tz-sz,len=Math.hypot(vx,vz)||1;
    const tr=new THREE.Mesh(new THREE.BoxGeometry(1.2,.6,len),new THREE.MeshBasicMaterial({color:0x9dff6a,transparent:true}));
    tr.position.set((sx+tx)/2,1.2,(sz+tz)/2);tr.rotation.y=Math.atan2(vx,vz);tr.userData={v:new THREE.Vector3(),l:.4,ring:1};scene.add(tr);F.push(tr);
    for(let j=E.length-1;j>=0;j--){const e=E[j],t=Math.max(0,Math.min(1,((e.position.x-sx)*vx+(e.position.z-sz)*vz)/(len*len))),
      d=Math.hypot(e.position.x-(sx+vx*t),e.position.z-(sz+vz*t));if(d<1.6+e.userData.rad)hitE(j,6+S.dm*2)}
    p.x=tx;p.z=tz;c.inv=.5;aura(c,3.4,0x9dff6a,.25,q=>inR(q,3.4,2+S.dm,0));
  }else if(r==ROLES.guerrier){
    flash(p,6,0xff9a3c);
    for(let j=E.length-1;j>=0;j--){const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z,d=Math.hypot(ex,ez)||1;
      if(d<7+e.userData.rad){e.position.x+=ex/d*4;e.position.z+=ez/d*4;hitE(j,4+S.dm)}}aura(c,4.5,0xff9a3c,.1,q=>inR(q,4.5,.6+S.dm*.3,1.4));
  }else{
    flash(p,10,0xb06bff);aura(c,10,0xb06bff,.5,q=>{C.forEach(o=>{if(o.alive&&Math.hypot(o.g.position.x-q.x,o.g.position.z-q.z)<10)o.hp=Math.min(o.max,o.hp+o.max*.06)});hud()});
  }
}
function hitE(j,d,source=null,forceCrit=false){
  const e=E[j];if(e.userData.shield){e.scale.setScalar(1.04);if(source===A)combatImpact(e.position,0x7af5e3,false);return}
  let crit=!!forceCrit;if(!crit&&source===A&&Math.random()<(.12+(S.critBonus||0))){d*=2;crit=true;combatImpact(e.position,0xffc857,true)}else if(source===A)combatImpact(e.position,e.material.color.getHex(),false);
  e.userData.hp-=d;e.scale.setScalar(1.3);e.userData.hitFlash=.18;e.userData.hitScale=.24;if(e.userData.mega&&e.userData.hp<=0){e.userData.hp=0;e.userData.shield=true;e.userData.ko=1;return}
  {const n=performance.now(),u=e.userData;if(crit){num(e.position,d,true)}else{u.acc=(u.acc||0)+d;if(!u.lt||n-u.lt>250||u.hp<=0){num(e.position,u.acc);u.acc=0;u.lt=n}}}
  if(e.userData.hp<=0){if(S.killHeal>0)C.forEach(c=>{if(c.alive)c.hp=Math.min(c.max,c.hp+c.max*S.killHeal)});if(S.focusTarget===e)S.focusTarget=null;S.score+=10*e.userData.pts;S.kills=(S.kills||0)+1;S.runKills=(S.runKills||0)+1;gainXP(e.userData.boss?8:Math.max(1,e.userData.pts*2));snd(300+Math.random()*200,.07);if(Math.random()<.1)drop(e.position.x,e.position.z);burst(e.position,e.material.color.getHex());const u2=e.userData,pos={x:e.position.x,z:e.position.z};if(u2.las){scene.remove(u2.las);u2.las=null}if(u2.type==='p')defer(()=>{for(let i=0;i<2;i++)spawn('s',{x:pos.x+(Math.random()-.5)*2,z:pos.z+(Math.random()-.5)*2})});if(u2.type==='x'&&!u2.dead){u2.dead=1;defer(()=>bomberBlast(pos))}scene.remove(e);E.splice(j,1);hud()}
}
const clock=new THREE.Clock(),CAM_T=new THREE.Vector3(),CAM_L=new THREE.Vector3();let SHAKE=SETTINGS.shake?1:0,LAST_MODE='';
// Lobby: the squad poses in the arena while the camera orbits.
function menuIdle(dt){const n=C.length;C.forEach((c,i)=>{const u=c.g.userData,off=i-(n-1)/2;c.g.position.set(off*2.1,0,-Math.abs(off)*.9+1.5);c.g.visible=true;c.t+=dt*2;
  c.g.rotation.y=Math.atan2(cam.position.x-c.g.position.x,cam.position.z-c.g.position.z);u.legs[0].rotation.x=u.legs[1].rotation.x=0;u.arms[0].rotation.x=-.1+Math.sin(c.t+i)*.06;u.arms[1].rotation.x=-.9+Math.sin(c.t*1.3+i)*.1;
  if(u.torso)u.torso.position.y=1.57+Math.sin(c.t*1.5+i)*.03;if(u.halo)u.halo.rotation.z+=dt;if(u.aura)u.aura.material.opacity=.22+Math.sin(c.t*2)*.06})}
// Keeps enemies from stacking into one blob: smoother movement and readable crowds.
function separateEnemies(){const n=E.length;if(n<2)return;for(let i=0;i<n;i++){const a=E[i];if(a.userData.mega||a.userData.fly)continue;for(let j=i+1;j<n;j++){const b=E[j];if(b.userData.mega||b.userData.fly)continue;
  const dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,min=(a.userData.rad+b.userData.rad)*.85,d2=dx*dx+dz*dz;if(d2>=min*min||d2<1e-6)continue;
  const d=Math.sqrt(d2),push=(min-d)*.5,ux=dx/d,uz=dz/d,wa=a.userData.boss?.15:1,wb=b.userData.boss?.15:1;a.position.x-=ux*push*wa;a.position.z-=uz*push*wa;b.position.x+=ux*push*wb;b.position.z+=uz*push*wb}}}
// Live HUD: hero panel, team cards, cooldowns. Runs 10×/s instead of every frame and only writes changed text.
function setText(el,t){if(el&&el.textContent!==t)el.textContent=t}
function updateLiveUI(){
  C.forEach(c=>{if(!c.el)return;setText(c.el.lastChild,c.alive?(c.spc>0?t('specialIn',{s:Math.ceil(c.spc)}):t('specialReady')):t('ko'));c.el.classList.toggle('ready',c.alive&&c.spc<=0)});
  const ch=$('combat-hint');if(ch&&A)setText(ch,(A.dodgeCd||0)>0?'ESQUIVE · '+A.dodgeCd.toFixed(1)+' s':'MAJ · ESQUIVE PRÊTE');
  const dg=$('dg');if(dg)dg.disabled=!!(A&&(A.dodgeCd>0||A.dodgeT>0));
  if(!A)return;const hp=Math.max(0,A.hp/A.max),sp=SPC[A.r.name]||12,spr=A.spc>0?1-A.spc/(sp*(A.cdr||1)):1;
  setText($('hp-name'),A.r.name);setText($('hp-num'),Math.max(0,Math.ceil(A.hp))+' / '+A.max);
  const hb=$('hp-fill');if(hb){hb.style.width=(hp*100)+'%';hb.style.background=hp<.3?'#ff4d6d':hp<.6?'#ffc857':'#5ee6a0'}
  const sb=$('sp-fill');if(sb)sb.style.width=(Math.max(0,Math.min(1,spr))*100)+'%';setText($('sp-txt'),A.spc>0?t('ability')+' · '+Math.ceil(A.spc)+'s':t('abilityReady'));
  $('hero-panel')&&$('hero-panel').classList.toggle('sp-ready',A.spc<=0);
  const db=$('dg-fill');if(db)db.style.width=((A.dodgeCd>0?1-A.dodgeCd/1.15:1)*100)+'%';
  const col='#'+A.r.col.toString(16).padStart(6,'0');const hpn=$('hero-panel');if(hpn&&hpn.dataset.col!==col){hpn.dataset.col=col;hpn.style.setProperty('--hero-color',col)}
  document.body.classList.toggle('low-hp',A.alive&&hp<.3);
  const left=(S.toSpawn||0)+E.filter(e=>!e.userData.mega).length;setText($('left'),S.mega?'—':String(left));
  const tm=$('timer');if(tm){const on=S.blitzT!=null&&!S.mega;tm.hidden=!on;if(on){const s2=Math.ceil(S.blitzT);setText(tm.firstElementChild,Math.floor(s2/60)+':'+String(s2%60).padStart(2,'0'));tm.classList.toggle('hurry',S.blitzT<20)}}
  const pc=$('pu-chip');if(pc){const parts=[];if(S.odT>0)parts.push('⚡ '+t('pu_overdrive')+' '+Math.ceil(S.odT)+'s');if(A.shieldHP>0)parts.push('🛡 '+Math.ceil(A.shieldHP));if(S.bonusCoins)parts.push('🪙 +'+S.bonusCoins);setText(pc,parts.join('  ·  '));pc.hidden=!parts.length}
}
function loop(){
  requestAnimationFrame(loop);
  if(S&&S.mode!==LAST_MODE){LAST_MODE=S.mode;document.body.dataset.mode=S.mode;if(S.mode!=='play')document.body.classList.remove('low-hp')}
  let dt=Math.min(clock.getDelta(),.05);
  if(S.hitStop>0){S.hitStop=Math.max(0,S.hitStop-dt);dt*=.18;}
  if(S.mode=='play'){
    updateComboHud();
    C.forEach(c=>{if(c.alive&&!c.off)act(c,dt,c==A)});
    if(S.odT>0){S.odT-=dt;if(S.odT<=0)S.rm/=.6}
    if(S.regen)C.forEach(c=>{if(c.alive)c.hp=Math.min(c.max,c.hp+c.max*.012*dt)});
    if(S.blitzT!=null&&!S.mega){S.blitzT-=dt;if(S.blitzT<=0){S.blitzT=0;UI.endMatch('timeup');return}}
    if(!S.mega){S.puT=(S.puT==null?14:S.puT)-dt;if(S.puT<=0){S.puT=18+Math.random()*8;const a=Math.random()*6.283,r=Math.random()*(R-5);drop(Math.sin(a)*r,Math.cos(a)*r)}}
    S.uiT=(S.uiT||0)-dt;if(S.uiT<=0){S.uiT=.1;updateLiveUI()}
    if(S.toSpawn>0){S.spT-=dt;if(S.spT<=0){spawn();S.toSpawn--;S.spT=Math.max(.12,(.7-.04*S.wave)*(S.modeId==='blitz'?.65:1))}}
    const alive=C.filter(c=>c.alive&&!c.off),aliveG=alive.map(c=>c.g);
    for(const e of E){
      if(!alive.length)break;
      if(e.userData.spawnT>0){e.userData.spawnT-=dt;const k=1-Math.max(0,e.userData.spawnT)/.45;e.scale.setScalar(Math.max(.01,k*(2-k)));e.rotation.y+=dt*6;continue}
      const t=near(e.position,aliveG),pp=t.o.position;
      const dx=pp.x-e.position.x,dz=pp.z-e.position.z,l=Math.hypot(dx,dz)||1;
      if(e.userData.rng){const q3=Math.hypot(e.position.x,e.position.z);if(q3>R-1){e.position.x*=(R-1)/q3;e.position.z*=(R-1)/q3}e.userData.cd=(e.userData.cd==null?1+Math.random()*2:e.userData.cd)-dt;if(e.userData.cd<=0&&l<17){e.userData.cd=2.2;eshot(e.position,dx/l,dz/l,10,12,0xb6ff3a)}}
      if(e.userData.boss){e.userData.bcd=(e.userData.bcd==null?3:e.userData.bcd)-dt;if(e.userData.bcd<=0){e.userData.bcd=5;for(let i=0;i<12;i++){const a=i/12*6.283;eshot(e.position,Math.sin(a),Math.cos(a),12,10,0xff5a3a)}}}
      const fl=e.userData.fly;if(fl){fl.t-=dt;const u=Math.max(0,fl.t/fl.d);e.position.x+=fl.vx*u*dt;e.position.z+=fl.vz*u*dt;e.position.y=1+Math.sin(Math.PI*(1-u))*7;const q2=Math.hypot(e.position.x,e.position.z);if(q2>R-.5){e.position.x*=(R-.5)/q2;e.position.z*=(R-.5)/q2}if(fl.t<=0){e.position.y=1;e.userData.fly=null;e.userData.hold=.6}}else if(e.userData.hold>0)e.userData.hold-=dt;else if(e.userData.ai&&aiStep(e,dt,pp,dx,dz,l)){}else{let sf=e.userData.slow>0?.4:1;if(sf<1)e.userData.slow-=dt;let ddx=dx/l,ddz=dz/l;if(e.userData.rng){const k=l>11?1:l<8?-1:0;ddx*=k;ddz*=k}if(e.userData.blind>0){e.userData.blind-=dt;const ba=e.userData.ba||0,cs=Math.cos(ba),sn=Math.sin(ba),nx=ddx*cs-ddz*sn;ddz=ddx*sn+ddz*cs;ddx=nx;sf*=.7}e.position.x+=ddx*e.userData.sp*sf*dt;e.position.z+=ddz*e.userData.sp*sf*dt}
      if(!e.userData.noSpin){e.rotation.y+=dt*2;e.rotation.x+=dt}if(e.userData.hitFlash>0){e.userData.hitFlash-=dt;e.material.emissiveIntensity=.45+Math.min(2,e.userData.hitFlash*12);e.scale.setScalar(1+Math.max(0,e.userData.hitScale||0)*Math.min(1,e.userData.hitFlash*8));e.userData.hitScale=Math.max(0,(e.userData.hitScale||0)-dt*1.8)}else if(e.userData.st!=='arm'){e.material.emissiveIntensity=.45;e.scale.setScalar(Math.max(1,e.scale.x-dt*3))}
      for(const c of alive){
        const q=c.g.position;
        if(c.inv<=0&&q.y<1.6&&Math.hypot(q.x-e.position.x,q.z-e.position.z)<e.userData.rad+.8){
          {const dd=absorb(c,e.userData.pts*8+4);c.hp-=dd;}c.inv=.72;snd(80,.12,'square');if(c===A){QK=Math.max(QK,.16);const damage=$('damage-flash');if(damage){damage.classList.remove('show');void damage.offsetWidth;damage.classList.add('show')}}e.position.x-=dx/l*2.5;e.position.z-=dz/l*2.5;
          if(c.hp<=0){c.alive=false;c.g.visible=false;c.tf=0;c.g.scale.setScalar(1);burst(q,c.r.col);if(c==A){const n=C.findIndex(o=>o.alive);if(n>=0)pick(n)}}
          hud();
        }
      }
    }
    separateEnemies();
    for(let i=EP.length-1;i>=0;i--){const q=EP[i],u=q.userData;q.position.addScaledVector(u.v,dt);u.l-=dt;let dead=u.l<=0;
      if(u.back){for(let j=E.length-1;j>=0;j--){const e=E[j];if(Math.hypot(e.position.x-q.position.x,e.position.z-q.position.z)<e.userData.rad+.5){hitE(j,4+S.dm);dead=true;break}}}
      else for(const c of C){if(c.alive&&!c.off&&c.inv<=0&&q.position.y>c.g.position.y-.3&&q.position.y<c.g.position.y+2.4&&Math.hypot(c.g.position.x-q.position.x,c.g.position.z-q.position.z)<1){hurt(c,u.d);dead=true;break}}
      if(dead){scene.remove(q);EP.splice(i,1)}}
    for(let i=Z.length-1;i>=0;i--){const z=Z[i];z.t-=dt;z.k-=dt;z.run(z,dt);if(z.t<=0||(z.c&&!z.c.alive)){if(z.end&&z.t<=0)z.end(z);scene.remove(z.m);Z.splice(i,1)}}
    if(S.mega)megaUpdate(dt);
    S.rt=(S.rt||0)-dt;if(S.rt<=0){S.rt=.25;checkRx()}
    const bo=E.find(e=>e.userData.boss);$('boss').hidden=!bo;if(bo)$('boss').querySelector('u').style.width=Math.max(0,bo.userData.hp/bo.userData.mx*100)+'%';
    if(!C.some(c=>c.alive)){over()}
    for(let i=B.length-1;i>=0;i--){
      const b=B[i];b.position.addScaledVector(b.userData.v,dt);b.userData.l-=dt;let hit=false;
      for(let j=E.length-1;j>=0;j--){
        const e=E[j];
        if(Math.hypot(b.position.x-e.position.x,b.position.z-e.position.z)<e.userData.rad+(b.userData.hr||.3)&&Math.abs(b.position.y-e.position.y)<e.userData.rad+.8){if(b.userData.finisher)combatImpact(e.position,0xffc857,true);if(b.userData.pierce){if(!b.userData.hs.has(e)){b.userData.hs.add(e);hitE(j,b.userData.d,b.userData.source||null)}continue}if(b.userData.aoe){const ar=b.userData.ar||3;flash(b.position,ar,0x5aa0ff);for(let k=E.length-1;k>=0;k--)if(Math.hypot(b.position.x-E[k].position.x,b.position.z-E[k].position.z)<ar)hitE(k,b.userData.d,b.userData.source||null)}else{if(b.userData.slow)e.userData.slow=2.5;if(b.userData.snare)e.userData.hold=e.userData.boss?.5:1.5;if(b.userData.mag)node(e.position.x,e.position.z);hitE(j,b.userData.d,b.userData.source||null)}hit=true;break}
      }
      if(hit||b.userData.l<=0){scene.remove(b);B.splice(i,1)}
    }
    runDefer();
    if(S.toSpawn==0&&E.length==0&&S.mode=='play')upgrades();
  }else if(S.mode==='menu'){menuIdle(dt)}
  for(let i=F.length-1;i>=0;i--){
    const f=F[i];f.userData.l-=dt;
    if(f.userData.ring){f.material.opacity=f.userData.l*4}else{f.position.addScaledVector(f.userData.v,dt);f.userData.v.y-=14*dt}
    if(f.userData.l<=0){scene.remove(f);F.splice(i,1)}
  }
  if(S.mode==='menu'){const tt=clock.elapsedTime,wide=innerWidth>760,ox=wide?(innerWidth>1100?-2.5:-5.5):0,sw=Math.sin(tt*.18)*.45,r=wide?14:17;CAM_T.set(Math.sin(sw)*r+ox,4.2+Math.sin(tt*.3)*.6,Math.cos(sw)*r);cam.position.lerp(CAM_T,1-Math.exp(-dt*2));CAM_L.lerp(new THREE.Vector3(ox,wide?2.4:3.6,0),1-Math.exp(-dt*3));cam.lookAt(CAM_L);updateBars();updateArena(dt,clock.elapsedTime);renderFrame();return}
  const ap=A.g.position,lead=S.mode=='play'&&!S.mega?.12:0,lx=(aim.x-ap.x)*lead,lz=(aim.z-ap.z)*lead,LK=Math.max(-3,Math.min(3,lx)),LZ=Math.max(-3,Math.min(3,lz));
  const ck=1-Math.exp(-dt*7);CAM_T.set(ap.x+LK,15.5+(S.mega?ap.y*.6:0),ap.z+LZ+11.5);cam.position.lerp(CAM_T,ck);CAM_L.lerp(new THREE.Vector3(ap.x+LK,S.mega?ap.y*.5:0,ap.z+LZ),ck);
  if(QK>0){QK-=dt;const amp=SHAKE*Math.min(.55,QK*2.6);cam.position.x+=(Math.random()-.5)*amp;cam.position.y+=(Math.random()-.5)*amp}cam.lookAt(CAM_L);
  updateBars();
  updateArena(dt,clock.elapsedTime);
  renderFrame();
}
loop();
