const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,getGame,snapshot,removePlayer}=require('./game');
test('creates a private room with the standard chess position',()=>{const g=createGame('TEST01','s1','Ana');const s=snapshot(g);
 assert.equal(s.players.length,1);assert.equal(s.players[0].color,'w');assert.equal(s.fen.split(' ')[0],'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
 removePlayer('s1');assert.equal(getGame('TEST01'),undefined);});
test('room stays available while one player remains',()=>{createGame('TEST02','s1','Ana');getGame('TEST02').players.push({id:'s2',name:'João',color:'b'});
 removePlayer('s1');assert.equal(getGame('TEST02').players.length,1);removePlayer('s2');assert.equal(getGame('TEST02'),undefined);});