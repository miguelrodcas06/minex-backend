/**
 * @fileoverview Rutas de la API para la gestión de usuarios de MineX.
 *
 * | Método | Ruta                       | Auth | Descripción                          |
 * |--------|----------------------------|------|--------------------------------------|
 * | POST   | /api/usuarios              | No   | Registro de nuevo usuario            |
 * | POST   | /api/usuarios/login        | No   | Login y obtención de JWT             |
 * | GET    | /api/usuarios/perfil       | JWT  | Datos del usuario autenticado        |
 * | GET    | /api/usuarios              | JWT  | Listado de todos los usuarios        |
 * | GET    | /api/usuarios/saldo        | JWT  | Saldo disponible del usuario         |
 * | PUT    | /api/usuarios/perfil       | JWT  | Actualizar username / email          |
 * | PUT    | /api/usuarios/baja         | JWT  | Baja lógica de la cuenta             |
 * | PUT    | /api/usuarios/reactivar    | No   | Reactivar cuenta con credenciales    |
 *
 * @module routes/userRoutes
 */

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

// Recuperación de contraseña (públicas)
router.post('/recuperar-password', userController.solicitarRecuperacion.bind(userController));
router.post('/resetear-password', userController.resetearPassword.bind(userController));

module.exports = router;
