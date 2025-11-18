/**
 * Arquivo: loja.js
 * Descrição: Lógica da loja integrada com o Backend.
 */

// --- CONFIGURAÇÃO ---
const BACKEND_URL = 'https://forcateste-production.up.railway.app';

// Array de habilidades (dados visuais)
const habilidades = [
    {
        nome: "Vida extra",
        descricao: "Ganha uma vida adicional.",
        preco: 2500,
        id: "vida_extra",
        imagem: "public/assets/images/vida_extra.png"
    },
    {
        nome: "Tirar vida",
        descricao: "Remove uma vida do adversário.",
        preco: 2500,
        id: "tirar_vida",
        imagem: "public/assets/images/Tirar_vida.png"
    },
    {
        nome: "Ocultar letra",
        descricao: "Oculta uma letra correta da palavra.",
        preco: 2500,
        id: "ocultar_letra",
        imagem: "public/assets/images/ocultar_letra.png"
    },
    {
        nome: "Ocultar dica",
        descricao: "Remove a dica da rodada.",
        preco: 2500,
        id: "ocultar_dica",
        imagem: "public/assets/images/ocultar_dica.png"
    },
    {
        nome: "Liberar letra",
        descricao: "Revela uma letra correta da palavra.",
        preco: 2500,
        id: "liberar_letra",
        imagem: "public/assets/images/liberar_letra.png"
    },
    {
        nome: "Palpite",
        descricao: "Habilidade especial para virar o jogo.",
        preco: 2500,
        id: "palpite",
        imagem: "public/assets/images/palpite.png"
    }
];

let indiceAtual = 0;
let moedasAtuais = 0; // Saldo real vindo do banco

document.addEventListener('DOMContentLoaded', () => {
    inicializarLoja();
});

function inicializarLoja() {
    // Elementos UI
    const nomeEl = document.querySelector(".habilidade-nome");
    const descEl = document.querySelector(".habilidade-desc");
    const precoEl = document.querySelector(".preco");
    const imgEl = document.querySelector(".card-header img");
    const btnComprar = document.querySelector(".btn-comprar");
    const indicadoresEl = document.querySelector(".indicadores");
    const leftArrow = document.querySelector(".arrow-btn.left");
    const rightArrow = document.querySelector(".arrow-btn.right");
    const saldoEl = document.getElementById('moedas-atual'); // ID corrigido para bater com HTML

    // Elementos Modal
    const modalBtnConfirmar = document.querySelector(".modal-actions .btn-confirmar");
    const modalBtnCancelar = document.querySelector(".modal-actions .btn-cancelar");

    // --- FUNÇÕES DE DADOS (BACKEND) ---

    async function carregarMoedasUsuario() {
        const userLogado = JSON.parse(localStorage.getItem('user'));
        if (!userLogado || !userLogado.id) {
            alert("Você precisa estar logado!");
            window.location.href = 'login.html';
            return;
        }

        try {
            // Busca dados reais do banco
            const response = await fetch(`${BACKEND_URL}/api/usuario/${userLogado.id}`);
            if (!response.ok) throw new Error("Erro ao buscar saldo");
            
            const dados = await response.json();
            setSaldoMoedas(dados.moedas);
            atualizarCard(); // Atualiza o botão com base no novo saldo

        } catch (error) {
            console.error(error);
            saldoEl.textContent = "---";
        }
    }

    function setSaldoMoedas(saldo) {
        moedasAtuais = saldo;
        if (saldoEl) saldoEl.textContent = saldo.toLocaleString('pt-BR');
    }

    // --- FUNÇÕES DE UI (CARROSSEL) ---

    function atualizarCard() {
        const habilidade = habilidades[indiceAtual];
        
        if(nomeEl) nomeEl.textContent = habilidade.nome;
        if(descEl) descEl.textContent = habilidade.descricao;
        
        const precoFormatado = habilidade.preco.toLocaleString('pt-BR');
        if(precoEl) precoEl.innerHTML = `Preço: <strong>${precoFormatado}</strong> <i class="fa-solid fa-coins"></i>`;
        if(imgEl) imgEl.src = habilidade.imagem;

        if(btnComprar) {
            btnComprar.dataset.index = indiceAtual;
            
            if (moedasAtuais < habilidade.preco) {
                btnComprar.classList.add('sem-saldo');
                btnComprar.textContent = "Sem saldo";
                btnComprar.disabled = true;
            } else {
                btnComprar.classList.remove('sem-saldo');
                btnComprar.textContent = "Comprar";
                btnComprar.disabled = false;
            }
        }
        atualizarIndicadores();
    }

    function atualizarIndicadores() {
        if(!indicadoresEl) return;
        indicadoresEl.innerHTML = "";
        habilidades.forEach((_, i) => {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === indiceAtual) dot.classList.add("active");
            indicadoresEl.appendChild(dot);
        });
    }

    // --- EVENT LISTENERS ---

    if(leftArrow) leftArrow.addEventListener("click", () => {
        indiceAtual = (indiceAtual - 1 + habilidades.length) % habilidades.length;
        atualizarCard();
    });

    if(rightArrow) rightArrow.addEventListener("click", () => {
        indiceAtual = (indiceAtual + 1) % habilidades.length;
        atualizarCard();
    });

    if(btnComprar) btnComprar.addEventListener("click", () => {
        const item = habilidades[indiceAtual];
        alert(`Funcionalidade de compra (Backend) em desenvolvimento.\nItem: ${item.nome}`);
        // AQUI IRIA O FETCH PARA /api/comprar-item
    });

    // --- LISTENERS DO MODAL (SIMULAÇÃO DE COMPRA DE MOEDAS) ---
    
    if(modalBtnConfirmar) modalBtnConfirmar.addEventListener('click', (e) => {
        e.preventDefault();
        const pacoteSelecionado = document.querySelector('input[name="pacote"]:checked');
        
        if (!pacoteSelecionado) {
            alert('Selecione um pacote.');
            return;
        }

        // Pega o valor do pacote (Lógica simples baseada no DOM)
        const pacoteBox = pacoteSelecionado.closest('.pacote').querySelector('.pacote-moedas');
        const valorTexto = pacoteBox.textContent.replace(/[^0-9]/g, ''); // Remove tudo que não é número
        const moedasGanha = parseInt(valorTexto);

        // TODO: Enviar para o backend para salvar no banco!
        // Por enquanto, atualiza visualmente
        const novoSaldo = moedasAtuais + moedasGanha;
        setSaldoMoedas(novoSaldo);
        alert(`Compra realizada! +${moedasGanha} moedas.`);
        atualizarCard();
        window.location.hash = ''; // Fecha modal
    });

    if(modalBtnCancelar) modalBtnCancelar.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '';
    });

    // --- START ---
    carregarMoedasUsuario();
    atualizarCard();
}
