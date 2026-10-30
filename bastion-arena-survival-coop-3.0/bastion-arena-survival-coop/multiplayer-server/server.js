const http = require('node:http');
const crypto = require('node:crypto');
const WebSocket = require('ws');
const PORT = Number(process.env.PORT || 8787);
const rooms = new Map();
const MODES = ['survival','blitz','bossrush','mega','daily'];
const server = http.createServer((req,res)=>{if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true,service:'bastion-coop',rooms:rooms.size}));return;}res.writeHead(200,{'content-type':'text/plain'});res.end('Bastion co-op WebSocket server');});
const wss = new WebSocket.Server({server, maxPayload: 16*1024});
// Battement de cœur : coupe les connexions mortes (réseau coupé sans fermeture propre).
wss.on('connection',ws=>{ws.isAlive=true;ws.on('pong',()=>{ws.isAlive=true})});
const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(ws.isAlive===false){ws.terminate();continue}ws.isAlive=false;try{ws.ping()}catch{}}},30000);
wss.on('close',()=>clearInterval(heartbeat));
const send=(ws,obj)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj));};
const roomCode=()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';do{code='';for(let i=0;i<6;i++)code+=chars[crypto.randomInt(chars.length)]}while(rooms.has(code));return code;};
function leave(ws){const code=ws.room;if(!code)return;const room=rooms.get(code);ws.room=null;if(!room)return;room.players.delete(ws.id);for(const peer of room.players.values())send(peer,{type:'peer-left',playerId:ws.id});if(room.hostId===ws.id){room.hostId=[...room.players.keys()][0]||null;const next=room.players.get(room.hostId);if(next)send(next,{type:'role',isHost:true});}if(!room.players.size)rooms.delete(code);}
wss.on('connection',ws=>{ws.id=crypto.randomUUID();ws.room=null;ws.name='Warrior';ws.lastState=0;
 ws.on('message',raw=>{let d;try{d=JSON.parse(raw.toString())}catch{return;}if(!d||typeof d.type!=='string')return;
  if(d.type==='ping'){send(ws,{type:'pong',t:d.t});return;}
  if(d.type==='create'){if(ws.room)leave(ws);const code=roomCode();const room={players:new Map(),hostId:ws.id,lastStart:0};rooms.set(code,room);ws.room=code;ws.name=String(d.name||'Warrior').slice(0,20);room.players.set(ws.id,ws);send(ws,{type:'joined',room:code,playerId:ws.id,count:1,isHost:true});return;}
  if(d.type==='join'){const code=String(d.room||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const room=rooms.get(code);if(!room){send(ws,{type:'error',message:'Salle introuvable. Vérifie le code.'});return;}if(room.players.size>=2&&!room.players.has(ws.id)){send(ws,{type:'error',message:'Cette salle est complète (2 joueurs maximum).'});return;}if(ws.room)leave(ws);ws.room=code;ws.name=String(d.name||'Warrior').slice(0,20);const peers=[...room.players.values()];room.players.set(ws.id,ws);const peer=peers[0];send(ws,{type:'joined',room:code,playerId:ws.id,count:room.players.size,peerId:peer?.id||null,peerName:peer?.name||null,isHost:room.hostId===ws.id});if(peer){send(peer,{type:'peer-joined',playerId:ws.id,name:ws.name});send(ws,{type:'state',playerId:peer.id,name:peer.name,position:{x:0,y:0,z:0},rotation:0});}return;}
  if(!ws.room)return;const room=rooms.get(ws.room);if(!room)return;
  if(d.type==='start'){if(room.hostId!==ws.id)return;if(room.players.size<2){send(ws,{type:'error',message:'Attends que ton coéquipier rejoigne la salle.'});return;}const now=Date.now();if(now-room.lastStart<4000)return;const mode=String(d.mode||'');if(!MODES.includes(mode))return;room.lastStart=now;for(const p of room.players.values())send(p,{type:'start',mode});return;}
  if(d.type==='state'){const now=Date.now();if(now-ws.lastState<40)return;ws.lastState=now;const p=d.position||{};const state={type:'state',playerId:ws.id,name:ws.name,position:{x:clamp(p.x,-60,60),y:clamp(p.y,-3,15),z:clamp(p.z,-60,60)},rotation:Number.isFinite(d.rotation)?d.rotation:0,health:Number.isFinite(d.health)?clamp(d.health,0,100000):null,wave:Number.isFinite(d.wave)?clamp(d.wave,0,100000):0};for(const peer of room.players.values())if(peer!==ws)send(peer,state);return;}
  if(d.type==='event'&&['wave','attack','dodge','down'].includes(d.event)){const payload={type:'event',playerId:ws.id,event:d.event};if(Number.isFinite(d.wave))payload.wave=clamp(d.wave,0,100000);for(const peer of room.players.values())if(peer!==ws)send(peer,payload);}
 });ws.on('close',()=>leave(ws));ws.on('error',()=>leave(ws));
});
function clamp(n,min,max){n=Number(n);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):0;}
server.listen(PORT,'0.0.0.0',()=>console.log(`Bastion co-op listening on ${PORT}`));
