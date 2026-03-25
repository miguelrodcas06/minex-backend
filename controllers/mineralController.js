// controllers/mineralController.js
const { logMensaje } = require("../utils/logger.js");
const mineralService = require("../services/mineralService");

class MineralController {
  // controllers/mineralController.js
  async getCotizacion(req, res) {
    try {
      const { nombre } = req.params;
      // Atrapamos la moneda de la URL (si no viene, por defecto será undefined)
      const { moneda } = req.query;

      // Le pasamos la moneda al servicio
      const datos = await mineralService.getCotizacion(nombre, moneda);

      if (!datos) {
        return res.status(404).json({
          ok: false,
          mensaje: `Mineral '${nombre}' no soportado`,
        });
      }

      res.json({
        ok: true,
        datos,
        mensaje: `Cotización del mineral ${nombre} recuperada correctamente`,
      });
    } catch (error) {
      console.error("Error en getCotizacion:", error);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al obtener la cotización",
      });
    }
  }
  async getHistorico(req, res) {
    try {
      // Pillamos el nombre del mineral de la URL (ej: /api/minerales/Oro/historico)
      const { nombre } = req.params;
      // Pillamos el periodo de los query params (ej: ?periodo=12m)
      const { periodo } = req.query;

      // Delegamos la creación de los datos al servicio
      const datos = await mineralService.getHistorico(nombre, periodo);

      if (!datos) {
        return res.status(400).json({
          ok: false,
          mensaje: `No se pudo generar el histórico para '${nombre}' con el periodo '${periodo}'`,
        });
      }

      res.json({
        ok: true,
        datos,
        mensaje: `Histórico del mineral ${nombre} recuperado correctamente`,
      });
    } catch (error) {
      console.error("Error en getHistorico:", error);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al obtener el histórico",
      });
    }
  }
  async getNoticias(req, res) {
    try {
      // Atrapamos el tema de búsqueda (por si desde React queremos buscar otra cosa)
      const { tema } = req.query;
      const busqueda = tema || "gold market"; // 'gold market' por defecto

      const noticias = await mineralService.getNoticias(busqueda);

      if (!noticias) {
        return res.status(500).json({
          ok: false,
          mensaje: "No se pudieron obtener las noticias en este momento.",
        });
      }

      res.json({
        ok: true,
        datos: noticias,
        mensaje: "Noticias recuperadas correctamente",
      });
    } catch (error) {
      console.error("Error en getNoticias:", error);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al obtener las noticias",
      });
    }
  }
}

module.exports = new MineralController();
