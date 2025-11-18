document.addEventListener('DOMContentLoaded', () => {
    carregarRanking();
});

// ATENÇÃO: Use a mesma URL que funcionou no login.js e game.js
//const BACKEND_URL = 'https://upgraded-space-umbrella-pj7jgrj7g755h66q-3000.app.github.dev';

async function carregarRanking() {
    // Seleciona o container onde a lista será desenhada
    // (Certifique-se que existe uma <div class="ranking-lista"> no seu HTML)
    const listaContainer = document.querySelector('.ranking-lista');
    
    if (!listaContainer) {
        console.error("Erro: Elemento .ranking-lista não encontrado no HTML.");
        return;
    }

    // Mostra um loading enquanto carrega
    listaContainer.innerHTML = '<p style="color: white; text-align: center;">Carregando ranking...</p>';

    try {
        // 1. Busca os dados do backend
        const response = await fetch(`${BACKEND_URL}/api/ranking`);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const rankingData = await response.json();

        // 2. Limpa o container
        listaContainer.innerHTML = '';

        // 3. Verifica se tem jogadores
        if (rankingData.length === 0) {
            listaContainer.innerHTML = '<p style="color: white; text-align: center;">Nenhum jogador encontrado.</p>';
            return;
        }

        // 4. Gera o HTML para cada jogador
        rankingData.forEach((jogador, index) => {
            const item = document.createElement('div');
            item.classList.add('ranking-item');

            // Adiciona classes especiais para o Top 3 (opcional, para CSS)
            if (index === 0) item.classList.add('primeiro-lugar');
            if (index === 1) item.classList.add('segundo-lugar');
            if (index === 2) item.classList.add('terceiro-lugar');

            // Monta o conteúdo da barra
            // Nota: Estamos usando 'jogador.vitorias' conforme sua alteração no banco
            item.innerHTML = `
                <div class="rank-posicao">${index + 1}º</div>
                <div class="rank-info">
                    <span class="rank-nome">${jogador.nome}</span>
                </div>
                <div class="rank-vitorias">${jogador.vitorias} vitórias</div>
            `;

            listaContainer.appendChild(item);
        });

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        listaContainer.innerHTML = '<p style="color: #ff5555; text-align: center;">Erro ao carregar o ranking.</p>';
    }
}
