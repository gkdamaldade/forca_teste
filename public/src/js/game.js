// game.js organizado e sem duplicações
// --- IMPORTS ---
import { conectarSocket, enviarEvento, aoReceberEvento } from './socket.js';

// --- PARÂMETROS DA SALA E USUÁRIO ---
const params = new URLSearchParams(window.location.search);
const sala = params.get('sala') || 'default';
const categoria = params.get('categoria') || 'Aleatória';
const nome = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).nome;

// --- VARIÁVEIS PRINCIPAIS DO JOGO ---
let jogadorId = null;
let adversarioNome = '';
let palavraSecreta = '';
let letrasDescobertas = [];
let turnoAtual = null;
let tentativasRestantes = 2;
let tempo = 30;
let tempoTotal = 30;
let cronometro;
let poderesUsados = [];

// --- CONFIG SOCKET ---
conectarSocket(sala, nome, categoria);

aoReceberEvento(msg => {
    switch (msg.tipo) {
        case 'inicio':
            iniciarEstadoInicial(msg);
            break;
        case 'jogada':
            turnoAtual = msg.turno;
            processarLetra(msg.letra);
            atualizarTurno();
            break;
        case 'poder':
            aplicarPoder(msg.poder, msg.jogador);
            break;
        case 'fim':
            salvarPartida(msg.vencedor);
            window.location.href = `resultado.html?vencedor=${msg.vencedor}&palavra=${palavraSecreta}`;
            break;
    }
});

// --- FUNÇÕES DE ESTADO ---
function iniciarEstadoInicial(msg) {
    jogadorId = msg.jogador;
    adversarioNome = msg.adversario;
    palavraSecreta = msg.palavra;
    letrasDescobertas = Array(palavraSecreta.length).fill('_');
    turnoAtual = msg.turno;
    atualizarPalavra();
    atualizarTurno();
    iniciarCronometro();
    atualizarNomes();
}

function atualizarNomes() {
    const nomes = document.querySelectorAll('.jogador h2');
    nomes[jogadorId - 1].textContent = nome;
    nomes[2 - jogadorId].textContent = adversarioNome;
}

function atualizarPalavra() {
    const texto = letrasDescobertas.join(' ');
    document.querySelectorAll('.palavra').forEach(el => el.textContent = texto);
}

function atualizarTurno() {
    document.querySelector('.versus').textContent =
        turnoAtual === jogadorId ? 'Sua vez' : 'Aguardando...';
}

// --- LETRAS ---
function processarLetra(letra) {
    let acertou = false;

    for (let i = 0; i < palavraSecreta.length; i++) {
        if (palavraSecreta[i] === letra && letrasDescobertas[i] === '_') {
            letrasDescobertas[i] = letra;
            acertou = true;
        }
    }

    if (!acertou) {
        tentativasRestantes--;
        atualizarVidas();
    }

    atualizarPalavra();
    verificarFimDeJogo();
}

function verificarFimDeJogo() {
    if (!letrasDescobertas.includes('_')) {
        enviarEvento({ tipo: 'fim', vencedor: nome });
    } else if (tentativasRestantes <= 0) {
        enviarEvento({ tipo: 'fim', vencedor: adversarioNome });
    }
}

// --- INTERFACE ---
function atualizarVidas() {
    document.querySelectorAll('.vidas').forEach(container => {
        container.innerHTML = '';
        for (let i = 0; i < tentativasRestantes; i++) {
            const vida = document.createElement('span');
            vida.className = 'vida';
            container.appendChild(vida);
        }
    });
}

// --- PODERES ---
document.querySelectorAll('.poder').forEach(botao => {
    botao.addEventListener('click', () => {
        const tipo = botao.dataset.poder;
        if (turnoAtual !== jogadorId) return;
        poderesUsados.push(tipo);
        botao.disabled = true;
        enviarEvento({ tipo: 'poder', poder: tipo, jogador: jogadorId });
    });
});

function aplicarPoder(tipo) {
    const indices = letrasDescobertas
        .map((l, i) => (l === '_' ? i : -1))
        .filter(i => i !== -1);

    if (tipo === 'dica' && indices.length > 0) {
        const r = indices[Math.floor(Math.random() * indices.length)];
        letrasDescobertas[r] = palavraSecreta[r];
    }

    if (tipo === 'tempo') tempo += 10;

    if (tipo === 'pular') {
        palavraSecreta = escolherNovaPalavra();
        letrasDescobertas = Array(palavraSecreta.length).fill('_');
    }

    atualizarPalavra();
}

function escolherNovaPalavra() {
    const lista = ['ELEFANTE', 'GIRAFA', 'CACHORRO'];
    return lista[Math.floor(Math.random() * lista.length)];
}

// --- CRONÔMETRO ---
function iniciarCronometro() {
    const tempoEl = document.querySelector('.tempo');
    tempoEl.textContent = `${tempo}s`;

    cronometro = setInterval(() => {
        tempo--;
        tempoEl.textContent = `${tempo}s`;

        if (tempo <= 0) {
            clearInterval(cronometro);
            enviarEvento({ tipo: 'fim', vencedor: adversarioNome });
        }
    }, 1000);
}

// --- SALVAR PARTIDA ---
function salvarPartida(vencedor) {
    fetch('http://localhost:3000/api/partida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sala,
            jogador1: nome,
            jogador2: adversarioNome,
            vencedor,
            palavra: palavraSecreta,
            duracao: tempoTotal - tempo,
            poderes: poderesUsados
        })
    });
}

// --- TECLAS ---
document.querySelectorAll('.tecla').forEach(botao => {
    botao.addEventListener('click', () => {
        if (turnoAtual !== jogadorId) return;
        const letra = botao.textContent;
        botao.disabled = true;
        enviarEvento({ tipo: 'jogada', letra, jogador: jogadorId });
    });
});

// --- TECLADO FÍSICO ---
document.addEventListener('keydown', event => {
    const letra = event.key.toUpperCase();
    if (letra.length === 1 && letra >= 'A' && letra <= 'Z') {
        const botao = [...document.querySelectorAll('.tecla')] 
            .find(b => b.textContent === letra);

        if (botao && !botao.disabled && turnoAtual === jogadorId) {
            botao.disabled = true;
            enviarEvento({ tipo: 'jogada', letra, jogador: jogadorId });
        }
    }
});
