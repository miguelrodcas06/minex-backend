// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/productos              → catálogo completo (filtros: ?type=coin&mineral=oro&exclusive=true)
router.get('/', productController.getAll);

// GET /api/productos/:id          → detalle de un producto con precio actual
router.get('/:id', productController.getById);

module.exports = router;
