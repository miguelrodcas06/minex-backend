/**
 * @fileoverview Inicializa y exporta la instancia de Sequelize conectada a MySQL.
 * Verifica la conexión al arrancar y registra solo los errores SQL.
 * @module config/sequelize
 */

// config/sequelize.js
const { logMensaje } = require("../utils/logger.js");
const { Sequelize } = require("sequelize");
// Importar fichero de configuración con variables de entorno
const config = require("./config");

const dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
const logging = (msg) => { if (msg.includes("ERROR")) console.error("Error de Sequelize:", msg); };

const sequelize = config.db.url
  ? new Sequelize(config.db.url, { dialect: "postgres", logging, dialectOptions, timezone: "+00:00" })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: "postgres",
      logging,
      dialectOptions,
      timezone: "+00:00",
    });

// Probar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== "test") {
      logMensaje("Conexión exitosa a la base de datos PostgreSQL");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
})();

module.exports = sequelize; // Exportar la instancia de Sequelize para usarla en otros archivos
