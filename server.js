const path=require('path'),http=require('http'),crypto=require('crypto'),express=require('express');
const {Server}=require('socket.io');const {Chess}=require('chess.js');
const {createGame,getGame,snapshot,removePlayer,cleanName}=require('./game');
const app=express(),server=http.createServer(app),io=new Server(server);const PORT=process.env.PORT||10000;
app.use(express.static(__dirname));
app.get('/health',(_req,res)=>res.json({ok:true,app:'xadrez-online'}));
const roomId=()=>crypto.randomBytes(3).toString('hex').toUpperCase();
const getCurrent=s=>s.data.roomId?getGame(s.data.roomId):null;
const emitState=g=>io.to(g.roomId).emit('game:state',snapshot(g));
io.on('connection',socket=>{
 socket.on('room:create',({name},reply=()=>{})=>{
  if(getCurrent(socket))return reply({ok:false,error:'Já estás numa sala.'});
  let id;do{id=roomId()}while(getGame(id));
  const g=createGame(id,socket.id,name);socket.data.roomId=id;socket.join(id);
  reply({ok:true,roomId:id,color:'w',state:snapshot(g)});
  io.to(id).emit('chat:system',{text:`${g.players[0].name} criou a sala.`});emitState(g);
 });
 socket.on('room:join',({roomId:id,name},reply=()=>{})=>{
  if(getCurrent(socket))return reply({ok:false,error:'Já estás numa sala.'});
  id=String(id||'').trim().toUpperCase();const g=getGame(id);
  if(!g)return reply({ok:false,error:'Não encontrei essa sala. Confirma o código.'});
  if(g.players.length<2){const color=g.players.some(p=>p.color==='b')?'w':'b';g.players.push({id:socket.id,name:cleanName(name),color});}
  else g.spectators.push({id:socket.id,name:cleanName(name)});
  const player=g.players.find(p=>p.id===socket.id);socket.data.roomId=id;socket.join(id);
  reply({ok:true,roomId:id,color:player?player.color:null,state:snapshot(g)});
  io.to(id).emit('chat:system',{text:`${cleanName(name)} entrou na sala${player?'':' como espectador'}.`});emitState(g);
 });
 socket.on('move',({from,to,promotion},reply=()=>{})=>{
  const g=getCurrent(socket);if(!g)return reply({ok:false,error:'Entra primeiro numa sala.'});
  const p=g.players.find(p=>p.id===socket.id);if(!p)return reply({ok:false,error:'Só os dois jogadores podem jogar.'});
  if(g.chess.isGameOver())return reply({ok:false,error:'A partida já terminou.'});
  if(g.chess.turn()!==p.color)return reply({ok:false,error:'Ainda não é a tua vez.'});
  try{g.chess.move({from,to,promotion:promotion||'q'});reply({ok:true});emitState(g);
   if(g.chess.isCheckmate())io.to(g.roomId).emit('chat:system',{text:`Xeque-mate! ${p.name} venceu.`});
   else if(g.chess.isDraw())io.to(g.roomId).emit('chat:system',{text:'A partida terminou empatada.'});
   else if(g.chess.isCheck())io.to(g.roomId).emit('chat:system',{text:'Xeque!'});
  }catch(e){reply({ok:false,error:'Jogada inválida. Tenta outra vez.'});}
 });
 socket.on('game:reset',(reply=()=>{})=>{const g=getCurrent(socket);if(!g)return reply({ok:false,error:'Não estás numa sala.'});
  if(!g.players.some(p=>p.id===socket.id))return reply({ok:false,error:'Só os jogadores podem reiniciar.'});
  g.chess=new Chess();io.to(g.roomId).emit('chat:system',{text:'A partida foi reiniciada.'});emitState(g);reply({ok:true});});
 socket.on('chat:message',({text},reply=()=>{})=>{const g=getCurrent(socket);if(!g)return reply({ok:false,error:'Entra primeiro numa sala.'});
  const msg=String(text||'').trim().slice(0,500);if(!msg)return reply({ok:false,error:'Escreve uma mensagem.'});
  const p=[...g.players,...g.spectators].find(p=>p.id===socket.id);
  io.to(g.roomId).emit('chat:message',{name:p?p.name:'Jogador',text:msg,at:Date.now()});reply({ok:true});});
 socket.on('signal',({targetId,data})=>{const g=getCurrent(socket);if(g&&targetId&&data&&[...g.players,...g.spectators].some(p=>p.id===targetId))io.to(targetId).emit('signal',{fromId:socket.id,data});});
 socket.on('disconnect',()=>{const gone=removePlayer(socket.id);if(!gone)return;io.to(gone.roomId).emit('chat:system',{text:`${gone.name} saiu da sala.`});const g=getGame(gone.roomId);if(g)emitState(g);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`XADREZ ONLINE na porta ${PORT}`));
