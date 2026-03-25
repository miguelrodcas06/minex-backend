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