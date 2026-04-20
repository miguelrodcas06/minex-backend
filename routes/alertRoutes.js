/**
 * @fileoverview Rutas de la API para la gestión de alertas de precio.
 * Todas las rutas requieren JWT.
 *
 * | Método | Ruta                               | Auth | Descripción                              |
 * |--------|------------------------------------|------|------------------------------------------|
 * | POST   | /api/alertas                       | JWT  | Crear nueva alerta                       |
 * | GET    | /api/alertas                       | JWT  | Ver todas mis alertas (activas/pausadas) |
 * | PATCH  | /api/alertas/toggle/:id_alert      | JWT  | Activar / pausar una alerta              |
 * | DELETE | /api/alertas/:id_alert             | JWT  | Eliminar una alerta permanentemente      |
 *
 * @module routes/alertRoutes
 */

const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const verificarToken = require("../middlewares/authMiddleware");

// --- RUTAS DE ALERTAS (Todas protegidas con JWT) ---

// 1. Crear nueva alerta (POST /api/alertas)
router.post("/", verificarToken, alertController.crearAlerta.bind(alertController));

// 2. Ver mis alertas (Activas y Pausadas) (GET /api/alertas)
router.get("/", verificarToken, alertController.obtenerAlertasUsuario.bind(alertController));

// 3. El INTERRUPTOR: Activar/Pausar (PATCH /api/alertas/toggle/5)
router.patch("/toggle/:id_alert", verificarToken, alertController.toggleAlerta.bind(alertController));

// 4. ELIMINAR manualmente (DELETE /api/alertas/5)
router.delete("/:id_alert", verificarToken, alertController.eliminarAlerta.bind(alertController));

module.exports = router;