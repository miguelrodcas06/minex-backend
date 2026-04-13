// models/products.js
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
    id_product: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_mineral: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'minerals',
        key: 'id_mineral'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('coin', 'ingot', 'bar', 'round'),
      allowNull: false
    },
    weight_oz: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Peso en onzas troy'
    },
    purity: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: 'Pureza del metal, ej: 0.9999'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_exclusive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    premium_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Porcentaje de prima sobre el precio spot'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'products',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id_product" }]
      },
      {
        name: "fk_product_mineral",
        using: "BTREE",
        fields: [{ name: "id_mineral" }]
      }
    ]
  });
};
