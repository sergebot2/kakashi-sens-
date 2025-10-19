const { io } = require('socket.io-client');

// Connecte-toi au serveur socket
const socket = io('http://localhost:3001', {
  query: {
    verifyToken: "Fn96OxLwWEfENTPYPAiXqwdieaIsn4Y5OH2APP0O"
  }
});

const channel = "uptime";

// Événement principal
socket.on(channel, data => {
  console.log(data);
});

// Déconnexion
socket.on('disconnect', (e) => {
  console.log('Disconnect', e);
  // Your handler code
});

// Connexion réussie
socket.on('connect', () => {
  console.log('Connected to socket successfully');
  // Your handler code
});

// Erreur de connexion
socket.on('connect_error', err => {
  console.log('Connection error:', err);
  // Your handler code
});
