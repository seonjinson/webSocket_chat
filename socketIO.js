const SocketIO = require('socket.io');
const axios = require('axios');
const cookie = require('cookie-signature'); // 암호화가 적용된 cookie만들기
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io); // express 변수 저장 방법 --> req.app.get('io')
  // 네임 스페이스(실시간 데이터가 전달될 주소를 구별할 수 있음).
  // io.of('/') -> 기본네임스페이스,
  const room = io.of('/room');
  const chat = io.of('/chat');

  io.use((socket, next) => {
    cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
  });

  // socket.io에서 express middleware사용방법
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    const req = socket.request;
    const { headers: { referer } } = req;
    // room/awefdsijfds (req.headers.referer) roomId 가져오기
    const roomId = referer
      .split('/')[referer.split('/').length - 1]
      .replace(/\?.+/, '');
    // socket.join(룸ID)
    // socket.to(룸ID).emit()
    // socket.leave(룸ID)
    socket.join(roomId); // room 접속
    // socket.to(roomId).emit('join', { // 해당 room에만 event emit
    //   user: 'system',
    //   chat: `${req.session.color} 님이 입장하셨습니다.`,
    //   number: socket.adapter.rooms[roomId].length,
    // });
    axios.post(`http://localhost:8084/room/${roomId}/sys`, {
      type: 'join',
    }, {
      headers: {
        Cookie: `connect.sid=${'s%3A' + cookie.sign(req.signedCookies['connect.sid'], process.env.COOKIE_SECRET)}`,
      }, // connect.sid: 암호화된 세션 쿠키
    });
    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제');
      socket.leave(roomId); // room 나가기
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      if (userCount === 0) { // room에 인원이 하나도 없으면 db에서 room 삭제
        axios.delete(`http://localhost:8084/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공');
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        // socket.to(roomId).emit('exit', {
        //   user: 'system',
        //   chat: `${req.session.color}님이 퇴장하셨습니다.`,
        //   number: socket.adapter.rooms[roomId].length,
        // });
        axios.post(`http://localhost:8084/room/${roomId}/sys`, {
          type: 'exit',
        }, {
          headers: {
            Cookie: `connect.sid=${'s%3A' + cookie.sign(req.signedCookies['connect.sid'], process.env.COOKIE_SECRET)}`,
          },
        });
      }
    });
    socket.on('dm', (data) => {
      socket.to(data.target).emit('dm', data);
    });
    socket.on('ban', (data) => {
      socket.to(data.id).emit('ban');
    });
  });

  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('client 접속', ip, socket.id, req.id);
    socket.on('disconnect', () => {
      console.log('클라이언트 접속 해제', ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on('error', (error) => {
      console.error(error);
    });
    socket.on('message', (data) => {
      console.log(data);
    });
    socket.on('reply', (data) => {
      console.log(data);
    });
    socket.interval = setInterval(() => {
      socket.emit('news', 'Hello Socket.IO');
    }, 3000);
  });
};
