/* Bastion Arena Survival — 2-player co-op networking layer.
 * This module synchronizes room membership, remote player transforms, and run events.
 * Game simulation remains client-side in this initial integration; see README before public launch.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const CFG={serverUrl:window.BASTION_MULTIPLAYER_URL||'wss://bastion-v2-web.onrender.com'};
 let socket=null,room=null,playerId=null,peerId=null,remote=null,lastSend=0,joined=false,localName='Warrior',lastWave=-1,isHost=false;
 const status=$('mp-status'), modal=$('mp-modal'), msg=$('mp-message');
 function setStatus(t){if(status)status.textContent=t}
 function say(t){if(msg)msg.textContent=t}
 function open(){modal.hidden=false}
 function close(){modal.hidden=true}
 $('mp-open')?.addEventListener('click',open);$('mp-close')?.addEventListener('click',close);
 modal?.addEventListener('click',e=>{if(e.target===modal)close()});
 $('mp-create')?.addEventListener('click',()=>connect('create'));
 $('mp-join')?.addEventListener('click',()=>connect('join'));
 function connect(action){
   if(socket&&socket.readyState===WebSocket.OPEN){send({type:action,room:($('mp-code').value||'').trim().toUpperCase(),name:localName});return}
   localName=($('mp-name').value||'Warrior').trim().slice(0,20)||'Warrior';
   let url=CFG.serverUrl;
   if(location.protocol==='https:'&&url.startsWith('ws://'))url='wss://'+url.slice(5);
   try{socket=new WebSocket(url)}catch(e){say('URL WebSocket invalide. Vérifie la configuration du serveur.');return}
   say('Connexion au serveur…');setStatus('Connexion…');
   socket.addEventListener('open',()=>send({type:action,room:($('mp-code').value||'').trim().toUpperCase(),name:localName}));
   socket.addEventListener('message',e=>{let d;try{d=JSON.parse(e.data)}catch{return}handle(d)});
   socket.addEventListener('close',()=>{joined=false;room=null;peerId=null;setStatus('Solo · déconnecté');say('Connexion fermée. Le mode solo reste disponible.');removeRemote()});
   socket.addEventListener('error',()=>{say('Serveur indisponible. Déploie multiplayer-server puis configure son URL.');setStatus('Solo · serveur absent')});
 }
 function send(data){if(socket&&socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(data))}
 function handle(d){
   if(d.type==='error'){say(d.message||'Erreur multijoueur');return}
   if(d.type==='role'){isHost=!!d.isHost;return}
   if(d.type==='start'){say('Lancement de la partie…');if(window.BastionLaunch)window.BastionLaunch(d.mode,true);return}
   if(d.type==='joined'){joined=true;isHost=!!d.isHost;room=d.room;playerId=d.playerId;peerId=d.peerId||null;$('mp-code').value=room;setStatus('Salle '+room+' · '+(d.count||1)+'/2');say(d.peerName?'Connecté avec '+d.peerName+'.':'Salle créée. Envoie le code '+room+' à ton ami.');close();return}
   if(d.type==='peer-joined'){peerId=d.playerId;setStatus('Salle '+room+' · 2/2');say((d.name||'Ton ami')+' a rejoint la salle.');return}
   if(d.type==='peer-left'){peerId=null;removeRemote();setStatus('Salle '+room+' · 1/2');say('Ton coéquipier a quitté la salle.');return}
   if(d.type==='state'){if(d.playerId!==playerId)updateRemote(d);return}
   if(d.type==='event'&&d.playerId!==playerId){if(d.event==='wave')bannerSafe('Ton coéquipier commence la vague '+d.wave);if(d.event==='attack')remoteAttack(d);return}
 }
 function bannerSafe(t){const el=$('ban');if(el){el.textContent=t;el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1600)}}
 function makeRemote(){if(remote||!window.THREE||!window.BastionGameBridge)return;const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.05,4,8),new THREE.MeshStandardMaterial({color:0x42e8d3,emissive:0x0b625e,emissiveIntensity:.65,roughness:.42,metalness:.35}));body.position.y=1.05;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),new THREE.MeshStandardMaterial({color:0xe1c6a1,roughness:.8}));head.position.y=1.9;g.add(head);const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.16),new THREE.MeshStandardMaterial({color:0xffc857,metalness:.7,roughness:.25,emissive:0x644010}));blade.position.set(.55,1.05,.1);blade.rotation.z=-.3;g.add(blade);g.position.set(2,0,2);g.userData.mpRemote=true;window.BastionGameBridge.getScene().add(g);remote=g}
 function updateRemote(d){makeRemote();if(!remote)return;const p=d.position||{};remote.position.set(Number(p.x)||0,Number(p.y)||0,Number(p.z)||0);if(Number.isFinite(d.rotation))remote.rotation.y=d.rotation;remote.visible=true;}
 function removeRemote(){if(remote&&window.BastionGameBridge){window.BastionGameBridge.getScene().remove(remote);remote.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}})}remote=null}
 function remoteAttack(d){if(!remote||!window.THREE)return;const glow=new THREE.PointLight(0x5ee6d0,2,4);glow.position.copy(remote.position).add(new THREE.Vector3(0,1,0));window.BastionGameBridge.getScene().add(glow);setTimeout(()=>window.BastionGameBridge.getScene().remove(glow),180)}
 function localHero(){return window.BastionGameBridge?window.BastionGameBridge.getActiveHero():null}
 function frame(t){requestAnimationFrame(frame);if(joined&&socket&&socket.readyState===WebSocket.OPEN&&t-lastSend>66){lastSend=t;const hero=localHero();const p=hero&&hero.g?hero.g.position:{x:0,y:0,z:0};const wave=window.BastionGameBridge?window.BastionGameBridge.getState().wave:0;send({type:'state',position:{x:p.x,y:p.y,z:p.z},rotation:hero&&hero.g?hero.g.rotation.y:0,health:hero?hero.hp:null,wave});if(wave!==lastWave&&wave>0){lastWave=wave;send({type:'event',event:'wave',wave});}} }
 requestAnimationFrame(frame);
 // Announce run events without changing the existing solo wave logic.
 const hook=()=>{if(typeof window.startWave==='function'&&!window.startWave.__mpWrapped){const original=window.startWave;const wrapped=function(){const result=original.apply(this,arguments);if(joined)send({type:'event',event:'wave',wave:window.BastionGameBridge?window.BastionGameBridge.getState().wave:0});return result};wrapped.__mpWrapped=true;window.startWave=wrapped}};
 // Classic scripts' top-level lexical bindings are not window properties. Use a small global bridge below.
 window.BastionMP={sendEvent:(event,payload={})=>{if(joined)send({type:'event',event,...payload})},get connected(){return joined},get room(){return room},
   // Retourne true si le lancement est local (solo), false s'il est géré par la salle.
   requestStart:mode=>{if(!joined)return true;if(!isHost){say("Seul l'hôte peut lancer la partie.");bannerSafe("En attente de l'hôte…");return false}if(!peerId){say('Attends que ton coéquipier rejoigne la salle.');return false}send({type:'start',mode});say('Lancement…');return false}};
})();
