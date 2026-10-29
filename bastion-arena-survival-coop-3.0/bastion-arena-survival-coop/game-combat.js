const DESC={tireur:'Tir à distance. Spécial : Kamehameha.',guerrier:'Coups très rapides qui repoussent. Spécial : rafale.',medic:'Soigne l’escouade. Spécial : aura de soin.',mage:'Explosions en zone. Spécial : boule géante.',assassin:'Très rapide. Spécial : charge et lames.',neant:'Trous noirs qui aspirent puis explosent.',pyro:'Jets de flammes. Spécial : lasso de feu qui attire et brûle.',meteor:'Lance de gros rochers. Spécial : météore géante.',terre:'Escaliers de terre en ligne droite. Spécial : séisme sur toute la map.',plant:'Tire des graines. Spécial : plante géante qui attrape et projette au loin.',
 givre:'Éclats de glace qui ralentissent. Spécial : blizzard qui gèle puis brise.',volt:'Champ électrique devant lui qui ralentit. Spécial : tempête d’éclairs.',
 necro:'Invoque des squelettes. Spécial : golem géant et renforts.',gardien:'Coup de bouclier qui attire les ennemis. Spécial : barrière protectrice.',
 ingenieur:'Pistolet. Spécial : tourelles et mines.',toxine:'Fioles qui laissent des flaques. Spécial : nuage toxique qui suit les ennemis.',
 archer:'Flèches qui transpercent la ligne. Spécial : pluie de flèches.',ombre:'Se téléporte derrière l’ennemi et frappe. Spécial : clones d’ombre.',
 samourai:'Sabre à longue portée. Spécial : Iaido, des entailles qui s’ouvrent à la fin.',
 paladin:'Rayon sacré qui blesse les ennemis et soigne les alliés. Spécial : résurrection et sanctuaire.',
 dragon:'Souffle de flammes. Spécial : devient un dragon géant.',druide:'Lance des épines. Spécial : se transforme en ours ou en loup.',mecha:'Mitrailleuse. Spécial : robot géant avec missiles.',
 miroir:'Faibles tirs. Spécial : copie la dernière capacité utilisée.',boomerang:'Lame qui part et revient. Spécial : lames qui tournent puis traversent l’arène.',
 joker:'Effets aléatoires. Spécial : roulette à 7 résultats.',pirate:'Boulets de canon explosifs. Spécial : navire qui bombarde un côté.',chasseur:'Chaînes qui immobilisent. Spécial : cage sur l’ennemi le plus fort.',
 maree:'Jets d’eau qui repoussent. Spécial : tsunami qui traverse l’arène.',vent:'Bourrasque qui repousse, ralentit et renvoie les tirs ennemis. Spécial : tornade qui aspire puis disperse.',
 sable:'Jets de sable qui aveuglent. Spécial : tempête de sable qui ronge.',magnet:'Orbe qui regroupe les ennemis à distance, émetteur répulsif. Spécial : aimant géant qui colle puis explose.'};
const TOUCH=matchMedia('(pointer:coarse)').matches;
const CHARGED_MOVES={
  guerrier:{name:'Brise-garde',kind:'melee',min:.25,max:1.25,color:0xffc857,desc:'Frappe lourde en arc'},
  gardien:{name:'Onde du rempart',kind:'slam',min:.35,max:1.4,color:0x72c9ff,desc:'Onde de choc autour du tank'},
  samourai:{name:'Iaido solaire',kind:'melee',min:.2,max:1.1,color:0xffe4a3,desc:'Entaille rapide et longue'},
  tireur:{name:'Rayon perforant',kind:'shot',min:.25,max:1.35,color:0x66e7ff,desc:'Tir chargé à longue portée'},
  archer:{name:'Flèche du faucon',kind:'shot',min:.25,max:1.3,color:0x8effa7,desc:'Flèche chargée'},
  mage:{name:'Nova arcanique',kind:'shot',min:.35,max:1.5,color:0xc7a0ff,desc:'Projectile explosif renforcé'},
  meteor:{name:'Impact céleste',kind:'slam',min:.45,max:1.5,color:0xff8c55,desc:'Explosion autour du point de lancement'},
  pyro:{name:'Fournaise',kind:'shot',min:.3,max:1.25,color:0xff633d,desc:'Orbe de feu chargé'},
  dragon:{name:'Souffle draconique',kind:'shot',min:.35,max:1.5,color:0xffb347,desc:'Souffle concentré'}
};

// 3.0: the lobby/menus live in ui.js. menu() kept for older calls.
function menu(){if(typeof UI!=='undefined')UI.lobby()}
reset();

const near=(p,list)=>list.reduce((b,o)=>{const d=Math.hypot(o.position.x-p.x,o.position.z-p.z);return d<b.d?{o,d}:b},{o:null,d:1e9});
function shoot(c,a,col){const m=new THREE.Mesh(bGeo,new THREE.MeshBasicMaterial({color:col}));
  m.position.set(c.g.position.x,c.g.position.y+1.5,c.g.position.z);m.userData={v:new THREE.Vector3(Math.sin(a),0,Math.cos(a)).multiplyScalar(30),l:1.2,d:S.dm+(c.r==ROLES.medic?0:1),aoe:c.r==ROLES.mage,source:c};scene.add(m);B.push(m)}
function tryDodge(){
  if(!A||!A.alive||S.mode!=='play'||A.dodgeCd>0||A.dodgeT>0)return;
  const c=A,p=c.g.position;let x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0),z=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0);
  const l=Math.hypot(x,z);
  if(l<.05){x=Math.sin(c.g.rotation.y);z=Math.cos(c.g.rotation.y)}else{x/=l;z/=l}
  c.dodgeT=.19;c.dodgeCd=1.15;c.dodgeX=x;c.dodgeZ=z;c.inv=Math.max(c.inv||0,.34);c.dodgeFlash=.22;
  flash({x:p.x,z:p.z},1.35,c.r.col);burst(new THREE.Vector3(p.x,.55,p.z),c.r.col);QK=Math.max(QK,.08);snd(210,.08,'triangle');
  const el=$('dodge');if(el){el.classList.add('active');setTimeout(()=>el.classList.remove('active'),220)}
}
function combatImpact(position,color=0xffc857,big=false){
  QK=Math.max(QK,big?.2:.075);S.hitStop=Math.max(S.hitStop||0,big?.045:.018);
  if(position)flash({x:position.x,z:position.z},big?1.7:.7,color);
}

function attackStyle(c){
  const r=c.r;
  if(r.melee)return (r===ROLES.gardien||r===ROLES.samourai||r===ROLES.terre)?'heavy':'melee';
  if(r===ROLES.mage||r===ROLES.neant||r===ROLES.givre||r===ROLES.volt||r===ROLES.pyro||r===ROLES.meteor||r===ROLES.necro||r===ROLES.druide||r===ROLES.plant||r===ROLES.toxine||r===ROLES.medic||r===ROLES.paladin||r===ROLES.vent||r===ROLES.sable)return 'cast';
  if(r===ROLES.archer||r===ROLES.chasseur||r===ROLES.tireur||r===ROLES.ingenieur||r===ROLES.mecha||r===ROLES.pirate||r===ROLES.boomerang||r===ROLES.magnet)return 'ranged';
  if(r===ROLES.ombre||r===ROLES.joker||r===ROLES.miroir)return 'trick';
  return 'ranged';
}
function beginCombatAttack(c){
  const now=performance.now();
  if(!c.comboAt||now-c.comboAt>1350){c.comboCount=0;c.finisherReady=false}
  c.comboAt=now;
  if(!c.finisherReady)c.comboCount=Math.min(3,(c.comboCount||0)+1);
  if(c.comboCount>=3&&!c.finisherReady){
    c.finisherReady=true;
    if(c===A)snd(540,.12,'triangle');
  }
  c.attackAnim=.36;c.attackStyle=attackStyle(c);
}
function updateComboHud(){
  const box=$('combo-hud'),count=$('combo-count'),note=$('combo-note');
  if(!box||!A)return;
  const ready=!!A.finisherReady,now=performance.now();
  if(A.comboAt&&now-A.comboAt>1350&&!ready){A.comboCount=0}
  count.textContent=String(ready?3:(A.comboCount||0));
  note.textContent=ready?'ATTAQUE FINALE PRÊTE':(A.comboCount||0)===2?'Encore 1 coup !':'enchaîne les attaques';
  box.classList.toggle('ready',ready);
  if(ready&&A.comboHudWasReady!==true){box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop')}
  A.comboHudWasReady=ready;
}

// Movesets spécifiques : maintenir R puis relâcher pour une attaque chargée.

function chargedMoveFor(c){return c&&CHARGED_MOVES[Object.keys(ROLES).find(k=>ROLES[k]===c.r)]||null}
function releaseChargedAttack(c){
  if(!c||!c.chargeT||c.chargeT<=0)return;
  const cfg=chargedMoveFor(c),t=c.chargeT;c.chargeT=0;c.isCharging=false;
  if(!cfg||!c.alive||S.mode!=='play')return;
  const power=Math.max(0,Math.min(1,(t-cfg.min)/(cfg.max-cfg.min))),mult=1.35+power*1.65,p=c.g.position,ang=c.g.rotation.y;
  c.attackAnim=.5;c.attackStyle=cfg.kind==='melee'?'heavy':'cast';
  flash(p,1.1+power*1.8,cfg.color);burst(new THREE.Vector3(p.x,p.y+1,p.z),cfg.color);snd(180+power*260,.18,'triangle');
  if(cfg.kind==='melee'||cfg.kind==='slam'){
    const radius=(cfg.kind==='slam'?4.2:3.2)+power*2.3;
    slash(p,ang,radius,cfg.color,1.1+power*.65);
    for(let i=E.length-1;i>=0;i--){const e=E[i],dx=e.position.x-p.x,dz=e.position.z-p.z,d=Math.hypot(dx,dz);if(d<radius+(e.userData.rad||0)&&(cfg.kind==='slam'||adf(dx,dz,ang)<1.05+power*.2)&&hv(p,e)){hitE(i,(c.r.mdmg||2)+S.dm+mult*(c.r.mdmg||2),null);if(c.r.kb){const l=d||1;e.position.x+=dx/l*c.r.kb*(1+power);e.position.z+=dz/l*c.r.kb*(1+power)}}}
  }else{
    const n=B.length;shoot(c,ang,cfg.color);const b=B[B.length-1];if(b&&b.userData){b.userData.d=((b.userData.d||1)+S.dm)*mult;b.userData.l=1.5+power*.65;b.userData.v.multiplyScalar(1+power*.6);b.userData.aoe=c.r===ROLES.mage||c.r===ROLES.meteor;b.userData.rad=power*.7;b.userData.charged=1}
  }
  banner(cfg.name+' · '+Math.round(mult*100)+'%');combatImpact(p,cfg.color,true);
}
function updateChargeHud(){
  let el=$('moveset-hud');if(!el)return;const cfg=chargedMoveFor(A);
  if(!A||!cfg){el.hidden=true;return}el.hidden=false;
  const ct=A.chargeT||0,ratio=Math.min(1,ct/cfg.max),key=cfg.name+LANG+Math.round(ratio*50);if(el.dataset.k===key){el.classList.toggle('charging',!!A.isCharging);return}el.dataset.k=key;el.innerHTML='<b>'+cfg.name+'</b><span>'+(LANG==='en'?'Hold R · release to strike':'Maintenir R · relâcher pour frapper')+'</span><i><u style="width:'+(ratio*100)+'%;background:#'+cfg.color.toString(16).padStart(6,'0')+'"></u></i>';
  el.classList.toggle('charging',!!A.isCharging);
}

function act(c,dt,ctrl){
  const p=c.g.position,spd=c.r.spd*S.sm*(c.spm||1)*(c.tf>0?(c.tk=='wolf'&&c.r==ROLES.druide?1.8:c.r==ROLES.mecha?.85:1):1);let mx=0,mz=0;c.cd-=dt;c.inv=Math.max(0,(c.inv||0)-dt);c.dodgeCd=Math.max(0,(c.dodgeCd||0)-dt);c.dodgeT=Math.max(0,(c.dodgeT||0)-dt);CY=p.y;
  let en=near(p,E);if(!ctrl&&S.focusTarget&&E.includes(S.focusTarget)&&S.focusTarget.userData.hp>0){const fe=S.focusTarget;en={o:fe,d:Math.hypot(fe.position.x-p.x,fe.position.z-p.z)}}const r=c.r;let wantFire=false,face=null;
  if(ctrl){
    mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0);
    mz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0);mx+=JV.x;mz+=JV.z;
    ray.setFromCamera(mouse,cam);if(ray.ray.intersectPlane(plane,aim))face=Math.atan2(aim.x-p.x,aim.z-p.z);
    wantFire=down||(keys.Space&&!S.mega)||keys.KeyJ;
    // Touch devices: auto-aim + auto-fire at the nearest enemy when not aiming manually (Brawl-style).
    if(TOUCH&&!down&&en.o&&en.d<15){face=Math.atan2(en.o.position.x-p.x,en.o.position.z-p.z);wantFire=true;if(c==A){aim.set(en.o.position.x,1,en.o.position.z)}}
  }else{
    const tx=en.o?en.o.position.x-p.x:0,tz=en.o?en.o.position.z-p.z:0,l=en.d||1;
    if(en.o)face=Math.atan2(tx,tz);
    if((r==ROLES.guerrier||r==ROLES.assassin||r==ROLES.gardien||(r==ROLES.druide&&c.tf>0))&&en.o){mx=tx/l;mz=tz/l}
    else if((r==ROLES.tireur||r==ROLES.mage||r==ROLES.neant||r==ROLES.meteor||r==ROLES.plant||r.kite)&&en.o){const k=en.d<(r==ROLES.mage?10:8)?-1:en.d>13?.6:0;mx=tx/l*k;mz=tz/l*k}
    else if(r==ROLES.terre&&en.o){const k=en.d<5?-.6:en.d>8?1:0;mx=tx/l*k;mz=tz/l*k}
    else if((r==ROLES.pyro||r==ROLES.volt||r==ROLES.samourai||r==ROLES.paladin||r==ROLES.dragon||r==ROLES.maree||r==ROLES.vent||r==ROLES.sable)&&en.o){const k=en.d<3.5?-.7:en.d>5?1:0;mx=tx/l*k;mz=tz/l*k}
    else if(r==ROLES.medic){const w=C.filter(o=>o.alive&&o!=c).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0]||A,dx=w.g.position.x-p.x,dz=w.g.position.z-p.z,d=Math.hypot(dx,dz);
      if(d>4){mx=dx/d;mz=dz/d}else if(en.o&&en.d<6){mx=-tx/l;mz=-tz/l}}
    wantFire=en.o&&(r.melee?en.d<r.melee*.9:(r==ROLES.pyro||r==ROLES.volt||r==ROLES.dragon||r==ROLES.maree||r==ROLES.vent||r==ROLES.sable)?en.d<6.5:r==ROLES.terre?en.d<11:en.d<15);
  }
  if(!ctrl&&ORD&&A&&c!=A){const hx=A.g.position.x-p.x,hz=A.g.position.z-p.z,hd=Math.hypot(hx,hz)||1;
    if(ORD==1&&hd>7){mx=hx/hd;mz=hz/hd}else if(ORD==2){if(hd>3.5){mx=hx/hd;mz=hz/hd}else{mx=0;mz=0}}}
  const cfgCharge=chargedMoveFor(c);if(ctrl&&cfgCharge&&keys.KeyR&&S.mode==='play'){c.isCharging=true;c.chargeT=Math.min(cfgCharge.max,(c.chargeT||0)+dt);c.cd=Math.max(c.cd,0)}
  const ml=Math.hypot(mx,mz);c.mv=ml>.05;
  if(ctrl&&c.dodgeT>0){p.x+=(c.dodgeX||0)*spd*3.15*dt;p.z+=(c.dodgeZ||0)*spd*3.15*dt;c.mv=true;}
  else if(c.mv){p.x+=mx/(ml>1?ml:1)*spd*dt;p.z+=mz/(ml>1?ml:1)*spd*dt}
  const pl=Math.hypot(p.x,p.z);if(pl>R-1){p.x*=(R-1)/pl;p.z*=(R-1)/pl}
  if(face!==null)c.g.rotation.y=face;
  c.spc-=dt;if(c.tf>0){c.tf-=dt;if(c.tf<=0)c.g.scale.setScalar(1)}
  if(r==ROLES.magnet){for(const e of E){const ex=e.position.x-p.x,ez=e.position.z-p.z,d=Math.hypot(ex,ez)||.1,m=3.2+e.userData.rad;if(d<m){e.position.x=p.x+ex/d*m;e.position.z=p.z+ez/d*m}}}
  if(c.spc<=0&&(ctrl?(keys.KeyE||rdown):(en.o&&en.d<(r.melee?6:r==ROLES.medic?99:16)&&(r!=ROLES.medic||C.some(o=>o.alive&&o.hp<o.max*.5))))){c.spc=SPC[r.name]*(c.cdr||1);snd(120,.35,'sawtooth');const n0=Z.length,rr=(r==ROLES.miroir&&LS?LS:r);special(c);tagZ(n0,ELEM[rr.name],c)}
  if(wantFire&&c.cd<=0){
    beginCombatAttack(c);c.cd=r.rate*S.rm;
    const projectileStart=B.length;
    if(c.tf>0)tfAtk(c);
    else if(r.melee){
      const w=r==ROLES.guerrier?1.1:r==ROLES.assassin?.92:r==ROLES.samourai?.78:1.4,fa=c.g.rotation.y,finisher=!!c.finisherReady;
      slash(p,fa,r.melee+(finisher?1.4:.6),r.col,finisher?w+.25:w);
      for(let j=E.length-1;j>=0;j--){
        const e=E[j],ex=e.position.x-p.x,ez=e.position.z-p.z;
        if(Math.hypot(ex,ez)<r.melee+(finisher?1.4:0)+e.userData.rad&&adf(ex,ez,fa)<w+(finisher?.45:.35)&&hv(p,e)){
          let dmg=r.mdmg+S.dm;if(finisher)dmg*=1.7+(S.comboBonus||0);
          let mc=false;if(c===A&&Math.random()<(.12+(S.critBonus||0))){dmg*=2;mc=true;combatImpact(e.position,0xffc857,true)}
          else if(c===A)combatImpact(e.position,finisher?0xffc857:r.col,finisher);
          if(r.kb){const dd=Math.hypot(ex,ez)||1,k=r.kb*(e.userData.boss?.3:1)*(finisher?1.65:1);e.position.x+=ex/dd*k;e.position.z+=ez/dd*k;e.userData.hold=.15}
          hitE(j,dmg,null,mc);
        }
      }
      if(finisher){c.finisherReady=false;c.comboCount=0;flash(p,3.5,0xffc857);QK=Math.max(QK,.18);S.hitStop=Math.max(S.hitStop||0,.055)}
    }
    else if(r==ROLES.pyro)flame(c);else if(r==ROLES.givre)shootX(c.g.position.x,c.g.position.z,c.g.rotation.y,0x9fe8ff,{slow:1});else if(r==ROLES.volt)field(c);else if(r==ROLES.necro)skel(c,false);else if(r==ROLES.toxine)vial(c,ctrl?aim:(en.o?en.o.position:null));else if(r==ROLES.archer)arrow(c);else if(r==ROLES.ombre)blink(c);else if(r==ROLES.paladin)holyRay(c);else if(r==ROLES.dragon)breathe(c);else if(r==ROLES.druide)thorn(c);else if(r==ROLES.mecha)gun(c);else if(r==ROLES.miroir)shootX(c.g.position.x,c.g.position.z,c.g.rotation.y,0xf4f4f4,{d:.5+S.dm*.3});else if(r==ROLES.boomerang)boom(c);else if(r==ROLES.joker)joke(c);else if(r==ROLES.pirate)cannon(c);else if(r==ROLES.chasseur)shootX(c.g.position.x,c.g.position.z,c.g.rotation.y,0xbbbbbb,{snare:1,d:S.dm+1.5,l:1.1});else if(r==ROLES.maree)jet(c);else if(r==ROLES.vent)gust(c);else if(r==ROLES.sable)sandjet(c);else if(r==ROLES.magnet)magShot(c);else if(r==ROLES.plant){shoot(c,c.g.rotation.y-.08,r.col);shoot(c,c.g.rotation.y+.08,r.col)}else if(r==ROLES.terre)stairs(c);else if(r==ROLES.meteor)rock(c,ctrl?aim:(en.o?en.o.position:null));else if(r==ROLES.neant)hole(c,ctrl?aim:(en.o?en.o.position:null),false);else shoot(c,c.g.rotation.y,r.col);
    if(c.finisherReady&&B.length>projectileStart){
      const fresh=B.slice(projectileStart);
      fresh.forEach(b=>{if(b.userData){b.userData.d=(b.userData.d||1)*(1.7+(S.comboBonus||0));b.userData.source=c;b.userData.finisher=1}});
      c.finisherReady=false;c.comboCount=0;flash(p,2.4,0xffc857);QK=Math.max(QK,.12);
    }
  }
  if(r==ROLES.medic){c.heal-=dt;if(c.heal<=0){c.heal=1.2;flash(p,6,0xb06bff);C.forEach(o=>{if(o.alive&&Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z)<6)o.hp=Math.min(o.max,o.hp+5)});hud()}}
  c.t+=dt*(c.mv?10:2.2);const u=c.g.userData,s=c.mv?Math.sin(c.t)*.72:Math.sin(c.t)*.035;
  u.legs[0].rotation.x=s;u.legs[1].rotation.x=-s;
  u.arms[0].rotation.x=c.mv?-s*.8:-.08;u.arms[1].rotation.x=c.mv?s*.8:-1.12;
  u.arms[0].rotation.z=c.mv?-.08:0;u.arms[1].rotation.z=c.mv?.08:0;
  c.attackAnim=Math.max(0,(c.attackAnim||0)-dt);if(c===A)updateChargeHud();
  const phase=c.attackAnim>0?1-c.attackAnim/.36:0,atk=c.attackAnim>0?Math.sin(Math.PI*Math.max(0,Math.min(1,phase))):0;
  const style=c.attackStyle||attackStyle(c);
  if(c.attackAnim>0){
    if(style==='melee'){u.arms[1].rotation.x=-.1-atk*1.65+(phase<.22?.55:0);u.arms[1].rotation.z=atk*.52;u.arms[0].rotation.x=-.25-atk*.25;if(u.torso)u.torso.rotation.y=Math.sin(phase*Math.PI)*.18;}
    else if(style==='heavy'){u.arms[1].rotation.x=-.15-atk*2.0+(phase<.28?.65:0);u.arms[1].rotation.z=atk*.25;u.arms[0].rotation.x=-.35-atk*.35;if(u.torso){u.torso.rotation.x=-atk*.16;u.torso.rotation.y=Math.sin(phase*Math.PI)*.1;}}
    else if(style==='cast'){u.arms[0].rotation.x=-.45-atk*.85;u.arms[1].rotation.x=-.5-atk*1.05;u.arms[0].rotation.z=-.2-atk*.24;u.arms[1].rotation.z=.2+atk*.24;if(u.torso)u.torso.rotation.x=-atk*.1;}
    else if(style==='trick'){u.arms[0].rotation.x=-.2-atk*.8;u.arms[1].rotation.x=-.1-atk*1.8;u.arms[1].rotation.z=atk*.7;if(u.torso)u.torso.rotation.y=Math.sin(phase*Math.PI)*.22;}
    else {u.arms[0].rotation.x=-.2-atk*.35;u.arms[1].rotation.x=-1.05-atk*.55;u.arms[1].rotation.z=atk*.18;if(u.torso)u.torso.rotation.x=-atk*.06;}
  }else if(u.torso){u.torso.rotation.x=0;u.torso.rotation.y*=.72;}
  if(u.torso)u.torso.position.y=1.57+Math.sin(c.t*2)*(c.mv?.045:.018)+(c.attackAnim>0?atk*.045:0);
  if(u.weapon){const recoil=style==='heavy'?-.95:style==='melee'?-.8:style==='cast'?-.22:style==='trick'?-.65:-.38;u.weapon.rotation.x=(c.mv?Math.sin(c.t)*.08:Math.sin(c.t*.5)*.025)+(c.attackAnim>0?atk*recoil:0);u.weapon.rotation.z=c.attackAnim>0?atk*(style==='melee'?.48:style==='trick'?.6:.14):0;}
  if(c.dodgeT>0){u.torso.rotation.x=-.2;u.arms[0].rotation.z=-.45;u.arms[1].rotation.z=.45;}else if(u.torso)u.torso.rotation.x*=.72;
  if(u.aura){if(c.dodgeFlash>0){c.dodgeFlash-=dt;u.aura.material.opacity=.42}else u.aura.material.opacity=(c===A?.24:.13)+Math.sin(c.t*1.8)*.035;u.aura.scale.setScalar(1+Math.sin(c.t*1.5)*.035)}
  // Accessory idle motion (halo, spell orb, cape) and invulnerability blink.
  const tt=performance.now()*.001;if(u.halo){u.halo.position.y=2.72+Math.sin(tt*2.4+c.t*.1)*.05;u.halo.rotation.z+=dt}if(u.orb)u.orb.position.y=-.85+Math.sin(tt*4)*.06;if(u.cape)u.cape.rotation.x=.12+(c.mv?.35:0)+Math.sin(tt*3)*.04;
  c.g.visible=!c.off&&c.alive&&!(c.inv>0&&c.inv<.7&&c.dodgeT<=0&&Math.sin(tt*40)>.6);
}
