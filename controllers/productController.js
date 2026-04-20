/**
 * @fileoverview Controlador del catálogo de productos físicos de metales preciosos.
 * Delega en {@link module:services/productService}.
 * @module controllers/productController
 */

// controllers/productController.js
const productService = require('../services/productService');

/**
 * Controlador HTTP para el catálogo de productos (monedas, lingotes, barras, rounds).
 */
class ProductController {
  /**
   * Devuelve el catálogo completo de productos con filtros opcionales.
   * @route GET /api/productos?type=coin&mineral=oro&exclusive=true
   * @param {Express.Request}  req - Query: `type` (coin|ingot|bar|round), `mineral` (nombre parcial), `exclusive` (boolean).
   * @param {Express.Response} res - 200 con array de productos, o 500 en error.
   * @returns {Promise<void>}
   */
  async getAll(req, res) {
    try {
      const { type, mineral, exclusive } = req.query;
      const productos = await productService.getAll({ type, mineralName: mineral, exclusive });

      res.json({
        ok: true,
        datos: productos,
        mensaje: 'Catálogo de productos recuperado correctamente'
      });
    } catch (error) {
      console.error('Error en getAll productos:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno al obtener el catálogo de productos'
      });
    }
  }

  /**
   * Devuelve el detalle de un producto por su ID incluyendo el precio de venta calculado
   * a partir del precio spot actual del mineral subyacente.
   * @route GET /api/productos/:id
   * @param {Express.Request}  req - Params: `id` (id_product).
   * @param {Express.Response} res - 200 con el producto y `precio_actual`, 404 si no existe, 500 en error.
   * @returns {Promise<void>}
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await productService.getById(id);

      if (!producto) {
        return res.status(404).json({
          ok: false,
          mensaje: `Producto con id '${id}' no encontrado`
        });
      }

      res.json({
        ok: true,
        datos: producto,
        mensaje: 'Producto recuperado correctamente'
      });
    } catch (error) {
      console.error('Error en getById producto:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno al obtener el producto'
      });
    }
  }
}

module.exports = new ProductController();
