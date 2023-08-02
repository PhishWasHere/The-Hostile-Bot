const WebSocket = require('ws')

const wssStart = () => {
    const wss = new WebSocket.Server({ port: 8080 });
    wss.on('connection', (ws) => {
      console.log('\x1b[35m> Client connected \x1b[0m');
      
      ws.on('message', (message) => {
        console.log(`\x1b[35m> Received message =>\x1b[0m ${message}`);
      });

      ws.on('close', () => {
        console.log('\x1b[35m> Client disconnected \x1b[0m');
      });
   });

    return wss;
};

module.exports = wssStart;