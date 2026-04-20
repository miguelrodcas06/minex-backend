/**
 * @fileoverview Servicio del catálogo de productos físicos de metales preciosos.
 * Calcula el precio de venta en tiempo real a partir del precio spot del mineral subyacente.
 * @module services/productService
 */

// services/productService.js
const { Op } = require('sequelize');
const mineralService = require('./mineralService');

const initModels = require('../models/init-models.js').initModels;
const sequelize = require('../config/sequelize.js');
const models = initModels(sequelize);

const Product = models.products;
const Mineral = models.minerals;

/**
 * Servicio de negocio para el catálogo de productos físicos de MineX.
 */
class ProductService {
  /**
   * Devuelve todos los productos con filtros opcionales.
   * Los productos exclusivos se ordenan primero; dentro de cada grupo, por nombre ASC.
   * @param {Object} [filters={}]
   *   - `type`: tipo de producto (coin | ingot | bar | round).
   *   - `mineralName`: nombre parcial del mineral (búsqueda LIKE).
   *   - `exclusive`: si es `true` o `"true"`, devuelve solo productos exclusivos.
   * @returns {Promise<Array<object>>} Array de productos con datos del mineral asociado.
   */
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

  /**
   * Devuelve un producto por su ID incluyendo el precio de venta calculado.
   * Fórmula: `spot (USD/g) × peso_en_gramos × (1 + premium_pct / 100)`.
   * Si la cotización falla, devuelve el producto con `precio_actual: null`.
   * @param {number} id_product - ID del producto.
   * @returns {Promise<object|null>} Producto con campo `precio_actual`, o `null` si no existe.
   */
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
        const spot = cotizacion.precio; // precio por gramo
        const gramos = parseFloat(product.weight_oz) * 31.1035;
        const premium = 1 + parseFloat(product.premium_pct) / 100;
        precio_actual = parseFloat((spot * gramos * premium).toFixed(2));
      }
    } catch (_) {
      // Si falla la cotización, devolvemos el producto sin precio
    }

    return { ...product.toJSON(), precio_actual };
  }
}

module.exports = new ProductService();
