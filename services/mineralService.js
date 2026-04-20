/**
 * @fileoverview Servicio de minerales: cotización en tiempo real, histórico de precios
 * y noticias desde Yahoo Finance. Convierte precios de onzas troy / libras a gramos.
 * @module services/mineralService
 */

// services/mineralService.js
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
  validation: { logErrors: false },
  queue: { concurrency: 1, timeout: 30000 },
});


const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const cache = {};

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

/**
 * Servicio que encapsula todas las consultas de datos de metales preciosos a Yahoo Finance.
 */
class MineralService {
  /**
   * Obtiene el precio spot actual de un mineral en USD/g y opcionalmente lo convierte
   * a otra divisa usando el tipo de cambio de Yahoo Finance.
   * @param {string} mineralName - Nombre del mineral (oro | plata | platino | paladio | cobre).
   * @param {string} [targetCurrency="USD"] - Código ISO 4217 de la divisa destino.
   * @returns {Promise<{mineral: string, simbolo: string, precio: number, moneda: string, unidad: string, fecha_actualizacion: Date} | null>}
   *   Datos de cotización o `null` si el mineral no está soportado.
   */
  async getCotizacion(mineralName, targetCurrency = "USD") {
    const diccionarioMinerales = {
      oro: "GC=F",
      plata: "SI=F",
      platino: "PL=F",
      paladio: "PA=F",
      cobre: "HG=F",
    };

    // Factores de conversión
    const GRAMOS_POR_ONZA_TROY = 31.1034768; // Metales preciosos (GC=F, SI=F, PL=F, PA=F)
    const GRAMOS_POR_LIBRA     = 453.592;    // Cobre (HG=F) → Yahoo lo cotiza en USD/libra

    const ticker = diccionarioMinerales[mineralName.toLowerCase()];
    if (!ticker) return null;

    const cacheKey = `cotizacion_${ticker}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const cotizacion = await yahooFinance.quote(ticker);

    const divisor = ticker === "HG=F" ? GRAMOS_POR_LIBRA : GRAMOS_POR_ONZA_TROY;
    let precioFinal = cotizacion.regularMarketPrice / divisor;

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

    const result = {
      mineral: mineralName.toLowerCase(),
      simbolo: ticker,
      precio: Number(precioFinal.toFixed(4)),
      moneda: monedaFinal,
      unidad: "gramo",
      fecha_actualizacion: new Date(cotizacion.regularMarketTime),
    };
    setCache(cacheKey, result);
    return result;
  }
  /**
   * Devuelve el histórico de precios de un mineral para el período seleccionado.
   * Intervalos: 30 d → diario; 12 m / 5 y → mensual (para no saturar la gráfica).
   * Incluye también el precio actual en tiempo real como `precioActual`.
   * @param {string} mineralName - Nombre del mineral.
   * @param {"30d"|"12m"|"5y"} [periodo="12m"] - Período de tiempo deseado.
   * @returns {Promise<{mineral: string, periodoSeleccionado: string, precioActual: number|null, unidad: string, historico: Array<{fecha: string, precio: number}>} | null>}
   *   Datos históricos o `null` si el mineral/período no es válido.
   */
  async getHistorico(mineralName, periodo = "12m") {
    const diccionarioMinerales = {
      oro: "GC=F",
      plata: "SI=F",
      platino: "PL=F",
      paladio: "PA=F",
      cobre: "HG=F",
    };

    const GRAMOS_POR_ONZA_TROY = 31.1034768;
    const GRAMOS_POR_LIBRA     = 453.592;
    const mineralLower = mineralName.toLowerCase();
    const ticker = diccionarioMinerales[mineralLower];

    if (!ticker) return null;

    const cacheKey = `historico_${ticker}_${periodo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

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
        const divisor = ticker === "HG=F" ? GRAMOS_POR_LIBRA : GRAMOS_POR_ONZA_TROY;
        let precioEnGramos = item.close / divisor;

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

      const result = {
        mineral: mineralLower,
        periodoSeleccionado: periodo,
        precioActual: precioHoy,
        unidad: "gramo",
        historico: historicoFormateado,
      };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`🚨 Error obteniendo el histórico real de ${mineralName}:`, error);
      return null;
    }
  }

  /**
   * Recupera hasta 6 noticias del mercado de metales desde Yahoo Finance Search.
   * @param {string} [busqueda="gold market"] - Término de búsqueda para las noticias.
   * @returns {Promise<Array<{id: string, titulo: string, enlace: string, fuente: string, fecha: string, imagen: string|null}> | null>}
   *   Array de noticias formateadas, array vacío si no hay resultados, o `null` si hay error.
   */
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
