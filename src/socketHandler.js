const { getNovaPalavra } = require('./services');
const { Game } = require('./game');

// Aqui guardamos todos os jogos ativos na memória do servidor
// Chave: ID da Sala (ex: "sala_1"), Valor: Instância do Jogo
const salasAtivas = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Novo jogador conectado:', socket.id);

        // --- EVENTO: ENTRAR NA SALA ---
        socket.on('entrar-sala', ({ nomeJogador, idSala }) => {
            socket.join(idSala);
            console.log(`${nomeJogador} entrou na sala ${idSala}`);

            // Verifica quantos jogadores tem na sala
            const jogadores = io.sockets.adapter.rooms.get(idSala);
            const numJogadores = jogadores ? jogadores.size : 0;

            if (numJogadores === 1) {
                // Primeiro jogador: É o Host (Jogador 1)
                socket.emit('info-jogador', { meuNumero: 1 });
                io.to(idSala).emit('mensagem-sistema', `Aguardando oponente...`);
            
            } else if (numJogadores === 2) {
                // Segundo jogador: É o Guest (Jogador 2)
                socket.emit('info-jogador', { meuNumero: 2 });
                
                // O jogo começa!
                iniciarJogoSocket(io, idSala);
            } else {
                // Sala cheia
                socket.emit('erro-sala', 'Sala cheia!');
                socket.leave(idSala);
            }
        });

        // --- EVENTO: CHUTAR LETRA ---
        socket.on('chutar-letra', ({ idSala, letra, jogadorNumero }) => {
            const jogo = salasAtivas.get(idSala);
            
            if (!jogo) return; // Jogo não existe
            
            // Validação Server-Side: É a vez dele?
            if (jogo.turn !== jogadorNumero) {
                socket.emit('erro-jogada', 'Não é sua vez!');
                return;
            }

            // Processa o chute usando sua classe Game existente
            jogo.chutarLetra(letra);
            
            // Manda o estado atualizado para TODO MUNDO na sala
            io.to(idSala).emit('atualizar-jogo', jogo.getEstado());
        });

        // --- EVENTO: USAR PODER ---
        socket.on('usar-poder', ({ idSala, poderId, jogadorNumero }) => {
             const jogo = salasAtivas.get(idSala);
             if (!jogo || jogo.turn !== jogadorNumero) return;

             // Lógica simples de poder (podemos expandir depois)
             if (poderId === 'mago-negro') {
                 jogo.revelarLetraMaisRepetida();
             }
             // ... outros poderes ...

             io.to(idSala).emit('atualizar-jogo', jogo.getEstado());
        });

        socket.on('disconnect', () => {
            console.log('Jogador desconectou:', socket.id);
            // TODO: Lidar com desconexão (pausar jogo, dar vitória pro outro, etc)
        });
    });
};

// Função auxiliar para iniciar um jogo numa sala específica
async function iniciarJogoSocket(io, idSala) {
    console.log(`Iniciando jogo na sala ${idSala}`);
    
    // 1. Busca palavra no banco (usando seu service existente)
    const { palavra, categoria } = await getNovaPalavra();
    
    // 2. Cria nova instância do Jogo
    const novoJogo = new Game(palavra, categoria);
    
    // 3. Salva na memória
    salasAtivas.set(idSala, novoJogo);

    // 4. Avisa a sala que o jogo começou e manda o estado inicial
    io.to(idSala).emit('jogo-iniciado', novoJogo.getEstado());
}
