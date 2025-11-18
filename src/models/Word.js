const { Model, DataTypes } = require('sequelize');

class Word extends Model {
  static initModel(sequelize) {
    Word.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Mapeando a coluna 'palavra' da sua imagem
      palavra: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Mapeando a coluna 'categoria' da sua imagem
      categoria: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Mapeando 'dificuldade'
      dificuldade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Mapeando 'usada'
      usada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      // ATENÇÃO: Qual o nome da tabela no Supabase? 
      // Se for "words", mantenha. Se for "palavras", mude abaixo.
      // Vou assumir 'words' baseado no histórico, mas verifique.
      tableName: 'palavra', 
      modelName: 'Word',
      // Se sua tabela NÃO tem as colunas createdAt/updatedAt, deixe false
      timestamps: false 
    });
    return Word;
  }
}

module.exports = Word;
