const R=22,$=id=>document.getElementById(id);
// Narrow bridge for the optional co-op client; solo gameplay remains unchanged.
Object.defineProperty(window,'BastionGameBridge',{configurable:false,value:{getScene:()=>scene,getActiveHero:()=>A,getState:()=>S,startWave:()=>startWave()}});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x12142b);scene.fog=new THREE.Fog(0x12142b,32,75);
const cam=new THREE.PerspectiveCamera(50,1,.1,200);
const ren=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});ren.setPixelRatio(Math.min(devicePixelRatio,1.6));ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.12;
$('c').appendChild(ren.domElement);
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
scene.add(new THREE.HemisphereLight(0x9fb4ff,0x1a1030,.9));
const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(10,20,8);scene.add(sun);
const normalArena=new THREE.Group(); normalArena.name='Bastion_Normal_Arena';
const floor=new THREE.Mesh(new THREE.CircleGeometry(R,96),new THREE.MeshStandardMaterial({color:0x101a35,metalness:.38,roughness:.68}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.045;normalArena.add(floor);
// Arena architecture: all pieces are procedural and share materials/geometries where practical.
const arenaMetal=new THREE.MeshStandardMaterial({color:0x263958,metalness:.72,roughness:.32});
const arenaDark=new THREE.MeshStandardMaterial({color:0x111a31,metalness:.55,roughness:.42});
const arenaCyan=new THREE.MeshStandardMaterial({color:0x48e7dc,emissive:0x22bdb9,emissiveIntensity:1.25,metalness:.25,roughness:.28});
const arenaGold=new THREE.MeshStandardMaterial({color:0xffc857,emissive:0x9b6218,emissiveIntensity:.7,metalness:.3,roughness:.35});
const torusGeo=new THREE.TorusGeometry(1,.08,8,96);
for(const [r,t,col] of [[R,.22,0x5ee6d0],[R*.83,.045,0x243a62],[R*.66,.065,0x2c6384],[R*.48,.035,0x243a62],[R*.33,.07,0x2c6384],[R*.17,.035,0x243a62]]){
  const ring=new THREE.Mesh(torusGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:r===R?.9:.68}));ring.scale.setScalar(r);ring.rotation.x=Math.PI/2;ring.position.y=.025;normalArena.add(ring);
}
// Radial inlays and central reactor emblem.
for(let i=0;i<24;i++){const a=i*Math.PI/12,inner=3.2,outer=R-1.1,len=outer-inner;
  const strip=new THREE.Mesh(new THREE.BoxGeometry(i%3===0?.12:.045,.025,len),i%3===0?arenaCyan:arenaMetal);
  strip.position.set(Math.sin(a)*(inner+outer)/2,.012,Math.cos(a)*(inner+outer)/2);strip.rotation.y=a;normalArena.add(strip);
}
const reactor=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3,.12,8),arenaDark);reactor.position.y=.03;normalArena.add(reactor);
const reactorRing=new THREE.Mesh(new THREE.TorusGeometry(2.15,.09,8,48),arenaCyan);reactorRing.rotation.x=Math.PI/2;reactorRing.position.y=.12;normalArena.add(reactorRing);
const core=new THREE.Mesh(new THREE.OctahedronGeometry(.72,0),new THREE.MeshStandardMaterial({color:0x7af5e3,emissive:0x20c8c1,emissiveIntensity:1.7,metalness:.35,roughness:.2}));core.position.y=.62;normalArena.add(core);
const pylons=[];
for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.sin(a)*(R-1.2),z=Math.cos(a)*(R-1.2),g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,.42,6),arenaDark);base.position.y=.2;g.add(base);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.42,.68,2.7,6),arenaMetal);shaft.position.y=1.72;g.add(shaft);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.52,0),i%3===0?arenaGold:arenaCyan);crystal.position.y=3.35;g.add(crystal);
  const band=new THREE.Mesh(new THREE.TorusGeometry(.58,.055,6,18),i%3===0?arenaGold:arenaCyan);band.rotation.x=Math.PI/2;band.position.y=2.55;g.add(band);
  g.position.set(x,0,z);g.rotation.y=-a;normalArena.add(g);pylons.push({g,crystal,phase:i*.7});
}

scene.add(normalArena);

// Two imported arenas: Meshy Colosseum for waves, dark fortress for the mega-boss.
let colosseumArena=null,bossFortressArena=null,arenaLoadState={normal:false,boss:false};
// A clean, level combat surface for the boss arena. The imported fortress has an
// uneven/thick base, which visually hides the lower parts of characters.
const bossFloor=new THREE.Mesh(
  new THREE.CircleGeometry(27.1,128),
  new THREE.MeshStandardMaterial({color:0x292e35,metalness:.22,roughness:.82})
);
bossFloor.name='BossArenaCombatFloor';
// Slightly lower than character origin: prevents the visual floor from clipping the lower body.
bossFloor.rotation.x=-Math.PI/2;
bossFloor.position.y=-.28;
bossFloor.visible=false;
scene.add(bossFloor);
function setArenaMode(mode){
  S.arenaMode=mode; normalArena.visible=(mode==='normal'&&!arenaLoadState.normal);
  if(colosseumArena)colosseumArena.visible=(mode==='normal'&&arenaLoadState.normal);
  if(bossFortressArena)bossFortressArena.visible=(mode==='boss'&&arenaLoadState.boss);
  bossFloor.visible=(mode==='boss'&&arenaLoadState.boss);
  if(mode==='boss'&&!arenaLoadState.boss)normalArena.visible=true;
}
// Normalize imported GLB assets: Meshy exports can have wildly different units/origins.
// Fit each arena to the gameplay footprint, center it on (0,0,0), and rest it on y=0.
function fitArenaModel(root,targetDiameter,options={}){
  root.updateMatrixWorld(true);
  if(options.zUp) root.rotation.x=-Math.PI/2; // Blender-style Z-up -> Three.js Y-up
  root.updateMatrixWorld(true);
  let bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  const footprint=Math.max(size.x,size.z);
  if(!Number.isFinite(footprint)||footprint<0.001) throw new Error('Dimensions GLB invalides');
  root.scale.multiplyScalar(targetDiameter/footprint);
  // For Z-up assets, local Z becomes world height after the -90 degree correction.
  // Compress that axis only so the boss fortress keeps its footprint but has lower walls/towers.
  if(options.zUp && Number.isFinite(options.heightScale)){
    root.scale.z*=THREE.MathUtils.clamp(options.heightScale,.1,1);
  }
  root.updateMatrixWorld(true);
  bounds=new THREE.Box3().setFromObject(root);
  const center=bounds.getCenter(new THREE.Vector3());
  root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bounds.min.y;
  root.updateMatrixWorld(true);
  // Keep a conservative visual/gameplay footprint close to the 44-unit combat radius.
  root.userData.arenaBounds={width:targetDiameter,minY:0};
}
if(THREE.GLTFLoader){const loader=new THREE.GLTFLoader();
  loader.load('./colosseum.glb',g=>{
    colosseumArena=g.scene;colosseumArena.name='Meshy_Colosseum';
    try{fitArenaModel(colosseumArena,52);}catch(err){console.warn('Normalisation Colisée impossible',err);}
    colosseumArena.visible=false;scene.add(colosseumArena);arenaLoadState.normal=true;setArenaMode(S.arenaMode||'normal');
  },undefined,e=>console.warn('Colisée Meshy non chargé, décor procédural utilisé.',e));
  loader.load('./boss_fortress.glb',g=>{
    bossFortressArena=g.scene;bossFortressArena.name='Dark_Fortress_Boss_Arena';
    try{fitArenaModel(bossFortressArena,58,{zUp:true,heightScale:.42});}catch(err){console.warn('Normalisation forteresse impossible',err);}
    bossFortressArena.visible=false;scene.add(bossFortressArena);arenaLoadState.boss=true;setArenaMode(S.arenaMode||'normal');
  },undefined,e=>console.warn('Forteresse boss non chargée, décor procédural utilisé.',e));
}

const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function human(col){
  const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.2,metalness:.38,roughness:.38}),
    armor=new THREE.MeshStandardMaterial({color:0x253552,metalness:.78,roughness:.27}),
    trim=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.75,metalness:.3,roughness:.25}),
    sk=new THREE.MeshStandardMaterial({color:0xc9a995,roughness:.8}),visor=new THREE.MeshStandardMaterial({color:0x10182b,emissive:col,emissiveIntensity:.9,metalness:.5,roughness:.18});
  const part=(geo,mat,x,y,z,par)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);(par||g).add(o);return o};
  const torso=part(new THREE.BoxGeometry(.78,.92,.48),m,0,1.57,0);torso.scale.set(1,.92,.82);
  part(new THREE.BoxGeometry(.62,.48,.19),armor,0,1.65,.29);
  part(new THREE.BoxGeometry(.46,.075,.055),trim,0,1.72,.395);
  part(new THREE.SphereGeometry(.3,12,10),armor,0,2.28,0);
  part(new THREE.BoxGeometry(.36,.13,.12),visor,0,2.29,.255);
  part(new THREE.BoxGeometry(.16,.1,.09),trim,0,2.08,.21);
  part(new THREE.BoxGeometry(.66,.16,.44),armor,0,1.19,0);
  part(new THREE.BoxGeometry(.18,.12,.46),trim,0,1.19,.02);
  const limb=(x,y,w,h,isLeg=false)=>{const p=new THREE.Group();p.position.set(x,y,0);g.add(p);
    part(new THREE.BoxGeometry(w,h,w),isLeg?armor:m,0,-h/2,0,p);
    if(isLeg){const boot=part(new THREE.BoxGeometry(w*1.2,.2,w*1.5),armor,0,-h+.08,.08,p);boot.userData.isBoot=true}
    return p};
  g.userData.legs=[limb(-.23,1.02,.31,.96,true),limb(.23,1.02,.31,.96,true)];
  g.userData.arms=[limb(-.59,1.98,.27,.78),limb(.59,1.98,.27,.78)];
  // Shoulder pauldrons, forearm guards, and a compact backpack create a premium sci-fi silhouette.
  for(const side of [-1,1]){
    const pad=part(new THREE.SphereGeometry(.28,8,6),armor,side*.62,2.02,0);pad.scale.set(1,.72,1);
    const stripe=part(new THREE.BoxGeometry(.1,.25,.31),trim,side*.62,2.02,.08);stripe.rotation.z=side*.18;
    const bracer=part(new THREE.BoxGeometry(.3,.22,.34),armor,side*.61,1.48,.05);bracer.rotation.z=side*.12;
  }
  part(new THREE.BoxGeometry(.52,.52,.24),armor,0,1.7,-.32);
  part(new THREE.BoxGeometry(.32,.08,.08),trim,0,1.77,-.46);
  const weapon=new THREE.Group();part(new THREE.BoxGeometry(.12,.13,.75),armor,.61,1.4,.49,weapon);
  const blade=part(new THREE.BoxGeometry(.08,.08,.54),trim,.61,1.4,.98,weapon);blade.rotation.x=-.12;g.add(weapon);g.userData.weapon=weapon;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.9,.07,8,32),new THREE.MeshBasicMaterial({color:0xffc857,transparent:true,opacity:.88}));
  ring.rotation.x=Math.PI/2;ring.position.y=.08;ring.visible=false;g.add(ring);g.userData.ring=ring;
  const aura=new THREE.Mesh(new THREE.CylinderGeometry(.65,.85,.035,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18}));aura.position.y=.035;g.add(aura);
  g.userData.aura=aura;g.userData.trim=trim;g.userData.baseCol=col;g.userData.torso=torso;
  return g;
}
const ROLES={
  tireur:{name:'Tireur',col:0x5ee6d0,hp:70,spd:8.5,rate:.22},
  guerrier:{name:'Fighter',col:0xff9a3c,hp:150,spd:8.5,rate:.14,melee:2.6,mdmg:.7,kb:1.6},
  medic:{name:'Médic',col:0xb06bff,hp:80,spd:8,rate:.5},
  mage:{name:'Mage',col:0x5aa0ff,hp:65,spd:7.5,rate:.9},
  assassin:{name:'Assassin',col:0x9dff6a,hp:60,spd:10.5,rate:.35,melee:2.2,mdmg:3},
  neant:{name:'Néant',col:0xc8c8e0,hp:90,spd:7.5,rate:4},
  pyro:{name:'Pyro',col:0xff5a1f,hp:85,spd:8,rate:.07},
  meteor:{name:'Météore',col:0xb08a5a,hp:95,spd:7,rate:1.1},
  terre:{name:'Géo',col:0x6b8f3a,hp:120,spd:7.5,rate:.5},
  plant:{name:'PlantG',col:0x3fd96b,hp:90,spd:8,rate:.25},
  givre:{name:'Givre',col:0x9fd8ff,hp:80,spd:8,rate:.3,kite:1},
  volt:{name:'Volt',col:0xf5f06a,hp:75,spd:9,rate:.3},
  necro:{name:'Nécro',col:0xe8dcb0,hp:70,spd:7.5,rate:2.2,kite:1},
  gardien:{name:'Gardien',col:0x3d5afe,hp:200,spd:7,rate:.45,melee:3.2,mdmg:1.5,kb:-1.2},
  ingenieur:{name:'Ingénieur',col:0xb8651b,hp:85,spd:8,rate:.3,kite:1},
  toxine:{name:'Toxine',col:0xd048c8,hp:80,spd:8,rate:.7,kite:1},
  archer:{name:'Archer',col:0xc2a86b,hp:70,spd:8.5,rate:.45,kite:1},
  ombre:{name:'Ombre',col:0x5a3a8a,hp:65,spd:10,rate:.4},
  samourai:{name:'Samouraï',col:0xb01e2e,hp:110,spd:8.5,rate:.55,melee:4.8,mdmg:3},
  paladin:{name:'Paladin',col:0xffe9a8,hp:130,spd:7.5,rate:.35},
  dragon:{name:'Dragon',col:0xc23b22,hp:120,spd:8,rate:.25,trate:.15},
  druide:{name:'Druide',col:0x8a7a3a,hp:100,spd:8,rate:.4,trate:.3,kite:1},
  mecha:{name:'Mecha',col:0x6a7a8a,hp:110,spd:7.5,rate:.1,trate:.5,kite:1},
  miroir:{name:'Miroir',col:0xf4f4f4,hp:100,spd:9,rate:.35,kite:1},
  boomerang:{name:'Boomerang',col:0x7a8fb8,hp:85,spd:8.5,rate:.5,kite:1},
  joker:{name:'Joker',col:0xff7ab8,hp:90,spd:8.5,rate:.45,kite:1},
  pirate:{name:'Pirate',col:0x2d4a8a,hp:110,spd:7.5,rate:.9,kite:1},
  chasseur:{name:'Chasseur',col:0x6b4f3a,hp:100,spd:8.5,rate:.45,kite:1},
  maree:{name:'Marée',col:0x1fa8c9,hp:95,spd:8,rate:.12},
  vent:{name:'Vent',col:0xb8e6c8,hp:90,spd:9,rate:.3},
  sable:{name:'Sable',col:0xe0b870,hp:95,spd:8,rate:.15},
  magnet:{name:'Magnétique',col:0x8a3dd4,hp:140,spd:8,rate:1.2,kite:1}};
const G={c:new THREE.BoxGeometry(1.4,1.4,1.4),f:new THREE.OctahedronGeometry(.8),t:new THREE.IcosahedronGeometry(1.5),s:new THREE.TetrahedronGeometry(.6),b:new THREE.DodecahedronGeometry(2.4),r:new THREE.ConeGeometry(.7,1.7,6)};
const bGeo=new THREE.SphereGeometry(.22,8,8),fxGeo=new THREE.BoxGeometry(.25,.25,.25);
let S,C=[],A=null,E=[],B=[],F=[],Z=[],SEL=['tireur','guerrier','medic','mage'],QK=0,LS=null,EP=[],JV={x:0,z:0},joy=null,ORD=0,PL=[],CY=0;
const keys={},mouse=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-1),aim=new THREE.Vector3();
let down=false,rdown=false;addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{keys[e.code]=true;
  if(e.code=='Space'||e.code=='Tab')e.preventDefault();
  if((e.code=='ShiftLeft'||e.code=='ShiftRight')&&!e.repeat&&S.mode=='play')tryDodge();
  if(e.code=='KeyP'||e.code=='Escape'){if(S.mode=='pause')resume();else pause()}if(e.code=='KeyV'&&S.mode=='play')cycleOrd();if(e.code=='KeyF'&&!e.repeat&&S.mode=='play')focusTarget();
  if(e.code=='Space'&&!e.repeat&&S.mega&&S.mode=='play'&&A&&(A.jc||0)<2){A.vy=12;A.jc=(A.jc||0)+1}
  if(S.mode=='play'){if(e.code=='Digit1')pick(0);if(e.code=='Digit2')pick(1);if(e.code=='Digit3')pick(2);if(e.code=='Digit4')pick(3);if(e.code=='Digit5')pick(4);if(e.code=='Digit6')pick(5);if(e.code=='Digit7')pick(6);
    if(e.code=='Tab'){for(let i=1;i<=C.length;i++){const n=(C.indexOf(A)+i)%C.length;if(C[n].alive){pick(n);break}}}}});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyR'&&typeof releaseChargedAttack==='function')releaseChargedAttack(A)});
addEventListener('pointerdown',e=>{if(!e.target.closest('button,.card')){if(e.pointerType=='touch'&&e.clientX<innerWidth*.4){joy={id:e.pointerId,x:e.clientX,y:e.clientY}}else{mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);if(e.button==2)rdown=true;else down=true}}});
addEventListener('pointerup',e=>{if(joy&&e.pointerId==joy.id){joy=null;JV.x=0;JV.z=0}else{down=false;rdown=false}});
addEventListener('pointermove',e=>{if(joy&&e.pointerId==joy.id){const dx=(e.clientX-joy.x)/50,dz=(e.clientY-joy.y)/50,l=Math.hypot(dx,dz);JV.x=dx/Math.max(1,l);JV.z=dz/Math.max(1,l)}else mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)});

function pick(i){const n=C[i];if(!n||!n.alive)return;
  if(S.mega&&A&&n!=A){if(A.alive&&(S.mega.sw||0)>0)return;const o=A,p=o.g.position;n.g.position.set(p.x,p.y,p.z);n.vy=o.vy||0;n.jc=o.jc||0;n.g.rotation.y=o.g.rotation.y;o.off=true;o.g.visible=false;n.off=false;n.g.visible=true;n.inv=Math.max(n.inv,.8);flash(p,2.5,n.r.col);burst(p,n.r.col);S.mega.sw=1.5}
  A=n;C.forEach(c=>c.g.userData.ring.visible=c==A);hud()}
function focusTarget(){if(!A)return;let best=null,bd=1e9;for(const e of E){const d=Math.hypot(e.position.x-A.g.position.x,e.position.z-A.g.position.z);if(d<bd){bd=d;best=e}}if(best){S.focusTarget=best;banner('CIBLE PRIORITAIRE : '+(best.userData.boss?'BOSS':'ENNEMI'));flash(best.position,2.1,0xffc857)}}
function reset(){
  [...C.map(c=>c.g),...E,...B,...F,...EP,...Z.map(z=>z.m)].forEach(o=>scene.remove(o));E=[];B=[];F=[];EP=[];Z=[];C=[];
  S={score:0,wave:0,rm:1,dm:0,sm:1,mode:'menu',toSpawn:0,spT:0,xp:0,xpNext:12,level:1,pendingChoices:0,pendingLevels:0,runKills:0,hitStop:0,combo:0,comboT:0,focusTarget:null,critBonus:0,killHeal:0,comboBonus:0};
  SEL.map(k=>ROLES[k]).forEach((r,i)=>{const g=human(r.col);g.position.set((i-(SEL.length-1)/2)*3,0,0);scene.add(g);
    C.push({r,g,hp:r.hp,max:r.hp,cd:0,alive:true,inv:0,heal:0,spc:3,mv:false,t:Math.random()*6,comboCount:0,comboAt:0,finisherReady:false,attackAnim:0})});
  pick(0);
  $('team').innerHTML='';C.forEach((c,i)=>{const d=document.createElement('div');d.className='card';d.onclick=()=>pick(i);
    d.innerHTML='<b>'+(i+1)+' '+c.r.name+'</b><i><u></u></i><em style="font-style:normal;font-size:12px;color:var(--gold)"></em>';$('team').appendChild(d);c.el=d});
  hud();
}
function hud(){
  $('w').textContent=S.wave;$('s').textContent=S.score;const xp=$('xp');if(xp)xp.textContent='Niv. '+(S.level||1)+' · XP '+(S.xp||0)+'/'+(S.xpNext||12);$('ord').textContent='Ordre : '+['Attaquer','Suivre','Défendre'][ORD]+' (V)';
  C.forEach(c=>{if(!c.el)return;c.el.className='card'+(c==A?' on':'')+(c.alive?'':' dead');c.el.querySelector('u').style.width=Math.max(0,c.hp/c.max*100)+'%'});
}
function banner(t){const b=$('ban');b.textContent=t;b.style.opacity=1;setTimeout(()=>b.style.opacity=0,1400)}
function startWave(){S.wave++;setArenaMode('normal');if(S.wave%5==0){S.megaOnly=false;S.campaignMega=true;S.mode='pick';hud();megaPick();return}S.toSpawn=Math.round((12+S.wave*5)*(.6+.15*C.length)*(S.wave%4==3?1.5:1));S.horde=S.wave%4==3;if(S.wave%2==0)for(let i=0;i<1+(S.wave/4|0);i++)spawn('b');S.spT=0;S.mode='play';$('ov').hidden=true;banner(S.wave%2==0?'Vague '+S.wave+' : MINI-BOSS — progression conservée':(S.horde?'Vague '+S.wave+' : HORDE !':'Vague '+S.wave));hud()}
function spawn(bt){
  const w=S.wave,r=Math.random();let t=bt||'c';if(bt);else if(S.horde)t='s';else if(w>=2&&Math.random()<.18)t='r';else if(w>=5&&r<.18)t='t';else if(w>=3&&r<.4)t='f';else if(w>=2&&r<.7)t='s';
  const d={c:[1+(w/4|0),2.6+.12*w,0xff5a7a,.9,1],f:[1,4.2+.12*w,0xffc857,.6,1],t:[6+w,1.6+.05*w,0xb06bff,1.5,3],s:[1,5.5+.1*w,0xff8a4a,.55,1],b:[60+w*10,1.5,0xff2a2a,2.4,5],r:[1+(w/5|0),2.4+.05*w,0xb6ff3a,.8,2]}[t];
  const m=new THREE.Mesh(G[t],new THREE.MeshStandardMaterial({color:d[2],emissive:d[2],emissiveIntensity:.35}));
  const a=Math.random()*6.283;m.position.set(Math.cos(a)*(R-1),1,Math.sin(a)*(R-1));
  m.userData={mx:d[0],boss:t=='b',rng:t=='r',hp:d[0],sp:Math.min(d[1],9),rad:d[3],pts:d[4]};scene.add(m);E.push(m);
}
function burst(p,col){while(F.length>150){const old=F.shift();scene.remove(old)}for(let i=0;i<6;i++){const m=new THREE.Mesh(fxGeo,new THREE.MeshBasicMaterial({color:col}));
  m.position.copy(p);m.userData={v:new THREE.Vector3((Math.random()-.5)*8,Math.random()*6,(Math.random()-.5)*8),l:.5};scene.add(m);F.push(m)}}
function flash(p,rad,col){const m=new THREE.Mesh(new THREE.TorusGeometry(rad,.12,6,32),new THREE.MeshBasicMaterial({color:col,transparent:true}));
  m.rotation.x=Math.PI/2;m.position.set(p.x,.3,p.z);m.userData={v:new THREE.Vector3(),l:.25,ring:1};scene.add(m);F.push(m)}
const UP=[['Précision létale : critiques +8 %',()=>S.critBonus=(S.critBonus||0)+.08],['Récolte vitale : éliminations soignent 2 % des PV max',()=>S.killHeal=(S.killHeal||0)+.02],['Finisher maîtrisé : dégâts finisher +0,2×',()=>S.comboBonus=(S.comboBonus||0)+.2],['Héros actif : recharge de capacité -20 %',()=>A.cdr=(A.cdr||1)*.8],['Héros actif : PV max +40',()=>{A.max+=40;A.hp+=40}],['Héros actif : vitesse +20 %',()=>A.spm=(A.spm||1)*1.2],['Cadence de tir +20 %',()=>S.rm*=.8],['Dégâts +1 pour tous',()=>S.dm++],['Vitesse +12 %',()=>S.sm*=1.12],
 ['PV max +25 pour tous',()=>C.forEach(c=>{c.max+=25;if(c.alive)c.hp+=25})],
 ['Ranimer un héros tombé',()=>{const d=C.find(c=>!c.alive);if(d){d.alive=true;d.hp=d.max*.6;d.g.visible=true}else C.forEach(c=>c.hp=c.max)}]];
function upgrades(){
  S.mode='up';Z.forEach(z=>scene.remove(z.m));Z=[];EP.forEach(o=>scene.remove(o));EP=[];C.forEach(c=>{if(c.alive)c.hp=Math.min(c.max,c.hp+25)});hud();
  // Chaque vague donne un choix; les niveaux gagnés pendant le combat en ajoutent d'autres.
  S.pendingChoices=(S.pendingChoices||0)+1;
  showUpgradeChoice(true);
}
function showUpgradeChoice(waveReward=false){
  S.mode='up';const o=$('ov');o.hidden=false;
  const title=(S.pendingLevels||0)>0?'Niveau '+S.level+' atteint !':'Vague '+S.wave+' repoussée';
  o.innerHTML='<div class="box"><h1>'+title+'</h1><p>Choisissez une amélioration. Elle ne dure que pour cette partie. Les choix restants : '+(S.pendingChoices||1)+'.</p><div id="opts" class="upgrade-options"></div></div>';
  [...UP].sort(()=>Math.random()-.5).slice(0,3).forEach((u,i)=>{const b=document.createElement('button');b.className='upgrade-card';b.innerHTML='<span class="upgrade-index">0'+(i+1)+'</span><b>'+u[0].replace('Héros actif',A.r.name)+'</b><small>'+upgradeDescription(u[0])+'</small>';b.onclick=()=>{u[1]();if((S.pendingLevels||0)>0)S.pendingLevels--;S.pendingChoices=Math.max(0,(S.pendingChoices||1)-1);hud();if(S.pendingChoices>0)showUpgradeChoice(false);else startWave()};$('opts').appendChild(b)});
}
function upgradeDescription(label){
  if(label.includes('critiques'))return 'Augmente les chances de coup critique du héros contrôlé.';
  if(label.includes('Récolte vitale'))return 'Chaque élimination rend une petite quantité de PV à l’escouade.';
  if(label.includes('Finisher'))return 'Renforce les attaques finales des combos de trois coups.';
  if(label.includes('dégâts'))return 'Augmente les dégâts de toute l’escouade.';
  if(label.includes('PV'))return 'Renforce la survie de l’équipe.';
  if(label.includes('vitesse')||label.includes('Vitesse'))return 'Déplacements plus rapides pendant cette partie.';
  if(label.includes('Cadence'))return 'Attaques plus fréquentes pour toute l’équipe.';
  if(label.includes('Ranimer'))return 'Relève un héros tombé au combat.';
  return 'Amélioration active jusqu’à la fin de la partie.';
}
function gainXP(amount){
  if(!S||S.megaOnly)return;S.xp=(S.xp||0)+amount;
  while(S.xp>=S.xpNext){S.xp-=S.xpNext;S.level=(S.level||1)+1;S.xpNext=Math.round((S.xpNext||12)*1.28+4);S.pendingChoices=(S.pendingChoices||0)+1;S.pendingLevels=(S.pendingLevels||0)+1;banner('NIVEAU '+S.level+' · amélioration gagnée');snd(740,.16,'triangle')}
  hud();
}
function over(){if(S.mega){megaLose();return}
  S.mode='over';const o=$('ov');o.hidden=false;
  o.innerHTML='<div class="box"><h1>Escouade tombée</h1><p>Vous avez tenu jusqu’à la vague '+S.wave+' avec '+S.score+' points, '+(S.kills||0)+' ennemis vaincus.'+bestTxt()+'</p><button id="again">Rejouer</button><button id="chg">Changer d’équipe</button></div>';
  $('again').onclick=()=>{reset();startWave()};$('chg').onclick=()=>{reset();menu()};
}
