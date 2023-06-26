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

const wss = new WebSocket.Server({ noServer: true });

appServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});

let clientList = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (data, isBinary) => {
    let request;
    try {
      request = isBinary ? data : JSON.parse(data.toString());
    } catch (e) {
      console.log('Received message is not a valid JSON');
      return;
    }

    console.log("Received message: " + request.message);
    if (request.message === 'host') {
      clientList.set('host', ws);
      const response = { id: 'clients', clients: [...clientList.keys()].filter((id) => id !== 'host') };
      ws.send(JSON.stringify(response));
      ws.send(JSON.stringify({ id: 'system', message: 'Welcome master' }));
      console.log(`Host connected`);
    } else if (request.message === 'voter') {
      const clientId = generateClientId();
      const host = clientList.get('host');
      if (!host) {
        console.log('Host not connected');
        return;
      }
      clientList.set(clientId, ws);
      console.log(`Voter ${clientId} connected`);
      ws.send(JSON.stringify({ id: 'welcome', message: `Your client ID: ${clientId}` }));
      host.send(JSON.stringify({ id: "client-register", clientId }));
    } else if (request.message === 'up' || request.message === 'down') {
      // Forward valid vote to the master
      const host = clientList.get('host');
      if (!host) {
        console.log('Host not connected');
        return;
      }
      const clientId = getClientIdByConnection(ws);
      host.send(JSON.stringify({ id: "vote", clientId, message: request.message }));
      console.log(`Received vote from ${clientId}: ${request.message}`);

      /*
        const clientId = getClientIdByConnection(ws);
        if (clientId) {
          const vote = { clientId, vote: request.message };
          clientList.forEach((client) => {
            if (client !== ws) {
              client.send(JSON.stringify(vote));
            }
          });
          console.log(`Received vote from ${clientId}: ${request.message}`);
        }
      */
    }
  });

  ws.on('close', () => {
    const clientId = getClientIdByConnection(ws);
    const host = clientList.get('host');
    if (!host) {
      console.log('Host not connected');
      return;
    }
    host.send(JSON.stringify({ id: "client-unregister", clientId }));
    console.log(`${clientId} disconnected`);
    // Remove the client from the clients Map
    clientList.delete(clientId);
  });
});

function generateClientId() {
  return Math.random().toString(36).substring(2, 10);
}

function getClientIdByConnection(ws) {
  for (const [clientId, client] of clientList.entries()) {
    if (client === ws) {
      return clientId;
    }
  }
  return null;
}
