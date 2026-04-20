/**
 * @fileoverview Rutas de la API para el catálogo de productos físicos de metales preciosos.
 * Rutas públicas, no requieren autenticación.
 *
 * | Método | Ruta                   | Auth | Descripción                                      |
 * |--------|------------------------|------|--------------------------------------------------|
 * | GET    | /api/productos         | No   | Catálogo con filtros opcionales (type/mineral/exclusive) |
 * | GET    | /api/productos/:id     | No   | Detalle del producto con precio actual calculado |
 *
 * @module routes/productRoutes
 */

// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/productos              → catálogo completo (filtros: ?type=coin&mineral=oro&exclusive=true)
router.get('/', productController.getAll);

// GET /api/productos/:id          → detalle de un producto con precio actual
router.get('/:id', productController.getById);

module.exports = router;
