const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(`${__dirname}/public`));

const boy = { color: '#BAE1FF', message: "C'est un garçon !" };
const girl = { color: '#FFB0F8', message: "C'est une fille !" };
const infos = {};

function ResetInfos() {
  // Resetting the information object
  infos.color = 'white';
  infos.message = 'En attente de la révélation...';
  infos.time = 31;
  infos.active = false;
  io.emit('refresh', infos);
}

ResetInfos();

io.on('connection', (socket) => {
  infos.connection = io.engine.clientsCount;
  io.emit('refresh', infos);

  socket.on('disconnect', () => {
    infos.connection = io.engine.clientsCount;
    io.emit('refresh', infos);
  });

  socket.on('admin', (data) => {
    console.log(data);
    if (infos.active === false) {
      if (data === 'reset') { ResetInfos(); };

      if (data === 'boy' || data === 'girl') {
        infos.active = true;

        // Countdown
        const interval = setInterval(() => {
          infos.time -= 1;
          if (infos.time > 60) {
            infos.message = `Révélation dans ${Math.floor(infos.time / 60)} minutes ${(infos.time % 60)} secondes`;
            console.log(`Révélation dans ${Math.floor(infos.time / 60)} minutes ${(infos.time % 60)} secondes`);
          } else {
            infos.message = `Révélation dans ${infos.time} secondes`;
            console.log(`Révélation dans ${infos.time} secondes`);
          }
          io.emit('countdown', infos);
          if (infos.time === 0) {
            clearInterval(interval);

            if (data === 'boy') {
              // Setting information for boy gender
              infos.color = boy.color;
              infos.message = boy.message;
            } else if (data === 'girl') {
              // Setting information for girl gender
              infos.color = girl.color;
              infos.message = girl.message;
            }
            io.emit('refresh', infos);
            infos.active = false;
            console.log(infos.message);
          }
        }, 1000);
      }
    }
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(`${__dirname}/public/admin.html`);
});

server.listen(3000, () => {
  console.log('Application launched on port 3000 !');
});
