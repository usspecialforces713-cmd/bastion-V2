const SPC={'Tireur':12,'Fighter':12,'Médic':16,'Mage':14,'Assassin':10,'Néant':14,'Pyro':13,'Météore':15,'Géo':16,'PlantG':15,'Givre':14,'Volt':15,'Nécro':16,'Gardien':15,'Ingénieur':14,'Toxine':14,'Archer':14,'Ombre':12,'Samouraï':14,'Paladin':16,'Dragon':16,'Druide':16,'Mecha':18,'Miroir':12,'Boomerang':14,'Joker':14,'Pirate':16,'Chasseur':16,'Marée':16,'Vent':14,'Sable':15,'Magnétique':16};
const BEAMJSON={"metadata":{"version":4.7,"type":"Object","generator":"Object3D.toJSON"},"geometries":[{"uuid":"9529a7d5-b1b7-4a3e-b3c5-4b24e7351fbe","type":"BoxGeometry","name":"","width":1,"height":1,"depth":35,"widthSegments":1,"heightSegments":1,"depthSegments":1}],"materials":[{"uuid":"48c46ec9-1d02-49ac-bfad-e75d9765bfa2","type":"MeshStandardMaterial","blending":0,"side":0,"vertexColors":false,"opacity":1,"transparent":false,"depthFunc":3,"depthTest":true,"depthWrite":true,"colorWrite":true,"visible":true,"toneMapped":true,"name":"","color":30417,"roughness":1,"metalness":0,"emissive":0,"emissiveIntensity":0,"wireframe":false,"flatShading":false,"fog":true}],"object":{"uuid":"505b4d62-a1ce-4981-8a7e-20776feb25a7","type":"Mesh","name":"Box","castShadow":false,"receiveShadow":false,"visible":true,"frustumCulled":true,"renderOrder":0,"matrixAutoUpdate":true,"layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,11.958071928987202,-0.11759312657208465,1.9471712211412466,1],"up":[0,1,0],"geometry":"9529a7d5-b1b7-4a3e-b3c5-4b24e7351fbe","material":"48c46ec9-1d02-49ac-bfad-e75d9765bfa2"}};
function beamParts(){try{const o=new THREE.ObjectLoader().parse(BEAMJSON);if(o&&o.geometry&&o.material)return{geo:o.geometry,mat:o.material}}catch(e){}return{geo:new THREE.BoxGeometry(1,1,35),mat:new THREE.MeshStandardMaterial({color:0x0076d1})}}
function cards(){$('team').innerHTML='';C.forEach((c,i)=>{const d=document.createElement('div');d.className='card';d.onclick=()=>pick(i);d.innerHTML='<b>'+(i+1)+' '+c.r.name+'</b><i><u></u></i><em style="font-style:normal;font-size:12px;color:var(--gold)"></em>';$('team').appendChild(d);c.el=d});hud()}
function megaPick(){const o=$('ov');o.hidden=false;
  o.innerHTML='<div class="box"><h1>Méga boss !</h1><p>Un seul héros est dans l’arène à la fois, mais vous pouvez changer avec 1 à 7 ou Tab (délai de 1,5 s) : les autres se reposent et récupèrent des PV. Les attaques respectent la hauteur. Espace : saut (double saut possible). Clic ou J : attaquer. E : capacité. Détruisez les 4 piliers d’énergie en montant sur leur tour (sautez de plateforme en plateforme), puis frappez le boss quand son bouclier tombe. 3 phases.</p><h3>Votre équipe</h3><div id="pk1" class="pk"></div><h3>Héros supplémentaire</h3><div id="pk2" class="pk"></div></div>';
  const mk=(k,box)=>{const r=ROLES[k],b=document.createElement('button');b.className='hero';b.style.borderColor='#'+r.col.toString(16).padStart(6,'0');b.innerHTML='<b>'+r.name+'</b><span>'+DESC[k]+'</span>';b.onclick=()=>startMega(k);$(box).appendChild(b)};
  SEL.forEach(k=>mk(k,'pk1'));Object.keys(ROLES).filter(k=>!SEL.includes(k)).forEach(k=>mk(k,'pk2'))}
function startMega(k){
  setArenaMode('boss');$('ov').hidden=true;const saved=C;saved.forEach(c=>c.g.visible=false);
  let h=saved.find(c=>c.r==ROLES[k]);
  if(!h){const r=ROLES[k],g=human(r.col);scene.add(g);h={r,g,hp:r.hp,max:r.hp,cd:0,alive:true,inv:0,heal:0,spc:3,mv:false,t:0,extra:1}}
  if(!S.campaignMega){h.alive=true;h.hp=h.max;h.spc=3;}h.inv=1;h.vy=0;h.jc=0;h.tf=0;h.g.scale.setScalar(1);h.g.visible=true;h.g.position.set(0,0,-12);h.g.rotation.y=0;
  S.saved=saved;C=saved.includes(h)?saved:[...saved,h];C.forEach(c=>{c.vy=0;c.jc=0;c.tf=0;c.g.scale.setScalar(1);c.off=c!=h;c.g.visible=c==h&&c.alive;c.g.userData.ring.visible=false});
  [...E,...B,...F,...EP,...Z.map(z=>z.m)].forEach(o=>scene.remove(o));E=[];B=[];F=[];EP=[];Z=[];S.horde=false;S.toSpawn=0;
  const bp=beamParts(),bg=new THREE.Group(),sh=disc(.9,0x000000,.4);bg.position.y=.5;scene.add(bg);sh.position.y=.06;scene.add(sh);
  const bm=new THREE.Mesh(new THREE.DodecahedronGeometry(5,0),new THREE.MeshStandardMaterial({color:0x6a1fd0,emissive:0x3a0f80,emissiveIntensity:.5})),
    ball=new THREE.Mesh(new THREE.SphereGeometry(6.6,20,14),new THREE.MeshBasicMaterial({color:0x00d0ff,transparent:true,opacity:.22}));
  bm.add(ball);bm.position.set(0,5,0);bm.userData={mx:200,hp:200,boss:true,mega:1,shield:true,sp:0,rad:5.5,pts:2};scene.add(bm);E.push(bm);
  S.mega={ph:1,boss:bm,key:k,bg,bp,sh,ball,ba:0,w:.6,t:0,armed:2,bt:2,at:5,win:0,pil:[],g:null};
  megaBeams();megaBuild();A=h;cards();pick(C.indexOf(h));banner('MÉGA BOSS · PHASE 1');S.mode='play'}
function megaBuild(){const M=S.mega;if(M.g)scene.remove(M.g);M.g=new THREE.Group();scene.add(M.g);PL=[];M.pil=[];
  const base=M.ph*.55,bm=new THREE.MeshStandardMaterial({color:0x0076d1,transparent:true,opacity:.85});
  for(let k=0;k<4;k++){const a=base+k*Math.PI/2,px=Math.sin(a)*15,pz=Math.cos(a)*15,ux=-Math.sin(a),uz=-Math.cos(a),sx=Math.cos(a),sz=-Math.sin(a);
    const plat=(x,z,r,top,h)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),bm);m.position.set(x,top-h/2,z);M.g.add(m);PL.push({x,z,r,y:top,h})};
    plat(px,pz,2.2,5.4,5.4);plat(px+ux*4.6+sx*1.6,pz+uz*4.6+sz*1.6,1.8,3.6,.5);plat(px+ux*8.6-sx*.6,pz+uz*8.6-sz*.6,1.8,1.8,.5);
    const cr=new THREE.Mesh(new THREE.CylinderGeometry(.6,.9,3.5,8),new THREE.MeshStandardMaterial({color:0x66e0ff,emissive:0x22aaff,emissiveIntensity:1}));cr.position.set(px,7.15,pz);M.g.add(cr);
    M.pil.push({x:px,z:pz,top:5.4,hp:100,max:100,m:cr})}}
function megaBeams(){const M=S.mega;while(M.bg.children.length)M.bg.remove(M.bg.children[0]);const n=[0,1,2,2][M.ph];
  for(let k=0;k<n;k++){const m=new THREE.Mesh(M.bp.geo,M.bp.mat.clone());m.material.transparent=true;m.material.emissive.setHex(0x0076d1);m.material.emissiveIntensity=.7;m.rotation.y=k*Math.PI/2;M.bg.add(m)}}
function phys(c,dt){const p=c.g.position;c.vy=(c.vy||0)-30*dt;p.y+=c.vy*dt;let gy=0;
  for(const q of PL){if(Math.hypot(p.x-q.x,p.z-q.z)<q.r&&p.y>=q.y-.7&&q.y>gy)gy=q.y}
  if(p.y<=gy&&c.vy<=0){p.y=gy;c.vy=0;c.jc=0}
  for(const q of PL){if(q.h>1){const d=Math.hypot(p.x-q.x,p.z-q.z),m=q.r+.5;if(d<m&&p.y<q.y-.3){const k=d||.01;p.x=q.x+(p.x-q.x)/k*m;p.z=q.z+(p.z-q.z)/k*m}}}}
function bomb(x,z){const m=disc(3,0xff3a1a,.4);m.position.set(x,.15,z);scene.add(m);
  Z.push({c:null,t:1.2,k:0,m,end(){flash({x,z},3.2,0xff3a1a);burst(new THREE.Vector3(x,1,z),0xff6a1a);for(const c of C)if(c.alive&&c.inv<=0&&Math.hypot(c.g.position.x-x,c.g.position.z-z)<3.2&&c.g.position.y<3)hurt(c,28)},run(z2,dt){m.material.opacity=.25+.3*(1-z2.t/1.2)}})}
function megaUpdate(dt){const M=S.mega,b=M.boss,u=b.userData,h=A;if(!h||!M)return;
  b.position.set(0,5,0);phys(h,dt);
  M.sw=Math.max(0,(M.sw||0)-dt);M.hu=(M.hu||0)-dt;C.forEach(c=>{if(c.off){c.spc-=dt;if(c.alive)c.hp=Math.min(c.max,c.hp+c.max*.03*dt)}});if(M.hu<=0){M.hu=.5;hud()}
  {const p=h.g.position,bd=Math.hypot(p.x,p.z);if(bd<6&&p.y<9){const k=bd||.01;p.x=p.x/k*6;p.z=p.z/k*6}}
  for(const e of E){if(e==b)continue;const ep=e.position,m=6+e.userData.rad,d=Math.hypot(ep.x,ep.z);if(d<m){const k=d||.01;ep.x=ep.x/k*m;ep.z=ep.z/k*m}
    for(const q of PL)if(q.h>1){const dx=ep.x-q.x,dz=ep.z-q.z,dd=Math.hypot(dx,dz),mm=q.r+e.userData.rad;if(dd<mm){const k=dd||.01;ep.x=q.x+dx/k*mm;ep.z=q.z+dz/k*mm}}}M.t+=dt;const q=h.g.position;M.sh.position.set(q.x,.06,q.z);M.sh.scale.setScalar(Math.max(.4,1-q.y*.08));M.ball.visible=!!u.shield;
  let n=0;
  for(const p of M.pil){if(p.hp<=0)continue;n++;
    if(Math.hypot(q.x-p.x,q.z-p.z)<3&&q.y>=p.top-.4){p.hp-=20*dt;line({x:q.x,z:q.z},{x:p.x,z:p.z},0x66e0ff,q.y+1.4,.12);
      if(p.hp<=0){p.m.visible=false;burst(new THREE.Vector3(p.x,6,p.z),0x66e0ff);flash({x:p.x,z:p.z},4,0x66e0ff);snd(400,.3,'triangle')}}
    p.m.scale.y=Math.max(.05,p.hp/p.max);p.m.material.emissiveIntensity=.5+Math.sin(M.t*8)*.4}
  if(u.shield&&n==0&&!u.ko){u.shield=false;M.win=18;banner('Boss vulnérable !')}
  if(!u.shield&&!u.ko){M.win-=dt;if(M.win<=0){u.shield=true;megaBuild();banner('Le bouclier revient')}}
  M.ba+=M.w*dt;M.bg.rotation.y=M.ba;M.bg.visible=!!u.shield;const on=u.shield&&M.t>M.armed;
  M.bg.children.forEach((m,k)=>{m.material.opacity=on?.9:.25;if(on&&h.alive&&h.inv<=0&&q.y<1.2){const th=M.ba+k*Math.PI/2,al=q.x*Math.sin(th)+q.z*Math.cos(th),pp=Math.abs(q.x*Math.cos(th)-q.z*Math.sin(th));if(Math.abs(al)<17.5&&pp<1.1)hurt(h,25)}});
  if(u.shield){M.bt-=dt;if(M.bt<=0){M.bt=[3,2.4,1.8][M.ph-1];bomb(q.x,q.z)}}
  if(u.shield){M.sn=(M.sn||2)-dt;if(M.sn<=0){M.sn=[2.6,2,1.5][M.ph-1];const dx=q.x,dy=q.y+1-5,dz=q.z,L=Math.hypot(dx,dy,dz)||1;eshot(b.position,dx/L,dz/L,14,14,0xff3a3a,dy/L)}}
  if(M.ph>=2&&u.shield){M.at-=dt;if(M.at<=0){M.at=8;for(let i=0;i<M.ph;i++)spawn()}}
  $('boss').childNodes[0].textContent='MÉGA BOSS · PHASE '+M.ph+'/3 · '+(u.shield?'PILIERS '+n:'VULNÉRABLE '+Math.ceil(M.win)+'s')+' ';
  if(u.ko)megaNext()}
function megaNext(){const M=S.mega,u=M.boss.userData;if(M.ph>=3){megaWin();return}
  M.ph++;u.ko=0;u.hp=u.mx=[0,200,320,480][M.ph];u.shield=true;M.t=0;M.bt=2;M.at=5;M.w=[0,.6,.9,1.15][M.ph];M.armed=2;
  for(const e of E.slice())if(e!=M.boss){burst(e.position,0xffffff);scene.remove(e);E.splice(E.indexOf(e),1)}
  EP.forEach(o=>scene.remove(o));EP=[];A.hp=Math.min(A.max,A.hp+A.max*.4);hud();megaBeams();megaBuild();banner('PHASE '+M.ph)}
function megaClean(){const M=S.mega;if(!M)return;[M.g,M.bg,M.sh,M.boss,...E,...EP,...Z.map(z=>z.m)].forEach(o=>scene.remove(o));E=[];EP=[];Z=[];PL=[];
  C.forEach(c=>{if(c.extra)scene.remove(c.g)});C=S.saved;C.forEach(c=>c.off=false);
  C.forEach((c,i)=>{c.vy=0;c.jc=0;c.inv=.6;c.g.visible=!!c.alive;c.g.position.set((i-(C.length-1)/2)*3,0,0)});
  A=C.find(c=>c.alive)||C[0];S.mega=null;setArenaMode('normal');cards();pick(C.indexOf(A));$('boss').childNodes[0].textContent='BOSS'}
function megaWin(){const k=S.mega.key;const campaign=!!S.campaignMega;megaClean();S.score+=500;banner('Méga boss vaincu !');S.campaignMega=false;
  if(campaign){S.mode='transition';$('ov').hidden=true;setTimeout(()=>{if(S.mode==='transition'){S.mode='play';startWave()}},900);hud();return}
  if(S.megaOnly){S.mode='over';const o=$('ov');o.hidden=false;o.innerHTML='<div class="box"><h1>Victoire !</h1><p>Le méga boss est vaincu.</p><button id="a1">Rejouer</button><button id="a2">Menu</button></div>';$('a1').onclick=()=>startMega(k);$('a2').onclick=()=>{reset();menu()}}}
function megaLose(){const k=S.mega.key;S.mode='over';const o=$('ov');o.hidden=false;
  o.innerHTML='<div class="box"><h1>Défaite</h1><p>Le méga boss a vaincu votre héros.</p><button id="a1">Réessayer</button><button id="a2">Abandonner</button></div>';
  $('a1').onclick=()=>{megaClean();startMega(k)};$('a2').onclick=()=>{megaClean();if(S.megaOnly){reset();menu()}else{S.mode='play';$('ov').hidden=true}}}
