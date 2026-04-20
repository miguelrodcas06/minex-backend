/**
 * @fileoverview Controlador de alertas de precio: creación, consulta, toggle y eliminación.
 * Todas las rutas están protegidas por JWT. Delega en {@link module:services/alertService}.
 * @module controllers/alertController
 */

const alertService = require("../services/alertService");

/**
 * Controlador HTTP para la gestión de alertas de precio del usuario.
 */
class AlertController {

  /**
   * Crea una nueva alerta de precio para el usuario autenticado.
   * @route POST /api/alertas
   * @param {Express.Request}  req - Body: `{ id_mineral, threshold_price, condition_type }`. Requiere token.
   * @param {Express.Response} res - 201 con la alerta creada, o 400/500 en error.
   * @returns {Promise<void>}
   */
  async crearAlerta(req, res) {
    try {
      const id_user = req.usuario.id_user; 
      const { id_mineral, threshold_price, condition_type } = req.body;

      if (!id_mineral || !threshold_price || !condition_type) {
        return res.status(400).json({ ok: false, mensaje: "Faltan datos obligatorios" });
      }

      const nuevaAlerta = await alertService.crearAlerta({
        id_user, id_mineral, threshold_price, condition_type
      });

      res.status(201).json({ ok: true, mensaje: "Alerta creada correctamente", datos: nuevaAlerta });
    } catch (error) {
      console.error("Error al crear alerta:", error.message);
      res.status(500).json({ ok: false, mensaje: "Error al crear alerta" });
    }
  }

  /**
   * Devuelve todas las alertas (activas y pausadas) del usuario autenticado.
   * @route GET /api/alertas
   * @param {Express.Request}  req - Requiere token válido.
   * @param {Express.Response} res - 200 con array de alertas, o 500 en error.
   * @returns {Promise<void>}
   */
  async obtenerAlertasUsuario(req, res) {
    try {
      const id_user = req.usuario.id_user;
      const alertas = await alertService.obtenerAlertasUsuario(id_user);
      res.status(200).json({ ok: true, cantidad: alertas.length, datos: alertas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: "Error al obtener alertas" });
    }
  }

  /**
   * Alterna el estado activo/pausado de una alerta del usuario autenticado.
   * Solo el propietario de la alerta puede modificarla (verificado por `id_user`).
   * @route PATCH /api/alertas/toggle/:id_alert
   * @param {Express.Request}  req - Params: `id_alert`. Requiere token.
   * @param {Express.Response} res - 200 con la alerta actualizada, 404 si no se encuentra, 500 en error.
   * @returns {Promise<void>}
   */
  async toggleAlerta(req, res) {
    try {
      const { id_alert } = req.params;
      const id_user = req.usuario.id_user; // Seguridad: solo el dueño puede tocarla

      const alertaActualizada = await alertService.toggleAlerta(id_alert, id_user);

      res.status(200).json({
        ok: true,
        mensaje: `Alerta ${alertaActualizada.is_active ? 'activada' : 'desactivada'} correctamente`,
        datos: alertaActualizada
      });

    } catch (error) {
      console.error("Error en toggleAlerta:", error.message);
      if (error.message.includes("no encontrada")) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }
      res.status(500).json({ ok: false, mensaje: "Error al cambiar el estado de la alerta" });
    }
  }

  /**
   * Elimina permanentemente una alerta del usuario autenticado.
   * @route DELETE /api/alertas/:id_alert
   * @param {Express.Request}  req - Params: `id_alert`. Requiere token.
   * @param {Express.Response} res - 200 confirmando la eliminación, o 500 en error.
   * @returns {Promise<void>}
   */
  async eliminarAlerta(req, res) {
  try {
    const { id_alert } = req.params;
    const id_user = req.usuario.id_user;

    await alertService.eliminarAlerta(id_alert, id_user);

    res.status(200).json({ ok: true, mensaje: "Alerta eliminada definitivamente" });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
}
}

module.exports = new AlertController();