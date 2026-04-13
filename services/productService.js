// services/productService.js
const { Op } = require('sequelize');
const mineralService = require('./mineralService');

const initModels = require('../models/init-models.js').initModels;
const sequelize = require('../config/sequelize.js');
const models = initModels(sequelize);

const Product = models.products;
const Mineral = models.minerals;

class ProductService {
  // Devuelve todos los productos con filtros opcionales
  async getAll({ type, mineralName, exclusive } = {}) {
    const where = {};
    const mineralWhere = {};

    if (type) where.type = type;
    if (exclusive === 'true' || exclusive === true) where.is_exclusive = true;
    if (mineralName) mineralWhere.name = { [Op.like]: `%${mineralName}%` };

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Mineral,
          as: 'mineral',
          where: Object.keys(mineralWhere).length ? mineralWhere : undefined,
          attributes: ['name', 'symbol']
        }
      ],
      order: [['is_exclusive', 'DESC'], ['name', 'ASC']]
    });

    return products;
  }

  // Devuelve un producto por ID con su precio actual calculado
  async getById(id_product) {
    const product = await Product.findByPk(id_product, {
      include: [
        {
          model: Mineral,
          as: 'mineral',
          attributes: ['name', 'symbol']
        }
      ]
    });

    if (!product) return null;

    // Calculamos el precio actual usando el precio spot del mineral
    let precio_actual = null;
    try {
      const cotizacion = await mineralService.getCotizacion(product.mineral.name);
      if (cotizacion && cotizacion.precio) {
        const spot = cotizacion.precio;
        const premium = 1 + parseFloat(product.premium_pct) / 100;
        precio_actual = parseFloat((spot * parseFloat(product.weight_oz) * premium).toFixed(2));
      }
    } catch (_) {
      // Si falla la cotización, devolvemos el producto sin precio
    }

    return { ...product.toJSON(), precio_actual };
  }
}

module.exports = new ProductService();
