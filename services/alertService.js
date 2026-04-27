/**
 * @fileoverview Servicio de alertas de precio: CRUD completo sobre la tabla `price_alerts`.
 * Incluye toggle de estado activo/pausado y eliminación manual por el usuario.
 * @module services/alertService
 */

// services/alertService.js

const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);

// ¡CORRECCIÓN AQUÍ! Usamos camelCase tal cual lo exporta tu init-models.js
const PriceAlert = models.priceAlerts;
const Mineral = models.minerals;

/**
 * Servicio de negocio para gestión de alertas de precio de minerales.
 */
class AlertService {
  /**
   * Crea una nueva alerta de precio activa para el usuario indicado.
   * @param {{ id_user: number, id_mineral: number, threshold_price: number, condition_type: "above"|"below" }} datosAlerta
   * @returns {Promise<object>} Instancia Sequelize de la alerta creada.
   */
  async crearAlerta(datosAlerta) {
    const { id_user, id_mineral, threshold_price, condition_type } = datosAlerta;

    const nuevaAlerta = await PriceAlert.create({
      id_user: id_user,
      id_mineral: id_mineral,
      threshold_price: threshold_price,
      condition_type: condition_type,
      is_active: true,
    });

    return nuevaAlerta;
  }

  /**
   * Devuelve todas las alertas de un usuario (activas y pausadas), ordenadas por fecha DESC.
   * Incluye el nombre y símbolo del mineral asociado.
   * @param {number} id_user - ID del usuario.
   * @returns {Promise<Array<object>>} Array de alertas con datos del mineral.
   */
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

  /**
   * Alterna el campo `is_active` de una alerta entre 0 y 1.
   * Verifica que la alerta pertenezca al usuario para evitar escalada de privilegios.
   * @param {number} id_alert - ID de la alerta.
   * @param {number} id_user - ID del usuario propietario.
   * @returns {Promise<object>} Alerta actualizada.
   * @throws {Error} Si la alerta no existe o no pertenece al usuario.
   */
  async toggleAlerta(id_alert, id_user) {
    // Buscamos la alerta asegurándonos de que pertenezca al usuario
    const alerta = await PriceAlert.findOne({
      where: { id_alert: id_alert, id_user: id_user },
    });

    if (!alerta) {
      throw new Error("Alerta no encontrada o no tienes permiso");
    }

    // Si tiene algo verdadero (1 o true), lo pasamos a 0. Si no, lo pasamos a 1.
    alerta.is_active = !alerta.is_active;
    await alerta.save();

    return alerta;
  }

  /**
   * Elimina permanentemente una alerta de la base de datos.
   * @param {number} id_alert - ID de la alerta a eliminar.
   * @param {number} id_user - ID del usuario propietario (verificación de pertenencia).
   * @returns {Promise<true>}
   * @throws {Error} Si la alerta no se encuentra.
   */
  async eliminarAlerta(id_alert, id_user) {
    const alerta = await PriceAlert.findOne({ where: { id_alert, id_user } });
    if (!alerta) throw new Error("Alerta no encontrada");
    await alerta.destroy();
    return true;
  }
}

module.exports = new AlertService();
