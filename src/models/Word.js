const { Model, DataTypes } = require('sequelize');

class Word extends Model {
  static initModel(sequelize) {
    Word.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      }
    }, {
      sequelize,
      tableName: 'words', // Nome exato da tabela no Supabase
      modelName: 'Word',
      timestamps: true
    });
    return Word;
  }
}

module.exports = Word;
