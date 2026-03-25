// controllers/treasuryController.js
const treasuryService = require('../services/treasuryService');

class TreasuryController {

  async agregar(req, res) {
    try {
      // El ID del usuario lo sacamos de forma segura del Token
      const idUsuario = req.usuario.id_user; 
      // El mineral y la cantidad nos la envía el usuario en el body
      const { mineral, cantidad } = req.body;

      if (!mineral || !cantidad || cantidad <= 0) {
        return res.status(400).json({ ok: false, mensaje: 'Debes indicar un mineral válido y una cantidad mayor que 0.' });
      }

      const resultado = await treasuryService.agregarMineral(idUsuario, mineral, cantidad);

      res.status(201).json({
        ok: true,
        mensaje: `Has añadido ${cantidad}g de ${mineral} a tu tesorería correctamente.`,
        datos: resultado
      });

    } catch (error) {
      console.error("Error al añadir a la tesorería:", error.message);
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  async obtenerTesoreria(req, res) {
    try {
      // El Token nos dice quién es el usuario
      const idUsuario = req.usuario.id_user; 
      
      const datosTesoreria = await treasuryService.obtenerTesoreria(idUsuario);

      res.status(200).json({
        ok: true,
        mensaje: "Tesorería recuperada con éxito",
        datos: datosTesoreria
      });

    } catch (error) {
      console.error("Error al obtener la tesorería:", error.message);
      res.status(500).json({ ok: false, mensaje: "Error interno al cargar tu tesorería." });
    }
  }
  async vender(req, res) {
    try {
      // 1. Sacamos el ID del usuario de forma 100% segura desde el Token
      const id_user = req.usuario.id_user;
      
      // 2. Sacamos qué quiere vender y cuántos gramos desde el body
      const { id_item, cantidad } = req.body;

      // Validación básica
      if (!id_item || !cantidad || cantidad <= 0) {
        return res.status(400).json({ 
          ok: false, 
          mensaje: "Debes indicar el id_item y una cantidad válida mayor que 0." 
        });
      }

      // 3. Llamamos al servicio (al bróker)
      const resultado = await treasuryService.venderMineral(id_user, id_item, cantidad);

      // 4. Respondemos con éxito
      res.status(200).json({
        ok: true,
        mensaje: resultado.mensaje,
        nuevo_balance: resultado.nuevo_balance
      });

    } catch (error) {
      console.error("Error al vender mineral:", error.message);
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

}

module.exports = new TreasuryController();