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