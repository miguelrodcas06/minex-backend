// services/vigilanteService.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// 1. Importamos TU servicio de minerales en lugar de Yahoo directamente
const mineralService = require("./mineralService");

// Configuración de modelos de la BD
const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);

const PriceAlert = models.priceAlerts;
const Mineral = models.minerals;
const AlertNotification = models.alertNotifications;
const User = models.users;

class VigilanteService {
  constructor() {
    // Configuramos el "cartero" de Nodemailer
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Función principal que revisará los precios
  async revisarAlertas() {
    console.log("🕵️‍♂️ [Vigilante] Revisando alertas de precios...");

    try {
      // 1. Buscar todas las alertas ACTIVAS de usuarios con cuenta activa
      const alertasActivas = await PriceAlert.findAll({
        where: { is_active: 1 },
        include: [
          { model: Mineral, as: "id_mineral_mineral", attributes: ["name", "symbol"] },
          { model: User, as: "id_user_user", attributes: ["email", "username"], where: { is_active: 1 } },
        ],
      });

      if (alertasActivas.length === 0) {
        console.log("🕵️‍♂️ [Vigilante] No hay alertas activas en este momento.");
        return;
      }

      // 2. Recorrer cada alerta para comprobar el precio
      for (const alerta of alertasActivas) {
        const nombreMineral = alerta.id_mineral_mineral.name; // Ej: "Oro"
        const emailUsuario = alerta.id_user_user.email;
        const nombreUsuario = alerta.id_user_user.username;

        // --- LA MAGIA: Usamos tu servicio para obtener el precio en GRAMOS ---
        const cotizacion = await mineralService.getCotizacion(nombreMineral);

        if (!cotizacion) {
          console.log(`⚠️ No se pudo obtener la cotización para ${nombreMineral}`);
          continue; // Saltamos a la siguiente alerta si hay error
        }

        const precioActual = cotizacion.precio; // Ya viene en USD/g y con 4 decimales
        let seCumpleCondicion = false;

        // Comprobamos la condición (Gramo vs Gramo)
        if (alerta.condition_type === "above" && precioActual >= alerta.threshold_price) {
          seCumpleCondicion = true;
        } else if (alerta.condition_type === "below" && precioActual <= alerta.threshold_price) {
          seCumpleCondicion = true;
        }

        // 3. ¡Si se cumple, DISPARAMOS LA ALERTA!
        if (seCumpleCondicion) {
          console.log(`🚨 ¡ALERTA DISPARADA! ${nombreMineral} ha tocado los ${precioActual}$/g`);

          // A. Guardamos el historial en alert_notifications
          await AlertNotification.create({
            id_alert: alerta.id_alert,
            triggered_at: new Date(),
            price_at_trigger: precioActual,
            message: `El precio de ${nombreMineral} cruzó tu objetivo de ${alerta.threshold_price}$/g`,
          });

          // B. Desactivamos la alerta principal (Borrado lógico)
          await alerta.destroy();
          console.log(`🗑️ Alerta cumplida y eliminada de la lista de seguimiento.`);

          // C. Enviamos el correo electrónico
          await this.enviarCorreo(emailUsuario, nombreUsuario, nombreMineral, precioActual, alerta.threshold_price, alerta.condition_type);
        }
      }
    } catch (error) {
      console.error("Error en el vigilante de alertas:", error);
    }
  }

  // Función para mandar el email
  async enviarCorreo(email, usuario, mineral, precioActual, precioObjetivo, condicion) {
    const direccion = condicion === "above" ? "superado" : "caído por debajo de";

    const mailOptions = {
      from: `"MineX Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚨 Alerta MineX: ¡${mineral} ha alcanzado tu objetivo!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #D4AF37;">¡Hola ${usuario}! 👑</h2>
          <p>Tu alerta programada en <b>MineX</b> acaba de dispararse.</p>
          <p>El precio del <b>${mineral}</b> ha ${direccion} tu objetivo de <b>$${precioObjetivo}/g</b>.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;">Precio de cruce actual: <b>$${precioActual}/g</b></p>
          </div>
          <p>Entra en tu panel de MineX para revisar tus tesoros y decidir tu próximo movimiento.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de alerta enviado con éxito a ${email}`);
    } catch (error) {
      // Solo mostramos un aviso si falla el email, pero la BD ya se actualizó
      console.log(`⚠️ Alerta registrada en BD, pero no se pudo enviar el email a ${email} (Falta configurar .env)`);
    }
  }

  // Función para arrancar el cron
  iniciar() {
    // Para PRUEBAS: Lo ponemos a 1 minuto. Luego cámbialo a '*/2 * * * *' o '0 * * * *' (cada hora)
    cron.schedule("*/15 * * * *", () => {
      this.revisarAlertas();
    });
    console.log("🕵️‍♂️ Vigilante de alertas INICIADO (Revisando precios cada minuto).");
  }
}

module.exports = new VigilanteService();