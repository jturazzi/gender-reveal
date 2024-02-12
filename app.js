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
  infos.active = false;
  infos.time = 1;
  setTimeout(() => {
    infos.color = 'white';
    infos.message = 'En attente de la révélation...';
    io.emit('refresh', infos);
  }, 1500);
  
}

ResetInfos();

io.on('connection', (socket) => {
  infos.connection = io.engine.clientsCount;
  io.emit('refresh', infos);

  socket.on('disconnect', () => {
    infos.connection = io.engine.clientsCount;
    io.emit('refresh', infos);
  });

  socket.on('time', (data) => {
    infos.time = data;
    console.log(data);
  });

  socket.on('admin', (data) => {
    console.log(data);
    if (data === 'reset') { ResetInfos(); };
    if (infos.active === false) {
      if (data === 'boy' || data === 'girl') {
        infos.active = true;

        // Countdown
        const interval = setInterval(() => {
          infos.time -= 1;
          if (infos.time > 15000) {
            infos.message = `Révélation dans ${Math.floor(infos.time / 3600)} heures ${Math.floor((infos.time % 3600) / 60)} minutes`;
            console.log(`Révélation dans ${Math.floor(infos.time / 60)} minutes`)
          } else if (infos.time > 3600) {
            infos.message = `Révélation dans ${Math.floor(infos.time / 60)} minutes`;
            console.log(`Révélation dans ${Math.floor(infos.time / 60)} minutes`);
          } else if (infos.time > 300) {
            infos.message = `Révélation dans ${Math.floor(infos.time / 60)} minutes ${(infos.time % 60)} secondes`;
            console.log(`Révélation dans ${Math.floor(infos.time / 60)} minutes ${(infos.time % 60)} secondes`);
          } else if (infos.time > 10) {
            infos.message = `Révélation dans ${infos.time} secondes`;
            console.log(`Révélation dans ${infos.time} secondes`);
          } else {
            infos.message = `${infos.time}`;
            console.log(`${infos.time}`);
          }
          if (infos.active === true) {
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
          } else {
            clearInterval(interval);
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
