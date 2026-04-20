/**
 * @fileoverview Carga y exporta la configuración de la aplicación MineX a partir de
 * variables de entorno. Soporta tanto el entorno Docker (DBHOST, DBUSER…) como
 * el entorno local (DB_HOST, DB_USER…).
 * @module config/config
 */

const { logMensaje } = require("../utils/logger.js");

// Intentamos cargar dotenv para desarrollo local.
// En Docker no es necesario porque las variables vienen del sistema, 
// así que si falla (try/catch), no rompe la app.
try {
  require("dotenv").config();
} catch (error) {
  // Silencioso: en producción/Docker es normal que no haya archivo .env
}

const config = {
  port: process.env.PORT || 3000,
  db: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DBHOST || process.env.DB_HOST || "localhost",
    user: process.env.DBUSER || process.env.DB_USER || "root",
    password: process.env.DBPASSWORD || process.env.DB_PASSWORD || "test",
    name: process.env.DBNAME || process.env.DB_NAME || "minex",
    port: process.env.DBPORT || process.env.DB_PORT || 5432,
  },
  secretKey: process.env.SECRET_KEY || "default_secret",
};

// Logs para verificar qué está leyendo realmente
logMensaje("--- CONFIGURACIÓN CARGADA ---");
logMensaje("NODE_ENV:", process.env.NODE_ENV);
// Imprimimos config.db.host para ver cuál de las dos variables ganó
logMensaje("DBHOST final:", config.db.host); 
logMensaje("DBNAME final:", config.db.name);
logMensaje("DBUSER final:", config.db.user);

module.exports = config;