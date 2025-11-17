require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const api = require('./routes');
const { errorHandler } = require('./middleware/error');
const { sequelize } = require('./models');

const app = express();

// Middlewares de segurança e utilidade
app.use(helmet());

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public/pages")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

app.use(helmet());

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rota de verificação
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Rotas da API REST

app.get('/api/teste-direto', (req, res) => {
    res.status(200).json({ message: "O TESTE DIRETO NO SERVER.JS FUNCIONOU!" });
});

app.use('/api', api);

// Middleware de tratamento de erros
app.use(errorHandler);


// Conexão com o banco de dados
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectado.');
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o DB.');
  } catch (err) {
    console.error('❌ Falha ao conectar no DB:', err);
  }
})();

// Configuração do servidor HTTP + WebSocket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Lógica de salas e eventos multiplayer
require('./socket/gameSocket')(io);

// Inicialização do servidor
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

server.listen(PORT, () => console.log(`🚀 API ouvindo em ${PORT}`));
