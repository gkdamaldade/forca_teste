import { conectarSocket, enviarEvento, aoReceberEvento } from './socket.js';

const params = new URLSearchParams(window.location.search);
const sala = params.get('sala') || 'default';
const categoria = params.get('categoria') || 'Aleatória';
const nome = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).nome;

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

conectarSocket(sala, nome, categoria);

aoReceberEvento(msg => {
  if (msg.tipo === 'inicio') {
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

  if (msg.tipo === 'jogada') {
    turnoAtual = msg.turno;
    processarLetra(msg.letra);
    atualizarTurno();
  }

  if (msg.tipo === 'poder') {
    aplicarPoder(msg.poder, msg.jogador);
  }

  if (msg.tipo === 'fim') {
    salvarPartida(msg.vencedor);
    window.location.href = `resultado.html?vencedor=${msg.vencedor}&palavra=${palavraSecreta}`;
  }
});

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

function verificarFimDeJogo() {
  if (!letrasDescobertas.includes('_')) {
    enviarEvento({ tipo: 'fim', vencedor: nome });
  } else if (tentativasRestantes <= 0) {
    enviarEvento({ tipo: 'fim', vencedor: adversarioNome });
  }
}

document.querySelectorAll('.tecla').forEach(botao => {
  botao.addEventListener('click', () => {
    if (turnoAtual !== jogadorId) return;
    const letra = botao.textContent;
    botao.disabled = true;
    enviarEvento({ tipo: 'jogada', letra, jogador: jogadorId });
  });
});

document.querySelectorAll('.poder').forEach(botao => {
  botao.addEventListener('click', () => {
    const tipo = botao.dataset.poder;
    if (turnoAtual !== jogadorId) return;
    poderesUsados.push(tipo);
    botao.disabled = true;
    enviarEvento({ tipo: 'poder', poder: tipo, jogador: jogadorId });
  });
});

function aplicarPoder(tipo, jogadorOrigem) {
  if (tipo === 'dica') {
    const indices = letrasDescobertas.map((l, i) => l === '_' ? i : -1).filter(i => i !== -1);
    if (indices.length > 0) {
      const aleatorio = indices[Math.floor(Math.random() * indices.length)];
      letrasDescobertas[aleatorio] = palavraSecreta[aleatorio];
    }
  } else if (tipo === 'tempo') {
    tempo += 10;
  } else if (tipo === 'pular') {
    palavraSecreta = escolherNovaPalavra();
    letrasDescobertas = Array(palavraSecreta.length).fill('_');
  }

  atualizarPalavra();
}

function escolherNovaPalavra() {
  const lista = ['ELEFANTE', 'GIRAFA', 'CACHORRO'];
  return lista[Math.floor(Math.random() * lista.length)];
}

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
// --- 1. Seletores do DOM ---
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

// --- 2. A URL da sua API ---
const BACKEND_URL = 'https://upgraded-space-umbrella-pj7jgrj7g755h66q-3000.app.github.dev';

// --- 3. Estado da Partida e Timer ---

// SIMULAÇÃO DE PODERES EQUIPADOS
const poderP1 = 'orochimaru'; // P1 equipou a vida extra
const poderP2 = 'etanol';    // P2 equipou o ataque de vida

let vidasP1 = 2; // Vidas do Round (Melhor de 3)
let vidasP2 = 2;
let maxErrosP1 = 6; // Vidas do Personagem (padrão)
let maxErrosP2 = 6; // Vidas do Personagem (padrão)

let jogadorDaVez = 1; 
let jogoEstaAtivo = true; 
let timerInterval = null;
let letrasChutadas = new Set(); 
let errosP1 = 0; // Erros do P1 no round atual
let errosP2 = 0; // Erros do P2 no round atual
let errosBackend = 0; 

// --- 4. Ponto de Partida ---
document.addEventListener('DOMContentLoaded', () => {
    iniciarNovaRodada();
    document.addEventListener('keydown', lidarComChuteDeTecladoFisico);
    configurarTecladoVirtual();
    configurarBotoesDePoder(); 
});

// --- 5. Funções de Lógica de Turno e Timer ---

function iniciarTimer() {
    clearInterval(timerInterval);
    let segundos = 15;
    timerEl.textContent = `${segundos}s`;
    timerInterval = setInterval(() => {
        segundos--;
        timerEl.textContent = `${segundos}s`;
        if (segundos <= 0) {
            clearInterval(timerInterval);
            console.log(`Tempo esgotado para Jogador ${jogadorDaVez}!`);
            trocarTurno();
        }
    }, 1000);
}

function trocarTurno() {
    if (!jogoEstaAtivo) return;
    console.log(`Trocando turno...`);
    jogadorDaVez = (jogadorDaVez === 1) ? 2 : 1;
    atualizarTurnoUI();
    iniciarTimer();
}

function atualizarTurnoUI() {
    if (jogadorDaVez === 1) {
        h2Jogador1.classList.add('active-turn');
        h2Jogador2.classList.remove('active-turn');
    } else {
        h2Jogador1.classList.remove('active-turn');
        h2Jogador2.classList.add('active-turn');
    }
}

// --- 6. Funções Principais do Jogo ---

async function iniciarNovaRodada() {
    console.log("--- Iniciando novo round! ---");
    jogoEstaAtivo = true;
    letrasChutadas.clear();
    resetarTecladoVisual(); 
    resetarPoderesVisuais();
    
    errosP1 = 0;
    errosP2 = 0;
    errosBackend = 0;
    atualizarBonecosUI(); 
    
    // *** LÓGICA DO PODER PASSIVO (VIDA EXTRA) ***
    // (Só checa no primeiro round)
    if (vidasP1 === 2 && vidasP2 === 2) { // Checa se é o começo da partida
        if (poderP1 === 'orochimaru') {
            console.log("Poder Passivo (P1): Orochimaru ativado! +2 Vidas de Personagem.");
            maxErrosP1 = 8; // P1 pode errar 8 vezes
        }
        if (poderP2 === 'orochimaru') {
            console.log("Poder Passivo (P2): Orochimaru ativado! +2 Vidas de Personagem.");
            maxErrosP2 = 8; // P2 pode errar 8 vezes
        }
    }
    // (As vidas do round (bolinhas) não mudam)
    atualizarPlacarDeVidas(); 

    jogadorDaVez = 1;
    atualizarTurnoUI();
    iniciarTimer();
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/novo-jogo`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const dadosDoJogo = await response.json();
        console.log("Dados do round recebidos:", dadosDoJogo);
        atualizarTela(dadosDoJogo);
    } catch (error) {
        console.error("Falha ao buscar novo round:", error);
        categoriaEl.textContent = "Erro ao carregar!"; 
    }
}

function atualizarTela(dados) {
    palavraP1_El.textContent = dados.palavra;
    palavraP2_El.textContent = dados.palavra;
    categoriaEl.textContent = dados.categoria;
    letrasChutadas = new Set(dados.letrasChutadas);
    atualizarBonecosUI();

    // Checa se o round acabou por VITORIA (acertou a palavra)
    if (dados.status === 'vitoria') {
        clearInterval(timerInterval);
        jogoEstaAtivo = false;

        console.log(`Jogador ${jogadorDaVez} VENCEU este round.`);
        (jogadorDaVez === 1) ? vidasP2-- : vidasP1--;
        
        atualizarPlacarDeVidas();
        checarFimDePartida(false); // Checa o fim da partida (não foi por derrota)
    }
}

async function processarChute(letra) {
    if (!jogoEstaAtivo || letrasChutadas.has(letra)) return; 

    console.log(`Frontend: Jogador ${jogadorDaVez} enviando chute '${letra}'...`);
    
    letrasChutadas.add(letra);
    desabilitarTeclaVisual(letra);
    clearInterval(timerInterval); 

    try {
        const response = await fetch(`${BACKEND_URL}/api/chutar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ letra: letra })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const novoEstadoDoJogo = await response.json();
        console.log("Novo estado recebido:", novoEstadoDoJogo);

        let foiErro = false; // Flag para saber se trocamos o turno

        // *** LÓGICA DE DANO SEPARADO ***
        if (novoEstadoDoJogo.erros > errosBackend) {
            console.log("ERRO! Dano computado.");
            foiErro = true;
            
            if (jogadorDaVez === 1) {
                errosP1++;
            } else {
                errosP2++;
            }
        }
        errosBackend = novoEstadoDoJogo.erros;
        
        // Atualiza a tela (palavra e bonecos)
        atualizarTela(novoEstadoDoJogo);
        
        // Se o jogo NÃO acabou por VITORIA (o status ainda é 'jogando')
        if (jogoEstaAtivo) {
            // Checa se o jogador atual PERDEU POR ERROS
            if (jogadorDaVez === 1 && errosP1 >= maxErrosP1) {
                console.log(`Jogador 1 PERDEU este round (erros).`);
                jogoEstaAtivo = false;
                vidasP1--;
                atualizarPlacarDeVidas();
                checarFimDePartida(true); // Checa o fim da partida (foi por derrota)
            } else if (jogadorDaVez === 2 && errosP2 >= maxErrosP2) {
                console.log(`Jogador 2 PERDEU este round (erros).`);
                jogoEstaAtivo = false;
                vidasP2--;
                atualizarPlacarDeVidas();
                checarFimDePartida(true); // Checa o fim da partida (foi por derrota)
            } else if (foiErro) {
                // Se foi apenas um erro, mas não o fim do round
                trocarTurno();
            } else {
                // Se foi ACERTO, o jogador joga de novo
                iniciarTimer();
            }
        }

    } catch (error) {
        console.error("Falha ao enviar chute:", error);
        letrasChutadas.delete(letra);
        habilitarTeclaVisual(letra);
        iniciarTimer(); 
    }
}

// --- 7. Funções de Poder (Frontend) ---

function configurarBotoesDePoder() {
    if (poderesP1Container) {
        poderesP1Container.addEventListener('click', (event) => {
            const botaoPoder = event.target.closest('.poder');
            if (!botaoPoder || botaoPoder.disabled || jogadorDaVez !== 1) return;
            
            const poderId = (poderP1 === 'orochimaru') ? 'mago-negro' : poderP1;
            
            console.log("P1 ativou poder:", poderId);
            processarPoder(poderId, 1);
            botaoPoder.disabled = true;
        });
    }
    
    if (poderesP2Container) {
        poderesP2Container.addEventListener('click', (event) => {
            const botaoPoder = event.target.closest('.poder');
            if (!botaoPoder || botaoPoder.disabled || jogadorDaVez !== 2) return;
            
            const poderId = (poderP2 === 'orochimaru') ? 'mago-negro' : poderP2;
            
            console.log("P2 ativou poder:", poderId);
            processarPoder(poderId, 2);
            botaoPoder.disabled = true;
        });
    }
}

async function processarPoder(poderId, jogador) {
    if (!jogoEstaAtivo) return;

    console.log(`Frontend: Jogador ${jogador} usando poder '${poderId}'...`);
    clearInterval(timerInterval); 

    try {
        const response = await fetch(`${BACKEND_URL}/api/usar-poder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poderId: poderId, jogador: jogador })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const resultadoDoPoder = await response.json();
        console.log("Resultado do poder recebido:", resultadoDoPoder);

        if (resultadoDoPoder.tipo === 'gameState') {
            // Poder "Mago Negro":
            atualizarTela(resultadoDoPoder.estado);
            
        } else if (resultadoDoPoder.tipo === 'ataqueVida') {
            // Poder "Etanol"
            if (resultadoDoPoder.sucesso) {
                if (resultadoDoPoder.alvo === 1) vidasP1--;
                if (resultadoDoPoder.alvo === 2) vidasP2--;
                atualizarPlacarDeVidas();
            }
        } else if (resultadoDoPoder.tipo === 'ocultarLetra') { 
            // Poder: "Exodia"
    
            // Este poder muda o estado visual do jogo.
            if (resultadoDoPoder.sucesso && resultadoDoPoder.estadoAtualizado) {
                // Usa a função já existente para atualizar a tela
                // com o estado que contém o novo caractere invisível.
                atualizarTela(resultadoDoPoder.estadoAtualizado);
                
                if (jogoEstaAtivo) {
                    checarFimDePartida(false); // Checa se o poder acabou o jogo
                    trocarTurno();
                }
            }
        } else if (poderId === 'palpite-adversario' && !resultadoDoPoder.sucesso) {
                // Sorte da Palpite Adversario, mas falhou em ocultar a letra (porque não havia letras reveladas)
                // O backend deve ter retornado que o sucesso é false e que a penalidade
                // de vida deve ser aplicada (o que se encaixa no resultadoDoPoder.tipo === 'ataqueVida' ou aqui).
                console.log(`[Palpite Adversario] Sorte, mas falhou em ocultar. Penalidade de vida aplicada pelo backend.`);
                if (resultadoDoPoder.alvo === 1) vidasP1--;
                if (resultadoDoPoder.alvo === 2) vidasP2--;
                atualizarPlacarDeVidas();
                checarFimDePartida(false);
                trocarTurno();
            }
            // Se o Palpite Adversario teve "sorte" e o backend processou
        if (poderId !== 'palpite-adversario' || !azar) {
            trocarTurno(); // Troca o turno após um poder
        }

    }

    catch (error) {
        console.error("Falha ao usar poder:", error);
        iniciarTimer();
    }
        
}

// --- 8. Funções Auxiliares de UI (Teclado, Vidas, Bonecos) ---
function atualizarBonecosUI() {
    if (bonecoP1_El) {
        // Garante que não tentamos carregar 'bob9.png' se o max for 8 (erros 0-8)
        let erroIndexP1 = Math.min(errosP1, maxErrosP1);
        bonecoP1_El.src = `../assets/images/bob${erroIndexP1 + 1}.png`;
    }
    if (bonecoP2_El) {
        let erroIndexP2 = Math.min(errosP2, maxErrosP2);
        bonecoP2_El.src = `../assets/images/patrick${erroIndexP2 + 1}.png`;
    }
}

function atualizarPlacarDeVidas() {
    vidasP1Container.innerHTML = "";
    vidasP2Container.innerHTML = "";
    for (let i = 0; i < vidasP1; i++) vidasP1Container.innerHTML += '<span class="vida"></span>';
    for (let i = 0; i < vidasP2; i++) vidasP2Container.innerHTML += '<span class="vida"></span>';
}

function desabilitarTeclaVisual(letra) {
    const teclaNaTela = [...tecladoContainer.querySelectorAll('.tecla')]
        .find(t => t.textContent.toUpperCase() === letra);
    if (teclaNaTela) teclaNaTela.disabled = true;
}

function habilitarTeclaVisual(letra) {
    const teclaNaTela = [...tecladoContainer.querySelectorAll('.tecla')]
        .find(t => t.textContent.toUpperCase() === letra);
    if (teclaNaTela) teclaNaTela.disabled = false;
}

function resetarTecladoVisual() {
    if (tecladoContainer) {
        tecladoContainer.querySelectorAll('.tecla').forEach(tecla => {
            tecla.disabled = false;
        });
    }
}

function resetarPoderesVisuais() {
    if (poderesP1Container) {
        poderesP1Container.querySelectorAll('.poder').forEach(btn => btn.disabled = false);
    }
    if (poderesP2Container) {
        poderesP2Container.querySelectorAll('.poder').forEach(btn => btn.disabled = false);
    }
}

// --- 9. Funções de "Ouvinte" (Input) ---

function configurarTecladoVirtual() {
    if (tecladoContainer) {
        tecladoContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('tecla') && !event.target.disabled) {
                processarChute(event.target.textContent);
            }
        });
    }
}

function lidarComChuteDeTecladoFisico(event) {
    if (!jogoEstaAtivo) return; 
    const letra = event.key.toUpperCase();
    if (letra.length !== 1 || letra < 'A' || letra > 'Z') return; 
    
    // Checa se a tecla virtual já foi desabilitada
    const teclaNaTela = [...tecladoContainer.querySelectorAll('.tecla')]
        .find(t => t.textContent.toUpperCase() === letra);
    
    if (teclaNaTela && !teclaNaTela.disabled) {
        processarChute(letra);
    }
}
// ... código existente ...

// Adicione esta função auxiliar no final do arquivo ou junto com as outras
async function salvarVitoriaNoBanco() {
    // Recupera o usuário logado (que salvamos no login.js)
    const userLogado = JSON.parse(localStorage.getItem('user'));
    
    if (!userLogado || !userLogado.email) {
        console.warn("Nenhum usuário logado encontrado para salvar a vitória.");
        return;
    }

    try {
        console.log("Salvando vitória para:", userLogado.email);
        await fetch(`${BACKEND_URL}/api/registrar-vitoria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userLogado.email }) // Envia o email
        });
        console.log("Vitória salva com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar vitória:", error);
    }
}

// --- ATUALIZE A FUNÇÃO checarFimDePartida ---

function checarFimDePartida() {
    if (vidasP1 === 0) {
        // Jogador 1 perdeu -> Jogador 2 ganhou
        // (Se o usuário logado for o Jogador 2, salvaríamos aqui)
        console.log("FIM DE JOGO: Jogador 1 perdeu a partida!");
        setTimeout(() => window.location.href = 'lost.html', 2000);
        return true;

    } else if (vidasP2 === 0) {
        // Jogador 2 perdeu -> JOGADOR 1 GANHOU!
        console.log("FIM DE JOGO: Jogador 1 venceu a partida!");
        
        // --- CHAMADA DA NOVA FUNÇÃO ---
        salvarVitoriaNoBanco(); 
        // ------------------------------

        setTimeout(() => window.location.href = 'win.html', 2000);
        return true;
    }
    // ... restante da função
