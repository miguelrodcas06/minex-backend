// controllers/productController.js
const productService = require('../services/productService');

class ProductController {
  // GET /api/productos?type=coin&mineral=oro&exclusive=true
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

  // GET /api/productos/:id
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
