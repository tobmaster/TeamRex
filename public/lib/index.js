import DinoGame from './game/DinoGame.js'

const game = new DinoGame(600, 250)
const isTouchDevice =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0

const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${wsProtocol}//${document.location.host}/`);
socket.onopen = () => {
  socket.send(JSON.stringify({ id: "sys", message: "host" }));
  renderGameStats();
};

let gamerVotes = {
};

socket.onmessage = (event) => {
  console.log('Received message:', event.data);

  const serverEvent = JSON.parse(event.data);

  switch (serverEvent.id) {
    case 'client-register':
      gamerVotes[serverEvent.clientId] = 'static';
      break;
    case 'client-unregister':
      try {
        delete gamerVotes[serverEvent.clientId];
      } catch (e) {
        console.log(e);
      }
      break;
    case 'vote':
      gamerVotes[serverEvent.clientId] = serverEvent.message;
      break;
  }
  const direction = elaborateVotes();
  act(direction);
};

function renderGameStats() {
  const stats = document.querySelector('#gamestats > span');
  stats.innerHTML = '';
  const results = Object.values(gamerVotes).reduce((acc, value) => {
    acc.players++;
    acc[value]++;
    return acc;
  }, { players: 0, up: 0 });
  if (results.players !== 0) {
    results.upPercent = results.up / results.players * 100;
  }
  stats.innerHTML = ` PLAYERS: <strong>${results.players}</strong>, UP: <strong>${results.up} | ${results.upPercent || 0}%</strong>`;
}

function elaborateVotes() {
  if (Object.keys(gamerVotes).length === 0) {
    return 'static';
  }

  // calculate persecentage of votes for up, down
  let up = 0;
  let down = 0;
  for (const [key, value] of Object.entries(gamerVotes)) {
    switch (value) {
      case 'up':
        up++;
        break;
      case 'down':
        down++;
        break;
    }
  }

  const upPercent = up / Object.keys(gamerVotes).length * 100;
  const downPercent = down / Object.keys(gamerVotes).length * 100;

  if (upPercent > 70) {
    return 'up';
  } else if (downPercent > 70) {
    return 'down';
  }

  return 'static';
}

function act(direction) {
  if (direction === 'up') {
    game.onInput('jump');
  } else if (direction === 'down') {
    game.onInput('duck');
    setTimeout(() => {
      game.onInput('stop-duck');
    }, 1000);
  }
}

if (isTouchDevice) {
  document.addEventListener('touchstart', ({ touches }) => {
    if (touches.length === 1) {
      game.onInput('jump')
    } else if (touches.length === 2) {
      game.onInput('duck')
    }
  })

  document.addEventListener('touchend', ({ touches }) => {
    game.onInput('stop-duck')
  })
} else {
  const keycodes = {
    // up, spacebar
    JUMP: { 38: 1, 32: 1 },
    // down
    DUCK: { 40: 1 },
  }

  document.addEventListener('keydown', ({ keyCode }) => {
    if (keycodes.JUMP[keyCode]) {
      game.onInput('jump')
    } else if (keycodes.DUCK[keyCode]) {
      game.onInput('duck')
    }
  })

  document.addEventListener('keyup', ({ keyCode }) => {
    if (keycodes.DUCK[keyCode]) {
      game.onInput('stop-duck')
    }
  })
}

game.start().catch(console.error)
