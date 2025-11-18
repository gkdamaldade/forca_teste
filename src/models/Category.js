const { Model, DataTypes } = require('sequelize');

class Category extends Model {
  static initModel(sequelize) {
    Category.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      }
    }, {
      sequelize,
      tableName: 'categories', // Nome exato da tabela no Supabase
      modelName: 'Category',
      timestamps: true
    });
    return Category;
  }
}

module.exports = Category;
