# Xadrez a Dois — online

Jogo de xadrez para duas pessoas, com sala privada, chat e câmara/voz opcionais.

## Funcionalidades
- Salas privadas com código de 6 caracteres.
- Duas pessoas jogam; entradas adicionais ficam como espectadores.
- Regras de xadrez validadas no servidor através de `chess.js`.
- Xeque, xeque-mate, empate, promoção automática a dama e histórico de jogadas.
- Chat da sala.
- Vídeo e áudio ponto a ponto via WebRTC (STUN). Algumas redes podem exigir um servidor TURN.
- Interface adaptada a computador e telemóvel.

## Executar localmente
Requer Node.js 20 ou superior.

```bash
npm install
npm test
npm start
```
Depois abrir `http://localhost:10000`.

## Publicar com GitHub + Render
1. Criar um repositório GitHub chamado `xadrez-online`.
2. Enviar todos os ficheiros deste projeto para a raiz do repositório.
3. Em Render, criar um serviço **Web Service** e ligar esse repositório.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Usar a URL HTTPS criada pelo Render para os dois jogadores.

As salas e partidas ficam na memória do processo. Se o serviço reiniciar, as salas deixam de existir.
