const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let deviceState = { led: false, temp: 0 };

// Endpoint for ESP32/ESP8266 to send sensor data & check commands
app.post('/api/iot', (req, res) => {
  if (req.body.temp !== undefined) deviceState.temp = req.body.temp;
  io.emit('state-update', deviceState); // Push live update to web dashboard
  res.json(deviceState); // Reply to microcontroller with latest LED state
});

// Web dashboard real-time controls
io.on('connection', (socket) => {
  socket.emit('state-update', deviceState);

  socket.on('toggle-led', (status) => {
    deviceState.led = status;
    io.emit('state-update', deviceState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
