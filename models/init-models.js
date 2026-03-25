var DataTypes = require("sequelize").DataTypes;
var _alertNotifications = require("./alertNotifications");
var _minerals = require("./minerals");
var _priceAlerts = require("./priceAlerts");
var _treasuries = require("./treasuries");
var _treasuryItems = require("./treasuryItems");
var _users = require("./users");

function initModels(sequelize) {
  var alertNotifications = _alertNotifications(sequelize, DataTypes);
  var minerals = _minerals(sequelize, DataTypes);
  var priceAlerts = _priceAlerts(sequelize, DataTypes);
  var treasuries = _treasuries(sequelize, DataTypes);
  var treasuryItems = _treasuryItems(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  priceAlerts.belongsTo(minerals, { as: "id_mineral_mineral", foreignKey: "id_mineral"});
  minerals.hasMany(priceAlerts, { as: "price_alerts", foreignKey: "id_mineral"});
  
  treasuryItems.belongsTo(minerals, { as: "id_mineral_mineral", foreignKey: "id_mineral"});
  minerals.hasMany(treasuryItems, { as: "treasury_items", foreignKey: "id_mineral"});
  
  alertNotifications.belongsTo(priceAlerts, { as: "id_alert_price_alert", foreignKey: "id_alert"});
  priceAlerts.hasMany(alertNotifications, { as: "alert_notifications", foreignKey: "id_alert"});
  
  treasuryItems.belongsTo(treasuries, { as: "id_treasury_treasury", foreignKey: "id_treasury"});
  treasuries.hasMany(treasuryItems, { as: "treasury_items", foreignKey: "id_treasury"});
  
  priceAlerts.belongsTo(users, { as: "id_user_user", foreignKey: "id_user"});
  users.hasMany(priceAlerts, { as: "price_alerts", foreignKey: "id_user"});
  
  treasuries.belongsTo(users, { as: "id_user_user", foreignKey: "id_user"});
  users.hasMany(treasuries, { as: "treasuries", foreignKey: "id_user"});

  return {
    alertNotifications,
    minerals,
    priceAlerts,
    treasuries,
    treasuryItems,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;