require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require('mongoose');
const cors = require('cors');

const Room = require('./models/Room');

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if(err) throw err;
  console.log(`[${(new Date()).toLocaleString()}] Connected to database`);
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({credentials: true, origin: true}));

io.on('connection', (socket) => {
  socket.on('sendMessage', message => {
    if(message?.userId && message?.username && message?.message) {
      const roomId = message?.room || '0000';
      Room.findOne({roomId: roomId}, (err, room) =>  {
        if(err || !room) {
          socket.emit('error', 'Nie znaleziono pokoju');
        }
        // TODO: Create room if doesn't exists
        const newMessage = {
          userId: message.userId,
          username: message.username,
          message: message.message
        };
        room.messages.push(newMessage);
        room.save(err => {
          if(err) {
            socket.emit('error', 'Wystąpił błąd przy dodawaniu wiadomości');
          } else {
            console.log('Dodano wiadomość');
            io.emit('newMessage', newMessage);
          }
        });
      });
    } else {
      socket.emit('error', 'Wiadomość musi zawierać userId, username oraz message');
    }
  });

  socket.on('getMessages', room => {
    Room.findOne({roomId: room}, (err, roomData) => {
      if(err || !roomData) {
        socket.emit('error', 'Nie udało się pobrać wiadomości');
      } else {
        socket.emit('messages', roomData.toObject().messages.map(({_id, ...message}) => message));
      }
    });
  });

  // TODO: on clearRoom
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function() {
  console.log(`[${(new Date()).toLocaleString()}] Lisening on ${PORT}`);
});