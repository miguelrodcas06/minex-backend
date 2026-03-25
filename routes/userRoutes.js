const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verificarToken = require("../middlewares/authMiddleware");

// Rutas públicas
router.post("/", userController.registrarUsuario.bind(userController));
router.post("/login", userController.login.bind(userController));

// Rutas protegidas
router.get("/perfil", verificarToken, userController.obtenerPerfil.bind(userController)); // La de prueba de ayer
router.get("/", verificarToken, userController.obtenerUsuarios.bind(userController));
router.get("/saldo", verificarToken, userController.obtenerSaldo.bind(userController));
// --- RUTA PUT ---
router.put("/perfil", verificarToken, userController.actualizarPerfil.bind(userController));
router.put('/baja', verificarToken, userController.darDeBaja.bind(userController));

// Ruta PÚBLICA: PUT /api/usuarios/reactivar (El usuario despierta su cuenta con sus credenciales)
router.put('/reactivar', userController.reactivarCuenta.bind(userController));

module.exports = router;
