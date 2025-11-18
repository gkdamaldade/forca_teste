/**
 * Arquivo: loja.js
 * Descrição: Lógica para o carrossel de habilidades da loja.
 */

// Array de habilidades (dados brutos)
const habilidades = [
  {
    nome: "Vida extra",
    descricao: "Ganha uma vida adicional.",
    preco: 2500,
    // Nota: O caminho foi ajustado, dependendo da estrutura final do projeto, 
    // ele pode precisar ser 'public/assets/...' ou '../assets/...'
    imagem: "../assets/images/vida_extra.png"
  },
  {
    nome: "Tirar vida",
    descricao: "Remove uma vida do adversário.",
    preco: 2500,
    imagem: "../assets/images/Tirar_vida.png"
  },
  {
    nome: "Ocultar letra",
    descricao: "Oculta uma letra correta da palavra.",
    preco: 2500,
    imagem: "../assets/images/ocultar_letra.png"
  },
  {
    nome: "Ocultar dica",
    descricao: "Remove a dica da rodada.",
    preco: 2500,
    imagem: "../assets/images/ocultar_dica.png"
  },
  {
    nome: "Liberar letra",
    descricao: "Revela uma letra correta da palavra.",
    preco: 2500,
    imagem: "../assets/images/liberar_letra.png"
  },
  {
    nome: "Palpite",
    descricao: "Habilidade especial para virar o jogo.",
    preco: 2500,
    imagem: "../assets/images/palpite.png"
  }
];

let indiceAtual = 0;

// O evento DOMContentLoaded garante que este código só será executado depois
// que toda a estrutura HTML da página for carregada e construída.
document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleção dos Elementos HTML
    // A seleção é feita AQUI DENTRO para garantir que os elementos existem.
    const nomeEl = document.querySelector(".habilidade-nome");
    const descEl = document.querySelector(".habilidade-desc");
    const precoEl = document.querySelector(".preco");
    const imgEl = document.querySelector(".card-header img");
    const indicadoresEl = document.querySelector(".indicadores");
    const leftArrow = document.querySelector(".arrow-btn.left");
    const rightArrow = document.querySelector(".arrow-btn.right");

    // Adiciona uma verificação inicial de segurança para garantir que a aplicação não quebre
    // se o HTML não estiver completo.
    if (!nomeEl || !imgEl || !indicadoresEl || !leftArrow || !rightArrow) {
        console.error("ERRO: Elementos essenciais do DOM não encontrados. Verifique as classes no HTML.");
        return; 
    }

    // 2. Funções de Atualização
    function atualizarIndicadores() {
        indicadoresEl.innerHTML = "";
        habilidades.forEach((_, i) => {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            if (i === indiceAtual) dot.classList.add("active");
            indicadoresEl.appendChild(dot);
        });
    }

    function atualizarCard() {
        const habilidade = habilidades[indiceAtual];
        nomeEl.textContent = habilidade.nome;
        descEl.textContent = habilidade.descricao;
        precoEl.innerHTML = `Preço: <strong>${habilidade.preco}</strong> <i class="fa-solid fa-coins" aria-hidden="true"></i>`;
        imgEl.src = habilidade.imagem;
        atualizarIndicadores();
    }

    // 3. Listeners de Evento
    leftArrow.addEventListener("click", () => {
        indiceAtual = (indiceAtual - 1 + habilidades.length) % habilidades.length;
        atualizarCard();
    });

    rightArrow.addEventListener("click", () => {
        indiceAtual = (indiceAtual + 1) % habilidades.length;
        atualizarCard();
    });

    // 4. Inicialização: Exibe o primeiro card
    atualizarCard();
});