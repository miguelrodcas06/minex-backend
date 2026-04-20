/**
 * @fileoverview Servicio de tesorería: compra y venta de minerales con precios en tiempo real,
 * consulta del portfolio con P&L calculado y gestión del balance del usuario.
 * @module services/treasuryService
 */

// services/treasuryService.js
const mineralService = require("./mineralService");

const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);

const Treasury = models.treasuries;
const TreasuryItem = models.treasuryItems;
const Mineral = models.minerals;
const User = models.users;

/**
 * Servicio de negocio para la gestión del portfolio de minerales de cada usuario.
 */
class TreasuryService {
  /**
   * Compra `cantidad` gramos de un mineral al precio spot actual.
   * Crea la tesorería del usuario si no existe, verifica su saldo y registra
   * el ítem con el precio de compra como referencia histórica.
   * @param {number} id_user - ID del usuario comprador.
   * @param {string} nombreMineral - Nombre del mineral (ej. "oro").
   * @param {number} cantidad - Gramos a comprar (> 0).
   * @returns {Promise<{ mensaje: string, item: object, detallesCotizacion: object, nuevo_balance: number }>}
   * @throws {Error} Si el mineral no existe, no se puede cotizar o el saldo es insuficiente.
   */
  async agregarMineral(id_user, nombreMineral, cantidad) {
    // 1. Buscamos el mineral en la base de datos (ej: "oro")
    const mineralDB = await Mineral.findOne({ where: { name: nombreMineral } });
    if (!mineralDB) {
      throw new Error(`El mineral '${nombreMineral}' no está registrado en la base de datos de MineX.`);
    }

    // 2. Buscamos la tesorería del usuario. Si no tiene, la creamos
    const [tesoreria] = await Treasury.findOrCreate({
      where: { id_user: id_user },
    });

    // 3. Consultamos el precio en TIEMPO REAL a Yahoo Finance
    const datosCotizacion = await mineralService.getCotizacion(nombreMineral);
    if (!datosCotizacion || !datosCotizacion.precio) {
      throw new Error(`No se pudo obtener el precio actual de '${nombreMineral}' desde Yahoo Finance.`);
    }

    // 🔴 4. NUEVA LÓGICA: Calculamos el coste y verificamos el saldo
    const usuario = await User.findByPk(id_user); // (Asegúrate de tener User importado arriba)
    const costeTotal = cantidad * datosCotizacion.precio;

    // Comprobamos si es lo suficientemente rico para esta compra
    if (parseFloat(usuario.balance) < costeTotal) {
      throw new Error(`Saldo insuficiente. La compra cuesta $${costeTotal.toFixed(2)}, pero solo tienes $${parseFloat(usuario.balance).toFixed(2)}.`);
    }

    // 🔴 5. Le restamos el dinero del balance y lo guardamos
    usuario.balance = parseFloat(usuario.balance) - costeTotal;
    await usuario.save();

    // 6. Guardamos el ítem en la tesorería (Creamos el "Ticket de compra")
    const nuevoItem = await TreasuryItem.create({
      id_treasury: tesoreria.id_treasury,
      id_mineral: mineralDB.id_mineral,
      quantity: cantidad,
      purchase_price: datosCotizacion.precio,
    });

    return {
      mensaje: `¡Compra exitosa! Has adquirido ${cantidad}g de ${nombreMineral} por $${costeTotal.toFixed(2)}.`,
      item: nuevoItem,
      detallesCotizacion: datosCotizacion,
      nuevo_balance: usuario.balance
    };
  }

  /**
   * Devuelve el portfolio completo del usuario con precios actuales y cálculo de P&L por ítem.
   * Consulta Yahoo Finance en tiempo real para cada mineral en cartera.
   * Si el usuario no tiene tesorería, devuelve un objeto vacío con resumen a 0.
   * @param {number} id_user - ID del usuario.
   * @returns {Promise<{ items: Array<object>, resumen: { total_invertido: string, valor_actual_total: string, balance_total: string } }>}
   */
  async obtenerTesoreria(id_user) {
    // 1. Buscamos la tesorería del usuario
    const tesoreria = await Treasury.findOne({ where: { id_user: id_user } });

    // Si no tiene tesorería, le devolvemos los contadores a 0
    if (!tesoreria) {
      return { items: [], resumen: { totalInvertido: 0, valorActual: 0, balanceTotal: 0 } };
    }

    // 2. Buscamos todos los ítems de su tesorería, INCLUYENDO los datos del mineral
    const items = await TreasuryItem.findAll({
      where: { id_treasury: tesoreria.id_treasury },
      include: [
        {
          model: Mineral,
          as: "id_mineral_mineral", // El nombre exacto de tu init-models.js
          attributes: ["name", "symbol"],
        },
      ],
    });

    let totalInvertido = 0;
    let valorActualTotal = 0;
    const itemsProcesados = [];

    // 3. Recorremos cada ítem para calcular las ganancias/pérdidas
    for (const item of items) {
      const nombreMineral = item.id_mineral_mineral.name;
      const cantidad = parseFloat(item.quantity);
      const precioCompra = parseFloat(item.purchase_price);

      // Preguntamos el precio actual a Yahoo Finance
      let precioActual = precioCompra; // Por defecto ponemos el de compra por si falla Yahoo
      try {
        const cotizacion = await mineralService.getCotizacion(nombreMineral);
        if (cotizacion && cotizacion.precio) {
          precioActual = cotizacion.precio;
        }
      } catch (error) {
        console.warn(`No se pudo obtener el precio actual de ${nombreMineral}`);
      }

      // Matemáticas financieras
      const valorInvertidoItem = cantidad * precioCompra;
      const valorActualItem = cantidad * precioActual;
      const gananciaPerdida = valorActualItem - valorInvertidoItem;

      // Sumamos al total global de la mochila
      totalInvertido += valorInvertidoItem;
      valorActualTotal += valorActualItem;

      // Guardamos el ítem limpio para enviarlo al frontend
      itemsProcesados.push({
        id_item: item.id_item,
        mineral: nombreMineral,
        simbolo: item.id_mineral_mineral.symbol,
        cantidad: cantidad,
        precio_compra: precioCompra,
        precio_actual: precioActual,
        valor_invertido: valorInvertidoItem.toFixed(2),
        valor_actual: valorActualItem.toFixed(2),
        rendimiento: gananciaPerdida.toFixed(2),
        estado: gananciaPerdida >= 0 ? "ganando 📈" : "perdiendo 📉",
      });
    }

    // 4. Devolvemos todo empaquetado y bonito
    return {
      items: itemsProcesados,
      resumen: {
        total_invertido: totalInvertido.toFixed(2),
        valor_actual_total: valorActualTotal.toFixed(2),
        balance_total: (valorActualTotal - totalInvertido).toFixed(2),
      },
    };
  }
  /**
   * Vende `cantidad_vender` gramos de un ítem de la tesorería al precio spot actual.
   * Ingresa el importe en el balance del usuario y elimina (o reduce) el ítem.
   * @param {number} id_user - ID del usuario vendedor.
   * @param {number} id_item - ID del ítem de tesorería a vender.
   * @param {number} cantidad_vender - Gramos a vender (≤ stock disponible).
   * @returns {Promise<{ mensaje: string, nuevo_balance: number }>}
   * @throws {Error} Si la tesorería no existe, el ítem no pertenece al usuario,
   *                 la cantidad supera el stock o no se puede cotizar el mineral.
   */
  async venderMineral(id_user, id_item, cantidad_vender) {
    const tesoreria = await Treasury.findOne({ where: { id_user: id_user } });
    if (!tesoreria) {
      throw new Error("No tienes una tesorería activa.");
    }

    // 1. Buscamos el ítem E INCLUIMOS los datos del mineral para saber su nombre
    const item = await TreasuryItem.findOne({
      where: { 
        id_item: id_item,
        id_treasury: tesoreria.id_treasury 
      },
      include: [
        {
          model: Mineral,
          as: "id_mineral_mineral", // La relación de tu init-models
          attributes: ["name"]
        }
      ]
    });

    if (!item) {
      throw new Error("El mineral no existe o no te pertenece.");
    }

    if (cantidad_vender > item.quantity) {
      throw new Error(`Solo tienes ${item.quantity} gramos disponibles para vender.`);
    }

    // 2. 🟢 ¡MAGIA EN TIEMPO REAL! Preguntamos el precio actual a Yahoo Finance
    const nombreMineral = item.id_mineral_mineral.name;
    const datosCotizacion = await mineralService.getCotizacion(nombreMineral);
    
    if (!datosCotizacion || !datosCotizacion.precio) {
      throw new Error(`No se pudo obtener el precio actual de '${nombreMineral}' en el mercado.`);
    }

    const precio_gramo_actual = datosCotizacion.precio; 
    const total_ganancia = cantidad_vender * precio_gramo_actual;

    // 3. Ingresamos el dinero en el balance
    const usuario = await User.findByPk(id_user);
    usuario.balance = parseFloat(usuario.balance) + total_ganancia;
    await usuario.save();

    // 4. Actualizamos el inventario
    if (parseFloat(cantidad_vender) === parseFloat(item.quantity)) {
      await item.destroy();
    } else {
      item.quantity = parseFloat(item.quantity) - parseFloat(cantidad_vender);
      await item.save();
    }

    return {
      mensaje: `Venta exitosa. Has vendido ${cantidad_vender}g de ${nombreMineral} a $${precio_gramo_actual.toFixed(2)}/g. Total: $${total_ganancia.toFixed(2)}.`,
      nuevo_balance: usuario.balance
    };
  }
}

module.exports = new TreasuryService();
