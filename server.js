const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let deviceState = {
  temp: 0,
  humidity: 0,
  brightness: 0,
  motion: false,
  rainPercent: 0,
  distance: 0,
  led: false,
  online: false,
  lastUpdated: "Waiting for device..."
};

app.post('/api/iot', (req, res) => {
  const { temp, humidity, brightness, motion, rainPercent, distance } = req.body;

  if (temp !== undefined) deviceState.temp = temp;
  if (humidity !== undefined) deviceState.humidity = humidity;
  if (brightness !== undefined) deviceState.brightness = brightness;
  if (motion !== undefined) deviceState.motion = motion;
  if (rainPercent !== undefined) deviceState.rainPercent = rainPercent;
  if (distance !== undefined) deviceState.distance = distance;

  deviceState.online = true;
  deviceState.lastUpdated = new Date().toLocaleTimeString();

  io.emit('state-update', deviceState);
  res.json({ led: deviceState.led });
});

io.on('connection', (socket) => {
  socket.emit('state-update', deviceState);

  socket.on('toggle-led', (status) => {
    deviceState.led = status;
    io.emit('state-update', deviceState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
