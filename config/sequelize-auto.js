const { logMensaje } = require("../utils/logger.js");
const SequelizeAuto = require("sequelize-auto");
// Importar fichero de configuración con variables de entorno
const config = require('./config');

const auto = new SequelizeAuto(
  config.db.name, // nombre bd
  config.db.user, // usuario
  config.db.password, // password
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "mysql",
    directory: "./models", // where to write files
    caseModel: 'c', // convert snake_case column names to camelCase field names: user_id -> userId
    caseFile: "c", // file names created for each model use camelCase.js not snake_case.js
    // singularize: true, // convert plural table names to singular model names
    additional: {
      timestamps: false,
      // ...options added to each model
    },
    // tables: ['table1', 'table2', 'myschema.table3'] // use all tables, if omitted
    //...
  }
);

auto.run().then((data) => {
  logMensaje(data.tables); // table and field list
  // logMensaje(data.foreignKeys); // table foreign key list
  // logMensaje(data.indexes);     // table indexes
  // logMensaje(data.hasTriggerTables); // tables that have triggers
  // logMensaje(data.relations);   // relationships between models
  logMensaje(data.text); // text of generated models
});
