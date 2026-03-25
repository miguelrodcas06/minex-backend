// services/mineralService.js
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance();

class MineralService {
  async getCotizacion(mineralName, targetCurrency = "USD") {
    const diccionarioMinerales = {
      oro: "GC=F",
      plata: "SI=F",
      platino: "PL=F",
      paladio: "PA=F",
      cobre: "HG=F",
    };

    // Factor de conversión: 1 Onza Troy = 31.1035 gramos aprox.
    const GRAMOS_POR_ONZA = 31.1034768;

    const ticker = diccionarioMinerales[mineralName.toLowerCase()];
    if (!ticker) return null;

    // 1. Consultamos el precio base (Yahoo lo da por ONZA en USD)
    const cotizacion = await yahooFinance.quote(ticker);

    // --- CAMBIO AQUÍ: Convertimos el precio de Onza a Gramo inmediatamente ---
    let precioPorOnza = cotizacion.regularMarketPrice;
    let precioFinal = precioPorOnza / GRAMOS_POR_ONZA;
    // ------------------------------------------------------------------------

    let monedaFinal = cotizacion.currency || "USD";
    let target = targetCurrency.toUpperCase();

    // 2. Si nos piden otra moneda (ej. EUR), hacemos la conversión
    if (target !== "USD" && target !== monedaFinal) {
      const conversionTicker = `${target}=X`;

      try {
        const conversion = await yahooFinance.quote(conversionTicker);
        if (conversion && conversion.regularMarketPrice) {
          precioFinal = precioFinal * conversion.regularMarketPrice;
          monedaFinal = target;
        }
      } catch (error) {
        console.log(`⚠️ No se pudo obtener el cambio para ${target}. Se devuelve en USD.`);
      }
    }

    return {
      mineral: mineralName.toLowerCase(),
      simbolo: ticker,
      // Usamos 4 decimales porque en gramos el precio es más pequeño y requiere precisión
      precio: Number(precioFinal.toFixed(4)),
      moneda: monedaFinal,
      unidad: "gramo", // Añadimos esto para que quede claro en el JSON
      fecha_actualizacion: new Date(cotizacion.regularMarketTime),
    };
  }
  // services/mineralService.js (dentro de tu clase MineralService)

  // services/mineralService.js (dentro de tu clase MineralService)

  async getHistorico(mineralName, periodo = "12m") {
    const diccionarioMinerales = {
      oro: "GC=F",
      plata: "SI=F",
      platino: "PL=F",
      paladio: "PA=F",
      cobre: "HG=F",
    };

    const GRAMOS_POR_ONZA = 31.1034768;
    const mineralLower = mineralName.toLowerCase();
    const ticker = diccionarioMinerales[mineralLower];

    if (!ticker) return null;

    // 1. Calculamos las fechas de inicio y fin
    const endDate = new Date();
    let startDate = new Date();
    let intervalo = "1d"; // '1d' = diario, '1wk' = semanal, '1mo' = mensual

    if (periodo === "30d") {
      startDate.setDate(endDate.getDate() - 30);
      intervalo = "1d"; // Queremos un punto por cada día
    } else if (periodo === "12m") {
      startDate.setFullYear(endDate.getFullYear() - 1);
      intervalo = "1mo"; // Queremos un punto por cada mes
    } else if (periodo === "5y") {
      startDate.setFullYear(endDate.getFullYear() - 5);
      intervalo = "1mo"; // También por meses, para no saturar la gráfica (60 puntos)
    } else {
      return null; // Período no válido
    }

    try {
      // 2. Pedimos el historial REAL a Yahoo Finance
      const historicalData = await yahooFinance.historical(ticker, {
        period1: startDate.toISOString().split("T")[0],
        period2: endDate.toISOString().split("T")[0],
        interval: intervalo,
      });

      // 3. Obtenemos el precio exacto de este instante (con tu método)
      const cotizacionActual = await this.getCotizacion(mineralName);
      const precioHoy = cotizacionActual ? cotizacionActual.precio : null;

      // 4. Formateamos los datos recibidos
      const historicoFormateado = historicalData.map((item) => {
        // Yahoo devuelve el precio de cierre en 'close' (por onza) -> Lo pasamos a gramos
        let precioEnGramos = item.close / GRAMOS_POR_ONZA;

        // Damos formato a la fecha dependiendo del período
        let fechaString = item.date.toISOString().split("T")[0]; // YYYY-MM-DD
        if (periodo === "12m" || periodo === "5y") {
          fechaString = fechaString.substring(0, 7); // Dejamos solo YYYY-MM para meses/años
        }

        return {
          fecha: fechaString,
          precio: Number(precioEnGramos.toFixed(4)),
        };
      });

      return {
        mineral: mineralLower,
        periodoSeleccionado: periodo,
        precioActual: precioHoy, // El precio exacto en tiempo real
        unidad: "gramo",
        historico: historicoFormateado,
      };
    } catch (error) {
      console.error(`🚨 Error obteniendo el histórico real de ${mineralName}:`, error);
      return null;
    }
  }

  async getNoticias(busqueda = "gold market") {
    try {
      // Le añadimos quotesCount: 0 para que ignore las cotizaciones conflictivas
      const resultados = await yahooFinance.search(busqueda, {
        newsCount: 6,
        quotesCount: 0,
      });

      // Si Yahoo no devuelve el array de noticias, devolvemos un array vacío
      if (!resultados || !resultados.news) {
        return [];
      }

      // Mapeamos con cuidado usando el operador '?.' para evitar que explote si falta algo
      const noticiasFormateadas = resultados.news.map((noticia) => {
        return {
          id: noticia.uuid || Math.random().toString(), // Por si falta el ID
          titulo: noticia.title || "Noticia sin título",
          enlace: noticia.link || "#",
          fuente: noticia.publisher || "Fuente desconocida",
          // Verificamos que traiga fecha antes de convertirla
          // Déjalo así en tu mapeo de noticias:
          fecha: noticia.providerPublishTime ? new Date(noticia.providerPublishTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          // Forma segura de buscar la imagen
          imagen: noticia.thumbnail?.resolutions?.[0]?.url || null,
        };
      });

      return noticiasFormateadas;
    } catch (error) {
      console.error("🚨 Error obteniendo noticias de Yahoo:", error.message);
      return null;
    }
  }
}

module.exports = new MineralService();
