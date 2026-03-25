const alertService = require("../services/alertService");

class AlertController {
  
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

  async obtenerAlertasUsuario(req, res) {
    try {
      const id_user = req.usuario.id_user;
      const alertas = await alertService.obtenerAlertasUsuario(id_user);
      res.status(200).json({ ok: true, cantidad: alertas.length, datos: alertas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: "Error al obtener alertas" });
    }
  }

  // Sustituimos desactivarAlerta por este Toggle
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