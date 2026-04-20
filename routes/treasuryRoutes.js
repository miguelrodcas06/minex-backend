/**
 * @fileoverview Rutas de la API para la gestión de la tesorería (portfolio) del usuario.
 * Todas las rutas requieren JWT.
 *
 * | Método | Ruta                   | Auth | Descripción                            |
 * |--------|------------------------|------|----------------------------------------|
 * | POST   | /api/tesoreria         | JWT  | Comprar gramos de un mineral           |
 * | POST   | /api/tesoreria/vender  | JWT  | Vender gramos de un ítem               |
 * | GET    | /api/tesoreria         | JWT  | Ver portfolio con P&L en tiempo real   |
 *
 * @module routes/treasuryRoutes
 */

// routes/treasuryRoutes.js
const express = require('express');
const router = express.Router();
const treasuryController = require('../controllers/treasuryController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta protegida: POST /api/tesoreria
// Solo los usuarios con un token válido pueden añadir cosas a su tesorería
router.post('/', verificarToken, treasuryController.agregar.bind(treasuryController));
router.post('/vender', verificarToken, treasuryController.vender.bind(treasuryController));

// Ruta protegida: GET /api/tesoreria (Ver mis ganancias)
router.get('/', verificarToken, treasuryController.obtenerTesoreria.bind(treasuryController));

module.exports = router;