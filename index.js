// ============================================
// IMPORTACIONES
// ============================================
require("dotenv").config(); 
const express = require("express");
const path = require("path");
const cors = require("cors");

const { logMensaje } = require("./utils/logger.js");

// Importamos las rutas de nuestra API
const mineralRoutes = require("./routes/mineralRoutes");
const userRoutes = require("./routes/userRoutes"); 
const treasuryRoutes = require("./routes/treasuryRoutes");
const alertRoutes = require('./routes/alertRoutes');
const productRoutes = require('./routes/productRoutes');

// Importamos el servicio del Vigilante
const vigilanteService = require('./services/vigilanteService'); // <--- AÑADIR ESTA LÍNEA

// ============================================
// INICIALIZACIÓN
// ============================================
const app = express(); 
const port = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE - PARSEO
// ============================================
app.use(express.json());

// ============================================
// MIDDLEWARE - CORS - Cualquier origen
// ============================================
app.use(cors());

// ============================================
// MIDDLEWARE - ARCHIVOS ESTÁTICOS
// ============================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// RUTAS - API REST
// ============================================
// 3. AHORA SÍ conectamos las rutas a la app
app.use("/api/minerales", mineralRoutes);
app.use("/api/usuarios", userRoutes); 
app.use("/api/tesoreria", treasuryRoutes);
app.use("/api/alertas", alertRoutes);
app.use("/api/productos", productRoutes);

// Ruta base para comprobar que el servidor responde
app.get("/", (req, res) => {
  res.send("¡Servidor API de MineX funcionando correctamente!");
});

// ============================================
// SERVICIOS EN SEGUNDO PLANO (CRON JOBS)
// ============================================
vigilanteService.iniciar(); // <--- AÑADIR ESTA LÍNEA

// ============================================
// SERVIDOR
// ============================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Servidor MineX escuchando en el puerto ${port}`);
  });
}

module.exports = app;