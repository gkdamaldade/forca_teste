const { models, sequelize } = require('./models');

async function getNovaPalavra() {
    console.log("Serviço: Buscando palavra na tabela única...");

    try {
        // Busca 1 linha aleatória da tabela 'words'
        // (Opcional: Poderíamos filtrar onde usada = false)
        const wordData = await models.Word.findOne({
            order: sequelize.random()
        });

        if (!wordData) {
            console.warn("AVISO: Nenhuma palavra encontrada!");
            return { palavra: "SUPABASE", categoria: "TESTE" };
        }

        // Retorna os dados das colunas exatas da sua imagem
        return {
            palavra: wordData.palavra.toUpperCase(),
            categoria: wordData.categoria.toUpperCase()
        };

    } catch (error) {
        console.error("Erro ao buscar palavra:", error);
        return { palavra: "ERRO", categoria: "SISTEMA" };
    }
}

module.exports = { getNovaPalavra };
