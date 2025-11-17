import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Sala = sequelize.define('Sala', {
    id:          { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    codigo:      { type: DataTypes.STRING(12), allowNull: false, unique: true },
    categoria:   { type: DataTypes.STRING(64), allowNull: false },        // ou categoria_id: DataTypes.UUID
    host_user_id:{ type: DataTypes.UUID, allowNull: true },
    status:      { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'aberta' }
  }, {
    tableName: 'salas',
    underscored: true,    // created_at / updated_at
    timestamps: true
  });

  return Sala;
};
