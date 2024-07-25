const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const users = new Map();
let keywords = ['urgent', 'important', 'notice'];  // Default keywords

io.on('connection', (socket) => {
  console.log('a user connected');
  users.set(socket.id, 'Anonymous');
  io.emit('updateUserList', Array.from(users.entries()));

  socket.on('setName', (name) => {
    users.set(socket.id, name);
    io.emit('updateUserList', Array.from(users.entries()));
  });

  socket.on('setKeywords', (newKeywords) => {
    keywords = newKeywords;
    io.emit('updateKeywords', keywords);
  });

  socket.on('message', (msg) => {
    // Highlight keywords in the message
    const highlightedMsg = keywords.reduce((message, keyword) => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      return message.replace(regex, '<mark>$1</mark>');
    }, msg);

    io.emit('message', { user: users.get(socket.id), text: highlightedMsg });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.delete(socket.id);
    io.emit('updateUserList', Array.from(users.entries()));
  });
});

app.post('/set-keywords', (req, res) => {
  const newKeywords = req.body.keywords;
  keywords = newKeywords;
  io.emit('updateKeywords', keywords);
  res.status(200).send('Keywords updated');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
