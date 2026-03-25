const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alertNotifications', {
    id_notification: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_alert: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'price_alerts',
        key: 'id_alert'
      }
    },
    triggered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    price_at_trigger: {
      type: DataTypes.DECIMAL(12,4),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'alert_notifications',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_notification" },
        ]
      },
      {
        name: "fk_notification_alert",
        using: "BTREE",
        fields: [
          { name: "id_alert" },
        ]
      },
    ]
  });
};
