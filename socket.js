const WebSocket = require('ws');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws, req) => { // event on
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // 접속자 ip
    // req.headers['x-forwarded-for']: 프록시 거치기 전의 ip
    // req.connection.remoteAddress: 최종 ip
    console.log('client 접속', ip);
    ws.on('message', (message) => {
      console.log(message);
    });
    ws.on('error', (error) => {
      console.error(error);
    });
    ws.on('close', () => {
      console.log('client 접속 해제', ip);
      clearInterval(ws.interval);
    });
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) { // CONNECTING: 연결중, OPEN: 연결 수립, CLOSING: 종료중, CLOSED: 종료
        ws.send('서버에서 클라이언트로 메세지를 보냅니다.');
      }
    }, 3000);
    ws.interval = interval;
  });
};

// http://localhost:8080, client -> http -> server
// ws://localhost:8080, client -> ws -> server
