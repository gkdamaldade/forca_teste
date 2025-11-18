const { models, sequelize } = require('./models');

/**
 * Busca uma palavra aleatória diretamente do banco de dados.
 */
async function getNovaPalavra() {
    console.log("Serviço: Buscando palavra no DB...");

    try {
        // Busca 1 palavra, ordenada aleatoriamente, incluindo a Categoria
        const wordData = await models.Word.findOne({
            order: sequelize.random(), // Comando SQL para aleatório
            include: [{
                model: models.Category,
                as: 'category',
                attributes: ['name'] // Só precisamos do nome da categoria
            }]
        });

        if (!wordData) {
            console.warn("AVISO: Nenhuma palavra encontrada no banco! Usando fallback.");
            return { palavra: "SUPABASE", categoria: "DEFAULT" };
        }

        // Retorna no formato que o jogo espera
        return {
            palavra: wordData.text.toUpperCase(),
            categoria: wordData.category.name.toUpperCase()
        };

    } catch (error) {
        console.error("Erro ao buscar palavra:", error);
        // Fallback para o jogo não travar se o banco falhar
        return { palavra: "ERRO", categoria: "SISTEMA" };
    }
}

module.exports = { getNovaPalavra };
