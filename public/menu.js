var sockethost = location.hostname;
var socket = io.connect(sockethost); //set this to the ip address of your node.js server

const width = 1920;
const height = 1080;
const main = document.getElementById("main");
const toast = document.getElementById("toast");
const settings = document.getElementById("settings");
const numTransitions = 4;
let settingsMode = false;
let settingsRow = 0;
let settingsSections = ["order", "change", "transition", "speed"];

let slides = [];
let current = 0;
let screen = 0;
let transition = 1; // 0: swap, 1: fade, 2: slide, 3: slideOver
let state = {
  "images": [
    "shack-shack.jpg",
    "ikea.jpg",
    "nandos.jpg",
    "timbits.jpg",
    "in-n-out.jpg",
    "mcdo-japan.jpg",
    "five-guys.jpg",
    "van-leeuwen.png"
  ],
  "settings": {
    "order": 1,
    "change": 0,
    "transition": 1,
    "speed": 1
  },
  "screens": [
    {
      "screen": 0,
      "slide": 0,
      "transition": 0,
      "direction": "right",
    },
    {
      "screen": 1,
      "slide": 1,
      "transition": 1,
      "direction": "right",
    },
    {
      "screen": 2,
      "slide": 2,
      "transition": 2,
      "direction": "right",
    },
    {
      "screen": 3,
      "slide": 3,
      "transition": 3,
      "direction": "right",
    }
  ]
};

function createSlides() {
  slides = state.images.map((file) => {
    let slide = div("slide", img("background", "images/" + file));
    slide.classList.add("hidden");
    main.appendChild(slide);
    return slide;
  });
  slides[0].classList.remove("hidden");
}

function updateSettings() {
  settingsSections.forEach((section) => {
    let buttons = Array.from(document.getElementById(section).children);
    buttons.forEach((button) => button.classList.remove("selected"));
    let value = state.settings[section];
    buttons[value].classList.add("selected");
  });
}

function div(klass, content) {
  let div = document.createElement("div");
  div.classList.add(klass);
  div.appendChild(content);
  return div;
}

function img(klass, src) {
  let img = document.createElement("img");
  img.classList.add(klass);
  img.src = src;
  return img;
}

document.addEventListener("keydown", function(event) {
	switch (event.key) {
    case "ArrowUp": up(); break;
    case "ArrowDown": down(); break;
    case "ArrowLeft": left(); break;
    case "ArrowRight": right(); break;      
    case "Escape": escape(); break;      
		default: return;
	}
	event.preventDefault();
});

function up() {
  if (settingsMode) {
    settings.children[settingsRow].classList.remove("selected-row");
    settingsRow = (settingsRow + 3) % 4;
    settings.children[settingsRow].classList.add("selected-row");
  } else {
    screen = (screen + 1) % state.screens.length;
    showToast(screen);
    updateSlides();
  }
}

function down() {
  if (settingsMode) {
    settings.children[settingsRow].classList.remove("selected-row");
    settingsRow = (settingsRow + 1) % 4;
    settings.children[settingsRow].classList.add("selected-row");
  } else {
    screen = (screen - 1 + state.screens.length) % state.screens.length;
    showToast(screen);
    updateSlides();
  }
}

function left() {
  if (settingsMode) {
    let setting = settingsSections[settingsRow];
    state.settings[setting] = (state.settings[setting] + 2) % 3;
    socket.emit('updateSettings', state.settings);
  } else {
    let next = (current - 1 + slides.length) % slides.length;
    change(current, next, "left");
    current = next;
  }
}

function right() {
  if (settingsMode) {
    let setting = settingsSections[settingsRow];
    state.settings[setting] = (state.settings[setting] + 1) % 3;
    socket.emit('updateSettings', state.settings);
  } else {
    let next = (current + 1) % slides.length;
    change(current, next, "right");
    current = next;
  }
}


function escape() {
  settingsMode = !settingsMode;
  if (settingsMode) {
    settings.style.opacity = 1.0;
  } else {
    let steps = 100;
    let count = 0;
    let step = 0.01;
    let opacity = 1.0;

    settingsInterval = setInterval(() => {
      opacity -= step;
      count++;

      settings.style.opacity = opacity;

      if (count == steps) {
        clearInterval(settingsInterval);
        settings.style.opacity = 0.0;
      }
    }, 10);
  }
}

toast.style.opacity = 0.0;
settings.style.opacity = 0.0;

let toastInterval = null;
function showToast(value) {
  toast.innerHTML = value;
  toast.style.opacity = 1.0;
  
  clearInterval(toastInterval);
  toastInterval = setTimeout(() => {
    let steps = 100;
    let count = 0;
    let step = 0.01;
    let opacity = 1.0;

    clearInterval(toastInterval);
    toastInterval = setInterval(() => {
      opacity -= step;
      count++;
  
      toast.style.opacity = opacity;

      if (count == steps) {
        clearInterval(toastInterval);
        toast.style.opacity = 0.0;
      }
    }, 10);
  }, 3000);
}

function change(from, to, direction) {
  switch (transition) {
    case 0: fade(from, to); break;
    case 1: slide(from, to, direction); break;
    case 2: slideOver(from, to, direction); break;
    default: swap(from, to); break;
  }
}

function swap(from, to) {
  slides[to].classList.remove("hidden");
  slides[from].classList.add("hidden");
}

function fade(from, to) {
  let fromSlide = slides[from];
  let toSlide = slides[to];

  toSlide.style.opacity = 0.0;
  toSlide.classList.remove("hidden");
  fromSlide.style.zIndex = 1;
  toSlide.style.zIndex = 2;
  
  let steps = 100;
  let count = 0;
  let step = 0.01;
  let opacity = 0.0;
  
  let interval = setInterval(() => {
    opacity += step;
    count++;
    
    toSlide.style.opacity = opacity;

    if (count == steps) {
      clearInterval(interval);
      fromSlide.classList.add("hidden");
      fromSlide.style.opacity = 1.0;
      toSlide.style.zIndex = 1;
    }
  }, 6);
}

function slide(from, to, direction, over = false) {
  let fromSlide = slides[from];
  let toSlide = slides[to];

  toSlide.style.left = width + "px";
  toSlide.classList.remove("hidden");
  
  let steps = 100;
  let count = 0;
  let step = (width / steps) * (direction == "left" ? 1 : -1);
  let fromLeft = 0;
  let toLeft = width * (direction == "left" ? -1 : 1);

  fromSlide.style.zIndex = 1;
  toSlide.style.zIndex = 2;
  
  let interval = setInterval(() => {
    fromLeft += step;
    toLeft += step;
    count++;
    
    if (!over) fromSlide.style.left = fromLeft + "px";
    toSlide.style.left = toLeft + "px";

    if (count == steps) {
      clearInterval(interval);
      fromSlide.classList.add("hidden");
      fromSlide.style.left = "0px";
      toSlide.style.left = "0px";
      toSlide.style.zIndex = 1;
    }
  }, 6);
}

function slideOver(from, to, direction) {
  slide(from, to, direction, true);
}

function updateSlides() {
  if (state.screens && state.screens.length > screen) {
    let myState = state.screens[screen];
    if (myState.transition !== undefined) {
      transition = myState.transition;
    }
    if (myState.slide !== undefined) {
      let next = myState.slide;
      if (current != next) {
        change(current, next, myState.direction || "right");
        current = next;
      }
    }
  }
}

socket.emit('hello', '');

socket.on('images', (message) => {
  console.log(message);
  state.images = message;
  createSlides();
});

socket.on('settings', (message) => {
  console.log(message);
  state.settings = message;
  updateSettings();
});

socket.on('screens', (message) => {
  // console.log(message);
  state.screens = message;
  updateSlides();
});

