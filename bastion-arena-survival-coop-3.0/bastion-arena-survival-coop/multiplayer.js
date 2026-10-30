/* Bastion Arena Survival — couche réseau co-op 2 joueurs (v3.0.1).
 * Synchronise la salle, la position des joueurs, les événements de vague et le lancement.
 * La simulation des ennemis reste locale à chaque navigateur.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const CFG={serverUrl:window.BASTION_MULTIPLAYER_URL||'ws://localhost:8787'};
 const PING_MS=15000, SEND_MS=66, IDLE_SEND_MS=1000, MAX_RETRIES=5;
 let socket=null,joined=false,room=null,roomCode=null,playerId=null,peerId=null,isHost=false;
 let remote=null,remoteTarget=null,remoteRot=0,remoteFresh=false;
 let localName='Warrior',lastWave=-1,lastSend=0,lastPos=null,lastRot=0;
 let retries=0,retryTimer=null,pingTimer=null,pingMs=null,lastFrame=0;
 const status=$('mp-status'), modal=$('mp-modal'), msg=$('mp-message');
 const codeInput=()=>(($('mp-code')&&$('mp-code').value)||'').trim().toUpperCase();

 function setStatus(t){if(status)status.textContent=t}
 function say(t){if(msg)msg.textContent=t}
 function refreshStatus(){if(!joined||!room)return;setStatus('Salle '+room+' · '+(peerId?'2/2':'1/2')+(pingMs!=null?' · '+pingMs+' ms':''))}
 function open(){if(modal)modal.hidden=false}
 function close(){if(modal)modal.hidden=true}
 $('mp-open')?.addEventListener('click',open);$('mp-close')?.addEventListener('click',close);
 modal?.addEventListener('click',e=>{if(e.target===modal)close()});
 $('mp-create')?.addEventListener('click',()=>connect('create'));
 $('mp-join')?.addEventListener('click',()=>connect('join'));

 function url(){let u=CFG.serverUrl;if(location.protocol==='https:'&&u.startsWith('ws://'))u='wss://'+u.slice(5);return u}
 function send(data){if(socket&&socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(data))}

 function connect(action){
   if(socket&&socket.readyState===WebSocket.OPEN){send({type:action,room:codeInput(),name:localName});return}
   localName=(($('mp-name')&&$('mp-name').value)||'Warrior').trim().slice(0,20)||'Warrior';
   say('Connexion au serveur…');setStatus('Connexion…');
   openSocket({type:action,room:codeInput(),name:localName});
 }

 // Ouvre une connexion et envoie le message d'entrée (create, join ou reconnexion) à l'ouverture.
 function openSocket(entry){
   clearTimeout(retryTimer);
   let s;
   try{s=new WebSocket(url())}catch(e){say('URL WebSocket invalide. Vérifie la configuration du serveur.');return}
   socket=s;
   s.addEventListener('open',()=>{retries=0;send(entry);startPing()});
   s.addEventListener('message',e=>{let d;try{d=JSON.parse(e.data)}catch{return}handle(d)});
   s.addEventListener('close',()=>{if(s===socket)onClose()});
   s.addEventListener('error',()=>{if(s===socket&&!joined){say('Serveur indisponible. Déploie multiplayer-server puis configure son URL.');setStatus('Solo · serveur absent')}});
 }

 // Reconnexion automatique : 1 s, 2 s, 4 s… jusqu'à MAX_RETRIES tentatives, puis abandon.
 function onClose(){
   stopPing();socket=null;
   const wasInRoom=joined&&roomCode;
   joined=false;peerId=null;removeRemote();
   if(!wasInRoom){room=null;setStatus('Solo · déconnecté');say('Connexion fermée. Le mode solo reste disponible.');return}
   if(retries>=MAX_RETRIES){room=null;roomCode=null;setStatus('Solo · déconnecté');say('Connexion perdue. Recrée ou rejoins la salle.');return}
   const delay=Math.min(8000,1000*Math.pow(2,retries));retries++;
   setStatus('Salle '+roomCode+' · reconnexion…');
   say('Connexion perdue, nouvelle tentative dans '+Math.round(delay/1000)+' s…');
   retryTimer=setTimeout(()=>openSocket({type:'join',room:roomCode,name:localName}),delay);
 }

 function startPing(){stopPing();send({type:'ping',t:Date.now()});pingTimer=setInterval(()=>send({type:'ping',t:Date.now()}),PING_MS)}
 function stopPing(){clearInterval(pingTimer);pingTimer=null}

 function handle(d){
   if(d.type==='pong'){if(Number.isFinite(d.t)){pingMs=Math.max(0,Date.now()-d.t);refreshStatus()}return}
   if(d.type==='error'){say(d.message||'Erreur multijoueur');if(!joined&&roomCode){roomCode=null;room=null;retries=MAX_RETRIES}return}
   if(d.type==='joined'){joined=true;isHost=!!d.isHost;room=d.room;roomCode=d.room;retries=0;playerId=d.playerId;peerId=d.peerId||null;const codeEl=$('mp-code');if(codeEl)codeEl.value=room;refreshStatus();say(d.peerName?'Connecté avec '+d.peerName+'.':'Salle créée. Envoie le code '+room+' à ton ami.');close();return}
   if(d.type==='role'){isHost=!!d.isHost;return}
   if(d.type==='start'){say('Lancement de la partie…');if(window.BastionLaunch)window.BastionLaunch(d.mode,true);return}
   if(d.type==='peer-joined'){peerId=d.playerId;refreshStatus();say((d.name||'Ton ami')+' a rejoint la salle.');return}
   if(d.type==='peer-left'){peerId=null;removeRemote();refreshStatus();say('Ton coéquipier a quitté la salle.');return}
   if(d.type==='state'){if(d.playerId!==playerId)updateRemote(d);return}
   if(d.type==='event'&&d.playerId!==playerId){if(d.event==='wave')bannerSafe('Ton coéquipier commence la vague '+d.wave);if(d.event==='attack')remoteAttack(d);return}
 }

 function bannerSafe(t){const el=$('ban');if(el){el.textContent=t;el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1600)}}

 function makeRemote(){
   if(remote||!window.THREE||!window.BastionGameBridge)return;
   const g=new THREE.Group();
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.05,4,8),new THREE.MeshStandardMaterial({color:0x42e8d3,emissive:0x0b625e,emissiveIntensity:.65,roughness:.42,metalness:.35}));body.position.y=1.05;g.add(body);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),new THREE.MeshStandardMaterial({color:0xe1c6a1,roughness:.8}));head.position.y=1.9;g.add(head);
   const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.16),new THREE.MeshStandardMaterial({color:0xffc857,metalness:.7,roughness:.25,emissive:0x644010}));blade.position.set(.55,1.05,.1);blade.rotation.z=-.3;g.add(blade);
   g.position.set(2,0,2);g.userData.mpRemote=true;
   window.BastionGameBridge.getScene().add(g);remote=g;remoteFresh=true;
 }

 // Reçoit une position : elle sert de cible, et frame() la rejoint en douceur.
 function updateRemote(d){
   makeRemote();if(!remote)return;
   const p=d.position||{};
   remoteTarget={x:Number(p.x)||0,y:Number(p.y)||0,z:Number(p.z)||0};
   remoteRot=Number.isFinite(d.rotation)?d.rotation:0;
   if(remoteFresh){remote.position.set(remoteTarget.x,remoteTarget.y,remoteTarget.z);remote.rotation.y=remoteRot;remoteFresh=false}
   remote.visible=true;
 }

 // Lissage exponentiel : l'avatar distant glisse vers la dernière position reçue (≈ 12 par seconde).
 function smoothRemote(t){
   const dt=lastFrame?Math.min(.1,(t-lastFrame)/1000):0;lastFrame=t;
   if(!remote||!remoteTarget||!dt)return;
   const k=1-Math.exp(-dt*12);const p=remote.position;
   p.x+=(remoteTarget.x-p.x)*k;p.y+=(remoteTarget.y-p.y)*k;p.z+=(remoteTarget.z-p.z)*k;
   let dr=remoteRot-remote.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));remote.rotation.y+=dr*k;
 }

 function removeRemote(){
   remoteTarget=null;remoteFresh=false;
   if(remote&&window.BastionGameBridge){window.BastionGameBridge.getScene().remove(remote);remote.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}})}
   remote=null;
 }

 function remoteAttack(d){if(!remote||!window.THREE)return;const glow=new THREE.PointLight(0x5ee6d0,2,4);glow.position.copy(remote.position).add(new THREE.Vector3(0,1,0));window.BastionGameBridge.getScene().add(glow);setTimeout(()=>window.BastionGameBridge.getScene().remove(glow),180)}
 function localHero(){return window.BastionGameBridge?window.BastionGameBridge.getActiveHero():null}

 function frame(t){
   requestAnimationFrame(frame);
   smoothRemote(t);
   if(!joined||!socket||socket.readyState!==WebSocket.OPEN)return;
   if(t-lastSend<SEND_MS)return;
   const hero=localHero();const g=hero&&hero.g;
   const p=g?g.position:{x:0,y:0,z:0};
   const rot=g?g.rotation.y:0;
   const wave=window.BastionGameBridge?window.BastionGameBridge.getState().wave:0;
   // N'envoie la position que si elle a changé, ou au moins une fois par seconde.
   const moved=!lastPos||Math.hypot(p.x-lastPos.x,p.y-lastPos.y,p.z-lastPos.z)>0.02||Math.abs(rot-lastRot)>0.02;
   if(moved||t-lastSend>=IDLE_SEND_MS){
     lastSend=t;lastPos={x:p.x,y:p.y,z:p.z};lastRot=rot;
     send({type:'state',position:lastPos,rotation:rot,health:hero?hero.hp:null,wave});
   }
   if(wave!==lastWave&&wave>0){lastWave=wave;send({type:'event',event:'wave',wave})}
 }
 requestAnimationFrame(frame);

 window.BastionMP={
   sendEvent:(event,payload={})=>{if(joined)send({type:'event',event,...payload})},
   get connected(){return joined},
   get room(){return room},
   // Retourne true si le lancement est local (solo), false s'il est géré par la salle.
   requestStart:mode=>{
     if(!joined)return true;
     if(!isHost){say("Seul l'hôte peut lancer la partie.");bannerSafe("En attente de l'hôte…");return false}
     if(!peerId){say('Attends que ton coéquipier rejoigne la salle.');return false}
     send({type:'start',mode});say('Lancement…');return false;
   }
 };
})();
