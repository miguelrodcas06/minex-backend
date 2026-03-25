// config/auto.js
const { logMensaje } = require("../utils/logger.js");
const SequelizeAuto = require("sequelize-auto");
const config = require('./config');

const auto = new SequelizeAuto(
  config.db.name, 
  config.db.user, 
  config.db.password, 
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "mysql",
    directory: "./models", 
    caseModel: 'c', 
    caseFile: "c", 
    additional: { timestamps: false }
  }
);

auto.run().then((data) => {
  logMensaje("¡Modelos creados con éxito! Tablas leídas: " + Object.keys(data.tables).join(", ")); 
});