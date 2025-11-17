// src/models/Player.js
const { Model, DataTypes } = require('sequelize');

class Player extends Model {
  static initModel(sequelize) {
    Player.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(180),
        unique: true,
        allowNull: false // Assumindo que email também é obrigatório
      },
      // --- ADICIONE ESTE CAMPO ---
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
      // ----------------------------
    }, {
      sequelize,
      tableName: 'players', // Garante que o nome da tabela está correto
      modelName: 'Player'
    });
    return Player;
  }
}

module.exports = Player;