const { Chess } = require('chess.js');
const games = new Map();
function cleanName(value) { return String(value || 'Jogador').trim().slice(0,24) || 'Jogador'; }
function createGame(roomId, hostId, hostName) {
  const game = { roomId, chess: new Chess(), players: [{id:hostId,name:cleanName(hostName),color:'w'}], spectators:[] };
  games.set(roomId, game); return game;
}
function snapshot(game) {
  return {roomId:game.roomId, fen:game.chess.fen(), pgn:game.chess.pgn(), turn:game.chess.turn(),
    players:game.players.map(p=>({id:p.id,name:p.name,color:p.color})),
    spectators:game.spectators.map(p=>({id:p.id,name:p.name})),
    history:game.chess.history({verbose:true}).map(m=>({color:m.color,from:m.from,to:m.to,san:m.san,piece:m.piece,captured:m.captured||null,promotion:m.promotion||null})),
    legalMoves:game.chess.moves({verbose:true}).map(m=>({from:m.from,to:m.to,san:m.san,captured:m.captured||null,promotion:m.promotion||null})),
    status:{over:game.chess.isGameOver(),check:game.chess.isCheck(),checkmate:game.chess.isCheckmate(),draw:game.chess.isDraw(),stalemate:game.chess.isStalemate(),repetition:game.chess.isThreefoldRepetition(),insufficient:game.chess.isInsufficientMaterial()}};
}
function getGame(id){return games.get(id);}
function removePlayer(socketId) {
  for(const [roomId,g] of games){
    let i=g.players.findIndex(p=>p.id===socketId);
    if(i!==-1){const [p]=g.players.splice(i,1);if(!g.players.length&&!g.spectators.length)games.delete(roomId);return {roomId,name:p.name};}
    i=g.spectators.findIndex(p=>p.id===socketId);
    if(i!==-1){const [p]=g.spectators.splice(i,1);if(!g.players.length&&!g.spectators.length)games.delete(roomId);return {roomId,name:p.name};}
  } return null;
}
module.exports={createGame,getGame,snapshot,removePlayer,cleanName};