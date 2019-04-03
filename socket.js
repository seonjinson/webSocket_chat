const WebSocket = require('ws');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws, req) => { // event on
    ws.on('message', (message) => {

    });
    ws.on('error', (error) => {

    });
    ws.on('close', () => {

    });
  });
};

// http://localhost:8080, client -> http -> server
// ws://localhost:8080, client -> ws -> server
