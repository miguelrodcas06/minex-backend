// config/sequelize.js
const { logMensaje } = require("../utils/logger.js");
const { Sequelize } = require("sequelize");
// Importar fichero de configuración con variables de entorno
const config = require("./config");

// Instanciar sequelize  para conectar a mysql
const sequelize = new Sequelize(
  config.db.name, // nombre bd
  config.db.user, // usuario
  config.db.password, // password
  {
    // objeto con opciones de conexion
    host: config.db.host, // Cambia esto por la dirección del servidor MySQL
    port: config.db.port, // Cambia esto por el puerto del servidor MySql
    dialect: "mysql", // Especificar el dialecto de la base de datos
    // logging: false, // Desactiva el logging de las consultas SQL
    logging: (msg) => {
      if (msg.includes("ERROR")) {
        console.error("Error de Sequelize:", msg);
      }
    },
  }
);

// Probar la conexión
(async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== "test") {
      logMensaje("Conexión exitosa a la base de datos MySQL");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
})();

module.exports = sequelize; // Exportar la instancia de Sequelize para usarla en otros archivos
