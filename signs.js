// Signs
// Andrew Zamler-Carhart

// To run the server:
// HOSTNAME=localhost PORT=1234 node signs.js
// or just:
// node signs.js

let signs = this;
let express = require("express"),
	app = express(),
	errorHandler = require('errorhandler'),
	state = require('./config.json'),
	hostname = process.env.HOSTNAME || 'localhost',
	port = parseInt(process.env.PORT, 10) || 1234,
	publicDir = process.argv[2] || __dirname + '/public',
	io = require('socket.io').listen(app.listen(port)),
globalSocket = null;

app.use(express.static(publicDir));
app.use(errorHandler({
	dumpExceptions: true,
	showStack: true
}));

console.log("Signs server running at " + hostname + ":" + port);

io.sockets.on('initialload', function (socket) {  
	socket.emit('settings', state.settings);
  socket.emit('screens', state.screens);
});

io.sockets.on('connection', (socket) => {
  socket.on('hello', (message) => {  
  	socket.emit('images', state.images);					
  	socket.emit('settings', state.settings);
  	socket.emit('screens', state.screens);					
  });

  socket.on('updateSettings', (message) => { 
    let orderChanged = message.order != state.settings.order;
    let transitionChanged = message.transition != state.settings.transition;
    let speedChanged = message.speed != state.settings.speed;

    state.settings = message;
    io.sockets.emit('settings', state.settings);
    
    if (orderChanged) {
      orderScreens(message.order);
    }
    if (transitionChanged) {
      syncTransition();
    }
    if (speedChanged) {
      stopLoop();
      startLoop();
    }
  });
});

let counter = 0;
let interval = null;

function startLoop() {
  interval = setInterval(() => {
    counter++;
    
    let by = state.screens.order == 2 ? randomInt(1, state.images.length - 1) : 1;
    if (state.settings.change == 1) {
      advanceSlide(counter % state.screens.length, by);
    } else if (state.settings.change == 2) {
      advanceSlide(randomInt(0, state.screens.length - 1), by);
    } else {
      advanceAllSlides(by);
    }
    console.log(state.screens);
    io.sockets.emit('screens', state.screens);
  }, getSpeed());
}

function stopLoop() {
  clearInterval(interval);
}

function getSpeed() {
  switch (state.settings.speed) {
    case 0: return 10000;
    case 1: return 5000;
    case 2: return 2500;
    default: return 5000;
  }
}

function orderScreens(order) {
  if (order == 0) {
    syncSlide(0);
  } else {
    let slide = 0;
    for (let i = 0; i < state.screens.length; i++) {
      state.screens[i].slide = slide;
      slide = (slide + 1) % state.images.length;
    }
  }
}

function advanceAllSlides(by = 1) {
  state.screens.forEach((screen) => {
    screen.slide = (screen.slide + by + state.images.length) % state.images.length;
  });
}

function advanceSlide(screen, by = 1) {
  state.screens[screen].slide = (state.screens[screen].slide + by + state.images.length) % state.images.length;
}

function syncSlide(slide) {
  state.screens.forEach((screen) => screen.slide = slide);
}

function syncTransition(transition) {
  state.screens.forEach((screen) => screen.transition = state.settings.transition);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

orderScreens(state.settings.order);
syncTransition();
startLoop();
