// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const appServer = http.createServer(app);
app.use(express.static(path.join(__dirname, 'public')));

appServer.listen(3000, () => {
    console.log('Server started on port 3000');
});

const wss = new WebSocket.Server({ noServer: true  });

appServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

let clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    if (message === 'master') {
      clients.set('host', ws);
      ws.send('Welcome master');
      console.log(`Host connected`);
    } else if (message === 'voter') {
        const clientId = generateClientId();
        clients.set(clientId, ws);
        ws.send(`Your client ID: ${clientId}`);
        console.log(`Voter ${clientId} connected`);
    } else if (message === 'up' || message === 'down') {
      // Forward valid vote to the master
      const clientId = getClientIdByConnection(ws);
      if (clientId) {
        const vote = { clientId, vote: message };
        clients.forEach((client) => {
          if (client !== ws) {
            client.send(JSON.stringify(vote));
          }
        });
        console.log(`Received vote from ${clientId}: ${message}`);
      }
    }
  });

  ws.on('close', () => {
    // Remove the client from the clients Map
    clients.delete(getClientIdByConnection(ws));
  });
});

function generateClientId() {
  return Math.random().toString(36).substring(2, 10);
}

function getClientIdByConnection(ws) {
  for (const [clientId, client] of clients.entries()) {
    if (client === ws) {
      return clientId;
    }
  }
  return null;
}
