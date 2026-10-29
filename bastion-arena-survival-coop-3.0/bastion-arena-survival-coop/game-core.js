const R=22,$=id=>document.getElementById(id);
// ───────── Bastion 3.0 — settings, renderer, neon arena ─────────
const SETTINGS=(()=>{const s={q:(matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||8)<=4)?'low':'high',shake:1,nums:1};try{Object.assign(s,JSON.parse(localStorage.getItem('bastion-settings'))||{})}catch(e){}return s})();
function saveSettings(){try{localStorage.setItem('bastion-settings',JSON.stringify(SETTINGS))}catch(e){}}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x05040f);scene.fog=new THREE.FogExp2(0x080420,.011);
const cam=new THREE.PerspectiveCamera(52,1,.1,400);
const ren=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.05;
$('c').appendChild(ren.domElement);
// Free GPU memory when temporary objects leave the scene (long runs no longer slow down).
const KEEP=o=>{if(o){o.userData=o.userData||{};o.userData.keep=true}return o};
function disposeObj(root){root.traverse(o=>{if(o.geometry&&!(o.geometry.userData&&o.geometry.userData.keep))o.geometry.dispose();
  const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!(m.userData&&m.userData.keep))m.dispose()})})}
{const _rm=scene.remove.bind(scene);scene.remove=function(...objs){_rm(...objs);for(const o of objs){if(o&&!o.userData.noDispose&&!o.userData.keep)try{disposeObj(o)}catch(e){}}return scene}}
// Bloom post-processing (Ultra) or plain rendering (Fast).
let composer=null,bloomPass=null;
function setupRenderer(){ren.setPixelRatio(Math.min(devicePixelRatio,SETTINGS.q==='high'?1.75:1.1));composer=null;
  if(SETTINGS.q==='high'&&THREE.EffectComposer&&THREE.UnrealBloomPass&&THREE.RenderPass){try{composer=new THREE.EffectComposer(ren);composer.addPass(new THREE.RenderPass(scene,cam));
    bloomPass=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.9,.5,.58);composer.addPass(bloomPass);
    if(THREE.GammaCorrectionShader&&THREE.ShaderPass)composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));}catch(e){console.warn('Bloom off',e);composer=null}}
  rs()}
function rs(){ren.setSize(innerWidth,innerHeight);if(composer){composer.setSize(innerWidth,innerHeight)}cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
function renderFrame(){if(composer)composer.render();else ren.render(scene,cam)}
addEventListener('resize',rs);
// Canvas-generated textures: crisp neon art without downloading images.
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;return tx}
const THEMES={normal:{a:0x19f0ff,b:0xff2bd6,c:0x7c4dff,fog:0x080420,bg:0x05040f},boss:{a:0xff2e4d,b:0xffa31a,c:0xff4fd8,fog:0x1a0407,bg:0x0c0204}};
const NEON_A=KEEP(new THREE.MeshBasicMaterial({color:THEMES.normal.a})),NEON_B=KEEP(new THREE.MeshBasicMaterial({color:THEMES.normal.b})),NEON_C=KEEP(new THREE.MeshBasicMaterial({color:THEMES.normal.c}));
const NEON_A_SOFT=KEEP(new THREE.MeshBasicMaterial({color:THEMES.normal.a,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));
const NEON_B_SOFT=KEEP(new THREE.MeshBasicMaterial({color:THEMES.normal.b,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}));
const hemi=new THREE.HemisphereLight(0x7d8cff,0x140a26,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xe6e9ff,.55);sun.position.set(10,24,8);scene.add(sun);
const lightA=new THREE.PointLight(THEMES.normal.a,1.4,46,1.6);lightA.position.set(-14,7,-8);scene.add(lightA);
const lightB=new THREE.PointLight(THEMES.normal.b,1.4,46,1.6);lightB.position.set(14,7,8);scene.add(lightB);
const normalArena=new THREE.Group();normalArena.name='Neon_Arena';scene.add(normalArena);
// Floor: dark glass with a glowing hex grid.
const floorTex=canvasTex(1024,1024,(g,w,h)=>{g.fillStyle='#070a1d';g.fillRect(0,0,w,h);const s=64,hh=s*Math.sqrt(3)/2;
  g.lineWidth=2.2;for(let row=-1;row<h/hh+2;row++)for(let col=-1;col<w/(s*1.5)+2;col++){const x=col*s*1.5,y=row*hh*2+(col%2?hh:0);g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i;g.lineTo(x+Math.cos(a)*s*.98,y+Math.sin(a)*s*.98)}g.closePath();
    const r=Math.random();g.strokeStyle=r<.06?'rgba(25,240,255,.9)':r<.09?'rgba(255,43,214,.85)':'rgba(56,84,170,.55)';g.stroke();if(r<.025){g.fillStyle='rgba(25,240,255,.12)';g.fill()}}});
floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(5,5);
const floorMat=new THREE.MeshStandardMaterial({color:0x8a96c8,map:floorTex,emissive:0xffffff,emissiveMap:floorTex,emissiveIntensity:.55,metalness:.65,roughness:.32});
const floor=new THREE.Mesh(new THREE.CircleGeometry(R+.6,96),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.045;normalArena.add(floor);
const torusGeo=KEEP(new THREE.TorusGeometry(1,.06,8,128));
const arenaRings=[];for(const [r,mat,tb] of [[R,NEON_A,.09],[R*.72,NEON_B_SOFT,.05],[R*.45,NEON_A_SOFT,.05],[R*.2,NEON_B,.06]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,tb,6,160),mat);ring.rotation.x=Math.PI/2;ring.position.y=.03;normalArena.add(ring);arenaRings.push(ring)}
// Center reactor
const arenaDark=KEEP(new THREE.MeshStandardMaterial({color:0x0d1230,metalness:.8,roughness:.25})),arenaMetal=KEEP(new THREE.MeshStandardMaterial({color:0x232a55,metalness:.85,roughness:.22}));
const reactor=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,.18,6),arenaDark);reactor.position.y=.04;normalArena.add(reactor);
const core=new THREE.Mesh(new THREE.OctahedronGeometry(.8,0),NEON_A);core.position.y=1.1;normalArena.add(core);
const holo=[];for(let i=0;i<3;i++){const h=new THREE.Mesh(new THREE.TorusGeometry(1.4+i*.55,.035,6,64),i%2?NEON_B:NEON_A);h.position.y=1.1;h.rotation.x=Math.PI/2+i*.5;normalArena.add(h);holo.push(h)}
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.9,26,16,1,true),NEON_A_SOFT);beam.position.y=13;normalArena.add(beam);
// Barrier wall with glowing top strips
const wallGeo=new THREE.BoxGeometry(2.55,1.1,.5),stripGeo=new THREE.BoxGeometry(2.55,.09,.54);
for(let i=0;i<48;i++){if(i%12===0)continue;const a=i/48*Math.PI*2,x=Math.sin(a)*(R+.9),z=Math.cos(a)*(R+.9),w=new THREE.Mesh(wallGeo,arenaDark);w.position.set(x,.55,z);w.rotation.y=a;normalArena.add(w);
  const s=new THREE.Mesh(stripGeo,i%2?NEON_A:NEON_B);s.position.set(x,1.12,z);s.rotation.y=a;normalArena.add(s)}
// Light towers (kept the "pylons" array so animations keep working)
const pylons=[];const towerGeo=new THREE.BoxGeometry(.7,7,.7),edgeGeo=new THREE.BoxGeometry(.08,7,.08),crystalGeo=new THREE.OctahedronGeometry(.6,0),lightCone=new THREE.CylinderGeometry(.1,1.2,9,12,1,true);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,g=new THREE.Group();const t=new THREE.Mesh(towerGeo,arenaMetal);t.position.y=3.5;g.add(t);
  for(const [ex,ez] of [[.36,.36],[-.36,.36],[.36,-.36],[-.36,-.36]]){const e=new THREE.Mesh(edgeGeo,i%2?NEON_B:NEON_A);e.position.set(ex,3.5,ez);g.add(e)}
  const crystal=new THREE.Mesh(crystalGeo,i%2?NEON_B:NEON_A);crystal.position.y=7.9;g.add(crystal);const cone=new THREE.Mesh(lightCone,i%2?NEON_B_SOFT:NEON_A_SOFT);cone.position.y=3.4;g.add(cone);
  g.position.set(Math.sin(a)*(R+3.4),0,Math.cos(a)*(R+3.4));normalArena.add(g);pylons.push({g,crystal,phase:i*.8})}
// Stadium tiers + crowd lights
const tierMat=KEEP(new THREE.MeshStandardMaterial({color:0x0a0d24,metalness:.6,roughness:.5,side:THREE.DoubleSide}));
for(let k=0;k<4;k++){const r=R+5+k*3.2,m=new THREE.Mesh(new THREE.CylinderGeometry(r+3.2,r,1.6,64,1,true),tierMat);m.position.y=1.2+k*1.9;normalArena.add(m);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(r+3.1,.07,6,160),k%2?NEON_B:NEON_A);lip.rotation.x=Math.PI/2;lip.position.y=2+k*1.9;normalArena.add(lip)}
{const N=700,dots=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.22,.22),new THREE.MeshBasicMaterial({vertexColors:false}),N),m4=new THREE.Matrix4(),col=new THREE.Color(),pal=[0x19f0ff,0xff2bd6,0x7c4dff,0xffffff,0xffd166];
  for(let i=0;i<N;i++){const k=Math.random()*4|0,r=R+6+k*3.2+Math.random()*2.6,a=Math.random()*Math.PI*2;m4.makeTranslation(Math.sin(a)*r,1.5+k*1.9+Math.random()*.6,Math.cos(a)*r);dots.setMatrixAt(i,m4);dots.setColorAt(i,col.setHex(pal[Math.random()*pal.length|0]).multiplyScalar(.5+Math.random()*.8))}
  dots.instanceColor.needsUpdate=true;normalArena.add(dots)}
// Cyber city skyline
const winTex=canvasTex(128,256,(g,w,h)=>{g.fillStyle='#05071a';g.fillRect(0,0,w,h);for(let y=6;y<h;y+=12)for(let x=6;x<w;x+=12){const r=Math.random();if(r<.45){g.fillStyle=r<.08?'#ff2bd6':r<.18?'#19f0ff':r<.3?'#ffd166':'#3a4a9a';g.fillRect(x,y,6,7)}}});
const cityMat=KEEP(new THREE.MeshStandardMaterial({color:0x10142e,map:winTex,emissive:0xffffff,emissiveMap:winTex,emissiveIntensity:.9,metalness:.4,roughness:.6}));
{const N=170,city=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),cityMat,N),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),ps=new THREE.Vector3();
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2+Math.random()*.05,r=52+Math.random()*48,hgt=8+Math.pow(Math.random(),1.6)*58;ps.set(Math.sin(a)*r,hgt/2-2,Math.cos(a)*r);q.setFromAxisAngle(new THREE.Vector3(0,1,0),a);sc.set(4+Math.random()*7,hgt,4+Math.random()*7);m4.compose(ps,q,sc);city.setMatrixAt(i,m4)}
  normalArena.add(city)}
// Sky dome with gradient + stars
const sky=new THREE.Mesh(new THREE.SphereGeometry(190,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(0x05030f)},mid:{value:new THREE.Color(0x2a0b4d)},low:{value:new THREE.Color(0xff2bd6)}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,mid,low;varying vec3 vP;void main(){float h=vP.y;vec3 c=mix(mid,top,smoothstep(.05,.6,h));c=mix(low*.55,c,smoothstep(-.05,.16,h));gl_FragColor=vec4(c,1.);}'}));
scene.add(sky);
{const N=900,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random()*Math.PI*2,v=Math.random()*.9+.08,r=170;pos[i*3]=Math.cos(u)*Math.cos(v)*r;pos[i*3+1]=Math.sin(v)*r;pos[i*3+2]=Math.sin(u)*Math.cos(v)*r}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(new THREE.Points(gg,new THREE.PointsMaterial({color:0xcfd8ff,size:.8,fog:false,transparent:true,opacity:.8})))}
// Holographic billboards
const billboards=[];for(let i=0;i<3;i++){const word=['BASTION','ARENA','NEON'][i];const tx=canvasTex(512,128,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.fillRect(0,0,w,h);g.font='900 92px "Chakra Petch",Arial Black,sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor=i%2?'#ff2bd6':'#19f0ff';g.shadowBlur=24;g.fillStyle=i%2?'#ff8bea':'#9ffcff';g.fillText(word,w/2,h/2+4)});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(22,5.5),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));const a=Math.PI+(i-1)*.75;p.position.set(Math.sin(a)*48,24+i*3,Math.cos(a)*48);p.lookAt(0,16,0);normalArena.add(p);billboards.push(p)}
// Laser sweeps
const lasers=[];for(let i=0;i<2;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,220),i?NEON_B_SOFT:NEON_A_SOFT);l.position.y=42;normalArena.add(l);lasers.push(l)}
function setArenaMode(mode){S.arenaMode=mode;const th=THEMES[mode==='boss'?'boss':'normal'];
  NEON_A.color.setHex(th.a);NEON_B.color.setHex(th.b);NEON_C.color.setHex(th.c);NEON_A_SOFT.color.setHex(th.a);NEON_B_SOFT.color.setHex(th.b);lightA.color.setHex(th.a);lightB.color.setHex(th.b);
  scene.fog.color.setHex(th.fog);scene.background.setHex(th.bg);sky.material.uniforms.low.value.setHex(mode==='boss'?0xff3a1a:0xff2bd6);sky.material.uniforms.mid.value.setHex(mode==='boss'?0x3a0808:0x2a0b4d);
  floorMat.emissive.setHex(mode==='boss'?0xff8a8a:0xffffff);beam.visible=mode!=='boss';core.visible=holo[0].visible=holo[1].visible=holo[2].visible=mode!=='boss'}
function updateArena(dt,time){core.rotation.y+=dt*.8;core.rotation.x+=dt*.3;holo.forEach((h,i)=>{h.rotation.z+=dt*(.4+i*.25)*(i%2?-1:1);h.rotation.x+=dt*.15});
  for(const p of pylons){p.crystal.rotation.y+=dt*1.2;p.crystal.position.y=7.9+Math.sin(time*1.6+p.phase)*.25}
  lasers.forEach((l,i)=>{l.rotation.y=time*(.25+i*.12)+i*2;l.rotation.x=.35+Math.sin(time*.4+i)*.15});beam.visible=S&&S.mode==='menu'&&S.arenaMode!=='boss';billboards.forEach((b,i)=>{b.material.opacity=.75+.25*Math.sin(time*2.3+i*2)*(Math.random()<.02?0:1)});
  NEON_A_SOFT.opacity=.28+.08*Math.sin(time*2);beam.scale.x=beam.scale.z=1+.08*Math.sin(time*5)}
setupRenderer();

const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
// Role silhouettes: every hero gets a recognisable accessory instead of only a colour.
const HERO_KIT={tireur:'gun',ingenieur:'gun',mecha:'gun',pirate:'gun',magnet:'gun',archer:'bow',chasseur:'bow',boomerang:'bow',
  guerrier:'sword',assassin:'daggers',samourai:'katana',ombre:'daggers',gardien:'shield',terre:'shield',paladin:'halo',medic:'halo',
  mage:'hat',neant:'hat',givre:'hat',volt:'hat',pyro:'hat',meteor:'hat',necro:'hood',toxine:'hood',druide:'hood',plant:'hood',
  dragon:'horns',joker:'hat',miroir:'halo',maree:'hood',vent:'hood',sable:'hood'};
const SHADOW_GEO=KEEP(new THREE.CircleGeometry(.75,20)),SHADOW_MAT=KEEP(new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.32,depthWrite:false}));
function human(col,kit){
  const tint=new THREE.Color(0x24324f).lerp(new THREE.Color(col),.28);
  const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.32,metalness:.3,roughness:.4}),
    armor=new THREE.MeshStandardMaterial({color:tint,metalness:.65,roughness:.32}),
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
  const shadow=new THREE.Mesh(SHADOW_GEO,SHADOW_MAT);shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;g.add(shadow);g.userData.shadow=shadow;
  addKit(g,kit,col,armor,trim,part);
  return g;
}
function addKit(g,kit,col,armor,trim,part){
  if(!kit)return;const arm=g.userData.arms[1],off=g.userData.arms[0],glow=new THREE.MeshBasicMaterial({color:col});
  if(kit==='sword'||kit==='katana'){g.userData.weapon.visible=false;const L=kit==='katana'?1.5:1.15;
    const b=part(new THREE.BoxGeometry(.09,.06,L),new THREE.MeshStandardMaterial({color:0xe8eef8,metalness:.9,roughness:.15,emissive:col,emissiveIntensity:.25}),0,-.72,L/2+.05,arm);
    part(new THREE.BoxGeometry(.34,.08,.08),trim,0,-.72,.06,arm);arm.userData.blade=b}
  else if(kit==='daggers'){g.userData.weapon.visible=false;for(const a of [arm,off])part(new THREE.BoxGeometry(.07,.05,.55),new THREE.MeshStandardMaterial({color:0xdfe6f2,metalness:.9,roughness:.2,emissive:col,emissiveIntensity:.35}),0,-.72,.3,a)}
  else if(kit==='shield'){const sh=part(new THREE.BoxGeometry(.12,.95,.75),armor,-.2,-.5,.22,off);part(new THREE.BoxGeometry(.13,.5,.12),trim,-.27,-.5,.22,off);sh.rotation.y=.15}
  else if(kit==='gun'){part(new THREE.BoxGeometry(.1,.1,.6),armor,.61,1.4,1.05,g.userData.weapon);part(new THREE.BoxGeometry(.13,.13,.08),trim,.61,1.4,1.37,g.userData.weapon)}
  else if(kit==='bow'){g.userData.weapon.visible=false;const bow=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,6,20,Math.PI),trim);bow.rotation.set(0,Math.PI/2,Math.PI/2);bow.position.set(-.05,-.7,.25);off.add(bow)}
  else if(kit==='halo'){const h=part(new THREE.TorusGeometry(.32,.04,6,24),glow,0,2.72,0);h.rotation.x=Math.PI/2;g.userData.halo=h}
  else if(kit==='hat'){part(new THREE.CylinderGeometry(.5,.5,.05,16),m(),0,2.47,0);const c=part(new THREE.ConeGeometry(.3,.75,12),m(),0,2.85,-.04);c.rotation.x=-.18;
    const orb=part(new THREE.SphereGeometry(.15,10,8),glow,0,-.85,.12,off);g.userData.orb=orb}
  else if(kit==='hood'){const h=part(new THREE.SphereGeometry(.36,12,10,0,Math.PI*2,0,Math.PI*.62),m(),0,2.31,-.05);h.scale.set(1,1.08,1.08);
    const cape=part(new THREE.BoxGeometry(.7,1.1,.05),m(),0,1.55,-.47);cape.rotation.x=.12;g.userData.cape=cape}
  else if(kit==='horns'){for(const s of [-1,1]){const h=part(new THREE.ConeGeometry(.08,.42,8),trim,s*.2,2.55,-.05);h.rotation.z=-s*.5}}
  function m(){return new THREE.MeshStandardMaterial({color:new THREE.Color(col).multiplyScalar(.55),roughness:.7,metalness:.1})}
}
// Floating health bar above heroes and tough enemies.
const BAR_BG=KEEP(new THREE.MeshBasicMaterial({color:0x05070f,transparent:true,opacity:.75,depthTest:false})),BAR_GEO=KEEP(new THREE.PlaneGeometry(1,1));
function addBar(obj,w,y,col){const g=new THREE.Group(),bg=new THREE.Mesh(BAR_GEO,BAR_BG),fg=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true}));
  bg.scale.set(w+.08,.2,1);fg.scale.set(w,.13,1);fg.position.z=.01;bg.renderOrder=20;fg.renderOrder=21;g.add(bg);g.add(fg);g.position.y=y;g.userData={fg,w,y};obj.userData.bar=g;scene.add(g);g.userData.owner=obj;BARS.push(g);return g}
const BARS=[];
function updateBars(){for(let i=BARS.length-1;i>=0;i--){const b=BARS[i],o=b.userData.owner,c=o.userData.hero;let ratio,show;
  if(c){ratio=Math.max(0,c.hp/c.max);show=c.alive&&!c.off&&o.visible&&(c!==A||ratio<1)}else{if(!o.parent){scene.remove(b);BARS.splice(i,1);continue}ratio=Math.max(0,o.userData.hp/o.userData.mx);show=ratio<1&&!o.userData.mega}
  b.visible=show&&S.mode!=='menu';if(!b.visible)continue;const p=o.position;b.position.set(p.x,p.y+(c?b.userData.y*o.scale.y:b.userData.y),p.z);b.quaternion.copy(cam.quaternion);
  const f=b.userData.fg;f.scale.x=Math.max(.001,b.userData.w*ratio);f.position.x=-(b.userData.w*(1-ratio))/2;
  if(c)f.material.color.setHex(ratio<.3?0xff4d6d:ratio<.6?0xffc857:0x5ee6a0)}}
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
const bGeo=KEEP(new THREE.SphereGeometry(.22,8,8)),fxGeo=KEEP(new THREE.BoxGeometry(.25,.25,.25));Object.values(G).forEach(KEEP);
let S,C=[],A=null,E=[],B=[],F=[],Z=[],SEL=['tireur','guerrier','medic','mage'],QK=0,LS=null,EP=[],JV={x:0,z:0},joy=null,ORD=0,PL=[],CY=0;
const keys={},mouse=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-1),aim=new THREE.Vector3();
let down=false,rdown=false;addEventListener('contextmenu',e=>e.preventDefault());
const typing=e=>{const t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)};
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;down=false;rdown=false;if(S&&S.mode==='play')pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&S.mode==='play')pause()});
addEventListener('keydown',e=>{if(typing(e))return;
  if(S&&S.mode==='up'&&/^Digit[1-3]$/.test(e.code)){const b=document.querySelectorAll('.upgrade-card')[+e.code.slice(5)-1];if(b){e.preventDefault();b.click()}return}
  if(e.code==='KeyM'&&!e.repeat&&typeof setMuted==='function'){setMuted(!MUTED);return}
  keys[e.code]=true;
  if(e.code=='Space'||e.code=='Tab')e.preventDefault();
  if((e.code=='ShiftLeft'||e.code=='ShiftRight')&&!e.repeat&&S.mode=='play')tryDodge();
  if(e.code=='KeyP'||e.code=='Escape'){if(S.mode=='pause')resume();else pause()}if(e.code=='KeyV'&&S.mode=='play')cycleOrd();if(e.code=='KeyF'&&!e.repeat&&S.mode=='play')focusTarget();
  if(e.code=='Space'&&!e.repeat&&S.mega&&S.mode=='play'&&A&&(A.jc||0)<2){A.vy=12;A.jc=(A.jc||0)+1}
  if(S.mode=='play'){if(e.code=='Digit1')pick(0);if(e.code=='Digit2')pick(1);if(e.code=='Digit3')pick(2);if(e.code=='Digit4')pick(3);if(e.code=='Digit5')pick(4);if(e.code=='Digit6')pick(5);if(e.code=='Digit7')pick(6);
    if(e.code=='Tab'){for(let i=1;i<=C.length;i++){const n=(C.indexOf(A)+i)%C.length;if(C[n].alive){pick(n);break}}}}});
addEventListener('keyup',e=>{if(typing(e))return;keys[e.code]=false;if(e.code==='KeyR'&&typeof releaseChargedAttack==='function')releaseChargedAttack(A)});
// Only clicks on the 3D view fire (clicking menus/buttons no longer shoots). Touch: left side = visual joystick.
const JOY_EL=()=>$('joy');
addEventListener('pointerdown',e=>{if(e.target.tagName!=='CANVAS')return;
  if(e.pointerType=='touch'&&e.clientX<innerWidth*.45&&!joy){joy={id:e.pointerId,x:e.clientX,y:e.clientY};const j=JOY_EL();if(j){j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.classList.add('on');j.firstElementChild.style.transform='translate(-50%,-50%)'}}
  else{mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);if(e.button==2)rdown=true;else down=true}});
const endPointer=e=>{if(joy&&e.pointerId==joy.id){joy=null;JV.x=0;JV.z=0;const j=JOY_EL();if(j)j.classList.remove('on')}else{down=false;rdown=false}};
addEventListener('pointerup',endPointer);addEventListener('pointercancel',endPointer);
addEventListener('pointermove',e=>{if(joy&&e.pointerId==joy.id){let dx=e.clientX-joy.x,dz=e.clientY-joy.y;const l=Math.hypot(dx,dz),mx=55;if(l>mx){dx*=mx/l;dz*=mx/l}JV.x=dx/mx;JV.z=dz/mx;const j=JOY_EL();if(j)j.firstElementChild.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dz+'px))'}else mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)});

function pick(i){const n=C[i];if(!n||!n.alive)return;
  if(S.mega&&A&&n!=A){if(A.alive&&(S.mega.sw||0)>0)return;const o=A,p=o.g.position;n.g.position.set(p.x,p.y,p.z);n.vy=o.vy||0;n.jc=o.jc||0;n.g.rotation.y=o.g.rotation.y;o.off=true;o.g.visible=false;n.off=false;n.g.visible=true;n.inv=Math.max(n.inv,.8);flash(p,2.5,n.r.col);burst(p,n.r.col);S.mega.sw=1.5}
  A=n;C.forEach(c=>c.g.userData.ring.visible=c==A);hud()}
function focusTarget(){if(!A)return;let best=null,bd=1e9;for(const e of E){const d=Math.hypot(e.position.x-A.g.position.x,e.position.z-A.g.position.z);if(d<bd){bd=d;best=e}}if(best){S.focusTarget=best;banner(t('focus'));flash(best.position,2.1,0xffc857)}}
function reset(){
  [...C.map(c=>c.g),...E,...B,...F,...EP,...Z.map(z=>z.m),...BARS].forEach(o=>scene.remove(o));E=[];B=[];F=[];EP=[];Z=[];C=[];BARS.length=0;
  S={score:0,wave:0,rm:1,dm:0,sm:1,mode:'menu',toSpawn:0,spT:0,xp:0,xpNext:12,level:1,pendingChoices:0,pendingLevels:0,runKills:0,hitStop:0,combo:0,comboT:0,focusTarget:null,critBonus:0,killHeal:0,comboBonus:0};
  SEL.map(k=>ROLES[k]).forEach((r,i)=>{const col=typeof UI!=='undefined'?UI.skinCol(SEL[i]):r.col,g=human(col,HERO_KIT[SEL[i]]);g.position.set((i-(SEL.length-1)/2)*3,0,0);scene.add(g);
    const hc={r,g,key:SEL[i],hp:r.hp,max:r.hp,cd:0,alive:true,inv:0,heal:0,spc:3,mv:false,t:Math.random()*6,comboCount:0,comboAt:0,finisherReady:false,attackAnim:0};g.userData.hero=hc;addBar(g,1.3,3.25,0x5ee6a0);C.push(hc)});
  pick(0);
  buildCards();
  hud();
}
function buildCards(){$('team').innerHTML='';C.forEach((c,i)=>{const d=document.createElement('button');d.type='button';d.className='card';d.onclick=()=>pick(i);
  d.style.setProperty('--hero-color','#'+c.r.col.toString(16).padStart(6,'0'));
  d.innerHTML='<b><kbd>'+(i+1)+'</kbd> '+c.r.name+'</b><i><u></u></i><em></em>';$('team').appendChild(d);c.el=d});hud()}
function hud(){
  $('w').textContent=S.wave;$('s').textContent=S.score;const xp=$('xp');if(xp)xp.textContent=t('level')+' '+(S.level||1)+' · XP '+(S.xp||0)+'/'+(S.xpNext||12);const xb=document.querySelector('#xp-bar u');if(xb)xb.style.width=Math.min(100,(S.xp||0)/(S.xpNext||12)*100)+'%';$('ord').textContent=t(['ordAttack','ordFollow','ordDefend'][ORD])+' · V';$('ord').title=t('orderTip');
  C.forEach(c=>{if(!c.el)return;c.el.className='card'+(c==A?' on':'')+(c.alive?'':' dead');c.el.querySelector('u').style.width=Math.max(0,c.hp/c.max*100)+'%'});
}
let BAN_T=0,BAN_PRI=0;
function banner(t,ms=1400){const b=$('ban');if(!b)return;b.textContent=t;b.style.opacity=1;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');clearTimeout(BAN_T);BAN_T=setTimeout(()=>b.style.opacity=0,ms)}
function startWave(){S.wave++;setArenaMode('normal');const md=S.modeId||'survival',w=S.wave;
  const megaEvery=md==='bossrush'?4:md==='blitz'?0:5;
  if(megaEvery&&w%megaEvery==0){S.megaOnly=false;S.campaignMega=true;S.mode='pick';hud();megaPick();return}
  let n=Math.round((12+w*5)*(.6+.15*C.length)*(w%4==3?1.5:1)*(S.spawnMul||1));S.horde=w%4==3&&md!=='bossrush';let bosses=0,label;
  if(md==='bossrush'){n=Math.round(n*.45);bosses=Math.min(6,1+(w/2|0));label=t('w_boss',{w})}
  else if(md==='blitz'){n=Math.round(n*1.4);bosses=w%3==0?1+(w/6|0):0;label=bosses?t('w_mini',{w}):t('w_wave',{w})}
  else{bosses=w%2==0?1+(w/4|0):0;label=bosses?t('w_mini',{w}):S.horde?t('w_horde',{w}):t('w_wave',{w})}
  S.toSpawn=n;for(let i=0;i<bosses;i++)spawn('b');S.spT=1.4;S.mode='play';$('ov').hidden=true;$('ov').className='';banner(label);hud()}
// Enemy roster: [hp, speed, colour, radius, points]. New in 3.0: k = Charger, x = Bomber, p = Splitter, n = Sniper.
G.k=KEEP(new THREE.ConeGeometry(.75,2.1,4).rotateX(Math.PI/2));G.x=KEEP(new THREE.SphereGeometry(.78,14,10));G.p=KEEP(new THREE.DodecahedronGeometry(1.15,0));G.n=KEEP(new THREE.OctahedronGeometry(.75,0).scale(.8,1.6,.8));
function enemyStats(t,w){return{c:[1+(w/4|0),2.6+.12*w,0xff4d7a,.9,1],f:[1,4.2+.12*w,0xffd166,.6,1],t:[6+w,1.6+.05*w,0xa66bff,1.5,3],s:[1,5.5+.1*w,0xff8a3a,.55,1],b:[60+w*10,1.5,0xff1f4b,2.4,5],r:[1+(w/5|0),2.4+.05*w,0xb6ff3a,.8,2],
  k:[3+(w/3|0),3.2,0xff2e63,.9,2],x:[2+(w/4|0),4.4,0xffa31a,.78,2],p:[5+(w/2|0),2.3,0x7dff3a,1.15,3],n:[2+(w/5|0),2.6,0xd04dff,.75,3]}[t]}
function spawn(bt,at){
  const w=S.wave,r=Math.random();let t=bt||'c';
  if(!bt){if(S.horde)t='s';else if(w>=6&&r<.07)t='n';else if(w>=5&&r<.15)t='p';else if(w>=4&&r<.25)t='x';else if(w>=3&&r<.37)t='k';else if(w>=2&&Math.random()<.18)t='r';else if(w>=5&&r<.5)t='t';else if(w>=3&&r<.62)t='f';else if(w>=2&&r<.8)t='s'}
  const d=enemyStats(t,w),hp=Math.max(1,Math.round(d[0]*(S.enemyHp||1)));
  const m=new THREE.Mesh(G[t],new THREE.MeshStandardMaterial({color:d[2],emissive:d[2],emissiveIntensity:.45,metalness:.4,roughness:.3,flatShading:true}));
  // Glowing core + energy shell (blooms in Ultra graphics).
  const shell=new THREE.Mesh(G[t],ENEMY_SHELL[t]||(ENEMY_SHELL[t]=KEEP(new THREE.MeshBasicMaterial({color:new THREE.Color(d[2]).lerp(new THREE.Color(0xffffff),.35),wireframe:true,transparent:true,opacity:.5}))));shell.scale.setScalar(1.18);m.add(shell);
  const coreM=new THREE.Mesh(ENEMY_CORE,ENEMY_CORE_MAT);coreM.scale.setScalar(d[3]*.5);m.add(coreM);
  const a=Math.random()*6.283;if(at)m.position.set(at.x,1,at.z);else m.position.set(Math.cos(a)*(R-1),1,Math.sin(a)*(R-1));
  m.userData={mx:hp,boss:t=='b',rng:t=='r'||t=='n',hp,sp:Math.min(d[1]*(S.enemySpd||1),9.5),rad:d[3],pts:d[4],type:t,spawnT:at?.15:.45,ai:'kxpn'.includes(t)?t:null,st:'chase',stT:1+Math.random()*1.5,noSpin:t=='k'||t=='n'};
  m.scale.setScalar(.01);scene.add(m);E.push(m);
  flash(m.position,d[3]+.8,d[2]);
  if(hp>=4)addBar(m,Math.min(3.2,.9+d[3]*.8),d[3]+1.3,t=='b'?0xff3b5c:0xffc857);
  return m;
}
const ENEMY_SHELL={},ENEMY_CORE=KEEP(new THREE.IcosahedronGeometry(.5,0)),ENEMY_CORE_MAT=KEEP(new THREE.MeshBasicMaterial({color:0xfff4d6}));
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
  S.mode='up';down=false;const o=$('ov');o.hidden=false;o.className='ui-screen upgrade';
  const title=(S.pendingLevels||0)>0?t('upTitleLevel',{l:S.level}):t('upTitleWave',{w:S.wave});
  o.innerHTML='<div class="up-wrap"><div class="up-kick">'+t('upLeft',{n:S.pendingChoices||1})+'</div><h1 class="up-title">'+title+'</h1><p class="up-sub">'+t('upPick')+'</p><div id="opts" class="upgrade-options"></div></div>';
  [...UP].sort(()=>Math.random()-.5).slice(0,3).forEach((u,i)=>{const idx=UP.indexOf(u),rar=idx>=3&&idx<=5?'epic':idx<=2||idx==10?'rare':'common',b=document.createElement('button');b.className='upgrade-card '+rar;
    const [label,desc]=upText(u[0],A.r.name);b.innerHTML='<span class="upgrade-index">'+(i+1)+'</span><span class="rar">'+t(rar)+'</span><span class="up-ic">'+['✦','⚡','🛡','❤','➜','🔥','💥','⟲'][idx%8]+'</span><b>'+label+'</b><small>'+(desc||upgradeDescription(u[0]))+'</small>';
    b.style.animationDelay=(i*.08)+'s';
    b.onclick=()=>{u[1]();if((S.pendingLevels||0)>0)S.pendingLevels--;S.pendingChoices=Math.max(0,(S.pendingChoices||1)-1);hud();if(S.pendingChoices>0)showUpgradeChoice(false);else startWave()};$('opts').appendChild(b)});
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
  while(S.xp>=S.xpNext){S.xp-=S.xpNext;S.level=(S.level||1)+1;S.xpNext=Math.round((S.xpNext||12)*1.28+4);S.pendingChoices=(S.pendingChoices||0)+1;S.pendingLevels=(S.pendingLevels||0)+1;banner(t('lvlBanner',{l:S.level}));snd(740,.16,'triangle')}
  hud();
}
function over(){if(S.mega){megaLose();return}if(typeof UI!=='undefined'){UI.endMatch('defeat');return}
  S.mode='over';const o=$('ov');o.hidden=false;
  const rec=bestTxt();
  o.innerHTML='<div class="box over-box"><div class="eyebrow">FIN DE PARTIE</div><h1>Escouade tombée</h1><div class="pause-stats"><div><small>VAGUE</small><b>'+S.wave+'</b></div><div><small>SCORE</small><b>'+S.score+'</b></div><div><small>ÉLIMINATIONS</small><b>'+(S.kills||0)+'</b></div><div><small>NIVEAU</small><b>'+(S.level||1)+'</b></div></div><p>'+rec+'</p><div class="pause-actions"><button id="again" class="primary-action">REJOUER <span>↻</span></button><button id="chg" class="secondary-action">CHANGER D’ÉQUIPE</button></div></div>';
  $('again').onclick=()=>{reset();startWave()};$('chg').onclick=()=>{reset();menu()};
}
// Narrow bridge for the optional co-op client; solo gameplay remains unchanged.
Object.defineProperty(window,'BastionGameBridge',{configurable:false,value:{getScene:()=>scene,getActiveHero:()=>A,getState:()=>S,startWave:()=>startWave()}});
