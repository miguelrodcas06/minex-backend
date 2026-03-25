// models/treasuryItems.js
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TreasuryItem', {
    id_item: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_treasury: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'treasuries', // Se conecta con la tabla treasuries
        key: 'id_treasury'
      }
    },
    id_mineral: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'minerals', // Se conecta con la tabla minerals
        key: 'id_mineral'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false
    },
    purchase_price: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'treasury_items',
    timestamps: false, // Lo ponemos en false porque tu columna se llama created_at y no createdAt
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_item" },
        ]
      },
      {
        name: "fk_item_treasury",
        using: "BTREE",
        fields: [
          { name: "id_treasury" },
        ]
      },
      {
        name: "fk_item_mineral",
        using: "BTREE",
        fields: [
          { name: "id_mineral" },
        ]
      }
    ]
  });
};