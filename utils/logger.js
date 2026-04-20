/**
 * @fileoverview Utilidades de logging para la aplicación MineX.
 * @module utils/logger
 */

/**
 * Imprime un timestamp seguido de todos los argumentos recibidos y un separador.
 * Útil para trazar eventos del servidor con marca de tiempo.
 * @param {...*} args - Cualquier número de valores a imprimir.
 */
function logMensaje() {
  console.log(new Date());

  for (let parametro of arguments){
    console.log(parametro);
  }

  console.log("----------------------------------");
}

/**
 * Imprime los campos clave de un error de MySQL de forma estructurada.
 * @param {object} err - Objeto de error generado por MySQL2 / Sequelize.
 * @param {string} err.code - Código de error MySQL (p.ej. "ER_DUP_ENTRY").
 * @param {number} err.errno - Número de error MySQL.
 * @param {string} err.sqlMessage - Mensaje de error SQL en texto plano.
 * @param {string} err.sqlState - Estado SQLSTATE de cinco caracteres.
 */
function logErrorSQL(err){
  console.error('Error de MySQL:');
  console.error('Code:', err.code);
  console.error('Errno:', err.errno);
  console.error('SQL Message:', err.sqlMessage);
  console.error('SQL State:', err.sqlState);
}

module.exports = { logMensaje, logErrorSQL };