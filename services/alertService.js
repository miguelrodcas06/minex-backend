// services/alertService.js

const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);

// ¡CORRECCIÓN AQUÍ! Usamos camelCase tal cual lo exporta tu init-models.js
const PriceAlert = models.priceAlerts;
const Mineral = models.minerals;

class AlertService {
  // 1. Crear una nueva alerta
  async crearAlerta(datosAlerta) {
    const { id_user, id_mineral, threshold_price, condition_type } = datosAlerta;

    const nuevaAlerta = await PriceAlert.create({
      id_user: id_user,
      id_mineral: id_mineral,
      threshold_price: threshold_price,
      condition_type: condition_type,
      is_active: 1,
    });

    return nuevaAlerta;
  }

  // 2. Obtener TODAS las alertas de un usuario (Activas y Pausadas)
  async obtenerAlertasUsuario(id_user) {
    const alertas = await PriceAlert.findAll({
      where: {
        id_user: id_user,
        // ¡HEMOS BORRADO EL is_active: 1!
        // Ahora traerá las alertas que estén en 1 (activas) y en 0 (pausadas por el usuario).
      },
      include: [
        {
          model: Mineral,
          as: "id_mineral_mineral",
          attributes: ["name", "symbol"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return alertas;
  }

  async toggleAlerta(id_alert, id_user) {
    // Buscamos la alerta asegurándonos de que pertenezca al usuario
    const alerta = await PriceAlert.findOne({
      where: { id_alert: id_alert, id_user: id_user },
    });

    if (!alerta) {
      throw new Error("Alerta no encontrada o no tienes permiso");
    }

    // Si tiene algo verdadero (1 o true), lo pasamos a 0. Si no, lo pasamos a 1.
    alerta.is_active = alerta.is_active ? 0 : 1;
    await alerta.save();

    return alerta;
  }

  // Nueva función para que el usuario borre manualmente
  async eliminarAlerta(id_alert, id_user) {
    const alerta = await PriceAlert.findOne({ where: { id_alert, id_user } });
    if (!alerta) throw new Error("Alerta no encontrada");
    await alerta.destroy();
    return true;
  }
}

module.exports = new AlertService();
