/**
 * @fileoverview Rutas de la API para consulta de minerales preciosos.
 *
 * | Método | Ruta                                | Auth | Descripción                           |
 * |--------|-------------------------------------|------|---------------------------------------|
 * | GET    | /api/minerales/noticias             | No   | Noticias del mercado de metales       |
 * | GET    | /api/minerales/:nombre              | No   | Cotización actual en USD/g (o divisa) |
 * | GET    | /api/minerales/:nombre/historico    | No   | Histórico de precios por período      |
 *
 * @module routes/mineralRoutes
 */

// routes/mineralRoutes.js
const express = require("express");
const router = express.Router();
const mineralController = require("../controllers/mineralController");

router.get("/noticias", mineralController.getNoticias);
// Ruta dinámica (el :nombre actúa como tu :id)
router.get("/:nombre", mineralController.getCotizacion);
// Histórico para las gráficas (Ej: /api/minerales/oro/historico?periodo=12m)
router.get("/:nombre/historico", mineralController.getHistorico);

module.exports = router;