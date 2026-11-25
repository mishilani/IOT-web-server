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
  rain: "Dry",
  rainRaw: 4095,
  motion: false,
  distance: 0,
  light: "Bright",
  lightPercent: 0,
  led: false,
  lastUpdated: "Waiting for device..."
};

app.post('/api/iot', (req, res) => {
  const { temp, humidity, rain, rainRaw, motion, distance, light, lightPercent } = req.body;

  if (temp !== undefined) deviceState.temp = temp;
  if (humidity !== undefined) deviceState.humidity = humidity;
  if (rain !== undefined) deviceState.rain = rain;
  if (rainRaw !== undefined) deviceState.rainRaw = rainRaw;
  if (motion !== undefined) deviceState.motion = motion;
  if (distance !== undefined) deviceState.distance = distance;
  if (light !== undefined) deviceState.light = light;
  if (lightPercent !== undefined) deviceState.lightPercent = lightPercent;
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
