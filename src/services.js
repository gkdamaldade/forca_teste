// src/services.js
const { models, sequelize } = require('./models');

async function getNovaPalavra() {
    console.log("Serviço: Buscando palavra na tabela...");

    try {
        // 1. Busca uma linha aleatória da tabela 'words'
        const wordData = await models.Word.findOne({
            order: sequelize.random(),
            // Garante que estamos trazendo apenas os dados brutos
            raw: true 
        });

        // 2. Verifica se encontrou algo
        if (!wordData) {
            console.warn("AVISO: Tabela de palavras está vazia!");
            return { palavra: "VAZIO", categoria: "ERRO NO BANCO" };
        }

        // DEBUG: Mostra no terminal o que veio do banco
        console.log("Palavra encontrada no DB:", wordData);

        // 3. Retorna os dados mapeados corretamente
        // O banco tem as colunas 'palavra' e 'categoria'
        return {
            palavra: wordData.palavra.toUpperCase(),
            
            // Aqui garantimos que pegamos a coluna 'categoria' ou um texto padrão se vier vazio
            categoria: (wordData.categoria || "Sem Categoria").toUpperCase()
        };

    } catch (error) {
        console.error("Erro CRÍTICO ao buscar palavra:", error);
        return { palavra: "ERRO", categoria: "SISTEMA" };
    }
}

module.exports = { getNovaPalavra };
