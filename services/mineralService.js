/**
 * @fileoverview Servicio de minerales: cotización en tiempo real, histórico de precios
 * y noticias desde YFinance API (RapidAPI). Convierte precios de onzas troy / libras a gramos.
 * @module services/mineralService
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "yahoo-finance166.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos (retraso de Yahoo Finance en datos gratuitos)
const cache = {};

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

async function rapidApiFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
  });

  if (!res.ok) throw new Error(`RapidAPI error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Servicio que encapsula todas las consultas de datos de metales preciosos via RapidAPI.
 */
class MineralService {
  /**
   * Obtiene el precio spot actual de un mineral en USD/g.
   */
  async getCotizacion(mineralName, targetCurrency = "USD") {
    const diccionarioMinerales = {
      oro: "GC=F",
      plata: "SI=F",
      platino: "PL=F",
      paladio: "PA=F",
      cobre: "HG=F",
    };

    const GRAMOS_POR_ONZA_TROY = 31.1034768;
    const GRAMOS_POR_LIBRA = 453.592;

    const ticker = diccionarioMinerales[mineralName.toLowerCase()];
    if (!ticker) return null;

    const target = targetCurrency.toUpperCase();
    const cacheKey = `cotizacion_${ticker}_${target}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await rapidApiFetch("/stock/get-price", { symbol: ticker, region: "US" });
    const priceData = data?.quoteSummary?.result?.[0]?.price;
    if (!priceData) return null;

    const divisor = ticker === "HG=F" ? GRAMOS_POR_LIBRA : GRAMOS_POR_ONZA_TROY;
    let precioFinal = priceData.regularMarketPrice.raw / divisor;
    let monedaFinal = priceData.currency || "USD";

    if (target !== "USD" && target !== monedaFinal) {
      try {
        const convData = await rapidApiFetch("/stock/get-price", { symbol: `${target}=X`, region: "US" });
        const convPrice = convData?.quoteSummary?.result?.[0]?.price?.regularMarketPrice?.raw;
        if (convPrice) {
          precioFinal = precioFinal * convPrice;
          monedaFinal = target;
        }
      } catch {
        console.log(`⚠️ No se pudo obtener el cambio para ${target}. Se devuelve en USD.`);
      }
    }

    const result = {
      mineral: mineralName.toLowerCase(),
      simbolo: ticker,
      precio: Number(precioFinal.toFixed(4)),
      moneda: monedaFinal,
      unidad: "gramo",
      fecha_actualizacion: new Date(priceData.regularMarketTime * 1000),
    };
    setCache(cacheKey, result);
    return result;
  }

  /**
   * Devuelve el histórico de precios de un mineral para el período seleccionado.
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
    const GRAMOS_POR_LIBRA = 453.592;
    const mineralLower = mineralName.toLowerCase();
    const ticker = diccionarioMinerales[mineralLower];
    if (!ticker) return null;

    const cacheKey = `historico_${ticker}_${periodo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const rangeMap = { "30d": "1mo", "12m": "1y", "5y": "5y" };
    const intervalMap = { "30d": "1d", "12m": "1mo", "5y": "1mo" };
    const range = rangeMap[periodo];
    const interval = intervalMap[periodo];
    if (!range) return null;

    try {
      const data = await rapidApiFetch("/stock/get-chart", {
        symbol: ticker,
        region: "US",
        range,
        interval,
      });

      const chartResult = data?.chart?.result?.[0];
      if (!chartResult) return null;

      const timestamps = chartResult.timestamp || [];
      const closes = chartResult.indicators?.quote?.[0]?.close || [];
      const divisor = ticker === "HG=F" ? GRAMOS_POR_LIBRA : GRAMOS_POR_ONZA_TROY;

      const historicoFormateado = timestamps
        .map((ts, i) => {
          if (closes[i] == null) return null;
          const fecha = new Date(ts * 1000);
          let fechaString = fecha.toISOString().split("T")[0];
          if (periodo === "12m" || periodo === "5y") {
            fechaString = fechaString.substring(0, 7);
          }
          return {
            fecha: fechaString,
            precio: Number((closes[i] / divisor).toFixed(4)),
          };
        })
        .filter(Boolean);

      const cotizacionActual = await this.getCotizacion(mineralName);
      const precioHoy = cotizacionActual ? cotizacionActual.precio : null;

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
   * Recupera noticias del mercado de metales.
   */
  async getNoticias() {
    try {
      const cacheKey = "noticias";
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const data = await rapidApiFetch("/news/list", {
        snippetCount: 6,
        region: "US",
      });

      const noticias = data?.data?.ntk?.stream || [];
      const noticiasFormateadas = noticias.slice(0, 6).map((item) => {
        const ec = item?.editorialContent || {};
        const c = ec?.content || {};
        return {
          id: ec.id || Math.random().toString(),
          titulo: ec.title || "Noticia sin título",
          enlace: c.canonicalUrl?.url || "#",
          fuente: c.provider?.displayName || "Fuente desconocida",
          fecha: c.pubDate ? new Date(c.pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          imagen: ec.thumbnail?.resolutions?.[1]?.url || ec.thumbnail?.resolutions?.[0]?.url || null,
        };
      });

      setCache(cacheKey, noticiasFormateadas);
      return noticiasFormateadas;
    } catch (error) {
      console.error("🚨 Error obteniendo noticias:", error.message);
      return [];
    }
  }
}

module.exports = new MineralService();
