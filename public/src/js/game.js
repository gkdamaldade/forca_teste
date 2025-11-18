// game.js - Versão Online (Socket.IO)

// --- 1. SELETORES DO DOM ---
const categoriaEl = document.querySelector('.categoria');
const timerEl = document.querySelector('.tempo');
const palavraP1_El = document.querySelector('.palavras .palavra:nth-child(1)');
const palavraP2_El = document.querySelector('.palavras .palavra:nth-child(2)');
const tecladoContainer = document.querySelector('.teclado');
const vidasP1Container = document.querySelector('.jogador:nth-child(1) .vidas');
const vidasP2Container = document.querySelector('.jogador:nth-child(2) .vidas');
const bonecoP1_El = document.querySelector('.bonecos .boneco:nth-child(1) img');
const bonecoP2_El = document.querySelector('.bonecos .boneco:nth-child(2) img');
const h2Jogador1 = document.querySelector('.jogador:nth-child(1) h2');
const h2Jogador2 = document.querySelector('.jogador:nth-child(2) h2');
const poderesP1Container = document.querySelector('.area-inferior .poderes-jogador:nth-child(1)');
const poderesP2Container = document.querySelector('.area-inferior .poderes-jogador:nth-child(3)');

// --- 2. CONFIGURAÇÃO SOCKET.IO ---
// Conecta automaticamente ao mesmo servidor que serviu a página
const socket = io(); 

// Dados do Jogador Local
let meuNumeroJogador = 0; // 1 ou 2
let idSala = 'sala_1'; // Sala fixa para teste (pode vir da URL depois)
let meuNome = JSON.parse(localStorage.getItem('user'))?.name || 'Jogador';

// --- 3. ESTADO DO JOGO (Sincronizado com Servidor) ---
let jogoAtivo = false;
let timerInterval = null;

// --- 4. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Tenta entrar na sala
    console.log(`Tentando entrar na sala: ${idSala} como ${meuNome}`);
    socket.emit('entrar-sala', { nomeJogador: meuNome, idSala: idSala });

    // Configura inputs locais
    document.addEventListener('keydown', lidarComChuteDeTecladoFisico);
    configurarTecladoVirtual();
    configurarBotoesDePoder(); 
});

// --- 5. EVENTOS DO SOCKET (Ouvindo o Servidor) ---

// Servidor diz quem eu sou (1 ou 2)
socket.on('info-jogador', (dados) => {
    meuNumeroJogador = dados.meuNumero;
    console.log(`Eu sou o Jogador ${meuNumeroJogador}`);
    atualizarTituloJogador();
});

// Servidor diz que o jogo começou (ou reconectou)
socket.on('jogo-iniciado', (estado) => {
    console.log("Jogo iniciado!", estado);
    jogoAtivo = true;
    atualizarTela(estado);
});

// Servidor manda o estado atualizado (depois de um chute ou poder)
socket.on('atualizar-jogo', (estado) => {
    console.log("Atualização recebida:", estado);
    atualizarTela(estado);
});

// Mensagens do sistema (ex: "Aguardando oponente...")
socket.on('mensagem-sistema', (msg) => {
    categoriaEl.textContent = msg;
});

socket.on('erro-jogada', (msg) => {
    alert(msg); // Ex: "Não é sua vez!"
});


// --- 6. AÇÕES DO JOGADOR (Enviando ao Servidor) ---

function processarChute(letra) {
    if (!jogoAtivo) return;
    
    // Otimismo: Desabilita visualmente logo
    desabilitarTeclaVisual(letra);

    // Envia para o servidor
    socket.emit('chutar-letra', {
        idSala: idSala,
        letra: letra,
        jogadorNumero: meuNumeroJogador
    });
}

function processarPoder(poderId) {
    if (!jogoAtivo) return;

    socket.emit('usar-poder', {
        idSala: idSala,
        poderId: poderId,
        jogadorNumero: meuNumeroJogador
    });
}

// --- 7. ATUALIZAÇÃO DE TELA ---

function atualizarTela(dados) {
    // Dados vêm direto do servidor (src/game.js backend)
    
    // Palavra
    palavraP1_El.textContent = dados.palavra;
    palavraP2_El.textContent = dados.palavra;
    categoriaEl.textContent = dados.categoria;

    // Bonecos (Erros)
    // O backend manda 'erros' total.
    // Precisaríamos separar erros P1 e P2 no backend para ficar perfeito.
    // Por enquanto, atualiza ambos.
    if(bonecoP1_El) bonecoP1_El.src = `/public/assets/images/bob${Math.min(dados.erros + 1, 7)}.png`;
    if(bonecoP2_El) bonecoP2_El.src = `/public/assets/images/patrick${Math.min(dados.erros + 1, 7)}.png`;

    // Turno (Destaque Visual)
    atualizarTurnoUI(dados.turn);

    // Teclado (Sincroniza letras chutadas)
    dados.letrasChutadas.forEach(letra => desabilitarTeclaVisual(letra));

    // Fim de Jogo
    if (dados.status === 'vitoria') {
        finalizarJogo('Vitória! A palavra era: ' + dados.palavra);
    } else if (dados.status === 'derrota') {
        finalizarJogo('Derrota! Tente novamente.');
    }
}

function atualizarTurnoUI(turnoDoServidor) {
    if (turnoDoServidor === 1) {
        h2Jogador1.classList.add('active-turn');
        h2Jogador2.classList.remove('active-turn');
    } else {
        h2Jogador1.classList.remove('active-turn');
        h2Jogador2.classList.add('active-turn');
    }
}

function finalizarJogo(mensagem) {
    jogoAtivo = false;
    categoriaEl.textContent = mensagem;
    setTimeout(() => {
        // Opcional: Recarregar ou ir para menu
        // window.location.href = 'menu.html';
    }, 5000);
}

// --- 8. HELPERS VISUAIS ---

function atualizarTituloJogador() {
    // Destaca qual jogador "Eu" sou na tela
    if (meuNumeroJogador === 1) {
        h2Jogador1.innerText = `${meuNome} (Você)`;
    } else {
        h2Jogador2.innerText = `${meuNome} (Você)`;
    }
}

function desabilitarTeclaVisual(letra) {
    const btn = [...tecladoContainer.querySelectorAll('.tecla')]
        .find(b => b.textContent === letra);
    if (btn) btn.disabled = true;
}

function configurarTecladoVirtual() {
    if (!tecladoContainer) return;
    tecladoContainer.addEventListener('click', e => {
        if (e.target.classList.contains('tecla') && !e.target.disabled) {
            processarChute(e.target.textContent);
        }
    });
}

function configurarBotoesDePoder() {
    // Configura apenas os botões do SEU lado
    const containerMeusPoderes = (meuNumeroJogador === 1) ? poderesP1Container : poderesP2Container;
    
    if (!containerMeusPoderes) return;

    containerMeusPoderes.addEventListener('click', e => {
        const btn = e.target.closest('.poder');
        if (btn && !btn.disabled) {
            // Exemplo simples: Poder fixo
            // Idealmente, você buscaria o poder equipado do banco/localStorage
            const poderId = 'mago-negro'; 
            
            btn.disabled = true;
            processarPoder(poderId);
        }
    });
}

function lidarComChuteDeTecladoFisico(e) {
    if (!jogoAtivo) return;
    const letra = e.key.toUpperCase();
    if (letra.length === 1 && letra >= 'A' && letra <= 'Z') {
        const btn = [...tecladoContainer.querySelectorAll('.tecla')]
            .find(b => b.textContent === letra);
        
        if (btn && !btn.disabled) processarChute(letra);
    }
}
