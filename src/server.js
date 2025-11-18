require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http'); // <--- 1. Necessário para o Socket.IO
const { Server } = require('socket.io'); // <--- 2. Importa o Socket.IO

const api = require('./routes');
const { errorHandler } = require('./middleware/error');
const { sequelize } = require('./db/sequelize');
// Importamos o nosso novo gerenciador de sockets (vamos criar jajá)
const socketHandler = require('./socketHandler'); 

const app = express();
const server = http.createServer(app); // <--- 3. Cria servidor HTTP explícito
// teste
app.use(express.static('public'));

// Configuração do CORS (Igual a antes, mas agora usada no Socket também)
const corsOptions = {
  origin: [
      /github\.dev$/, 
      'https://vinihideki.github.io',
      'http://127.0.0.1:5500',
      'http://localhost:5500'
  ],
  methods: ["GET", "POST"],
  optionsSuccessStatus: 200
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// --- 4. CONFIGURAÇÃO DO SOCKET.IO ---
const io = new Server(server, {
    cors: corsOptions // Aplica as mesmas regras de CORS
});

// Inicia a lógica do Socket
socketHandler(io);

// Rotas HTTP (Login, Cadastro, Ranking continuam aqui)
app.use('/api', api); 
app.get('/health', (req, res) => res.json({ ok: true }));
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectado.');
    // await sequelize.sync({ alter: true }); // Lembre-se de deixar comentado se já existe
  } catch (err) {
    console.error('❌ Falha ao conectar no DB:', err);
  }
})();

const PORT = process.env.PORT || 3000;

// ATENÇÃO: Mudamos de 'app.listen' para 'server.listen'
server.listen(PORT, () => console.log(`🚀 API + Socket ouvindo em ${PORT}`));
