const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('priceAlerts', {
    id_alert: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_user'
      }
    },
    id_mineral: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'minerals',
        key: 'id_mineral'
      }
    },
    threshold_price: {
      type: DataTypes.DECIMAL(12,4),
      allowNull: false
    },
    condition_type: {
      type: DataTypes.ENUM('above','below'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'price_alerts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_alert" },
        ]
      },
      {
        name: "fk_alert_user",
        using: "BTREE",
        fields: [
          { name: "id_user" },
        ]
      },
      {
        name: "fk_alert_mineral",
        using: "BTREE",
        fields: [
          { name: "id_mineral" },
        ]
      },
    ]
  });
};
