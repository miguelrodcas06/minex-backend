/**
 * @fileoverview Middleware de autenticación JWT para rutas protegidas de MineX.
 * Verifica la firma del token, comprueba que el usuario exista en BD y que su
 * cuenta esté activa antes de dejar pasar la petición.
 * @module middlewares/authMiddleware
 */

// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");
// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar el modelo user (tu tabla en la base de datos se llama 'users')
const User = models.users;

/**
 * Middleware Express que protege las rutas con autenticación JWT.
 * Extrae el token del header `Authorization: Bearer <token>`, lo verifica
 * criptográficamente y consulta la base de datos para confirmar que el usuario
 * sigue activo. Si pasa todos los controles, adjunta el payload decodificado
 * en `req.usuario` y llama a `next()`.
 *
 * @function verificarToken
 * @param {Express.Request}  req  - Petición Express. Debe incluir header Authorization.
 * @param {Express.Response} res  - Respuesta Express.
 * @param {Express.NextFunction} next - Siguiente middleware de la cadena.
 * @returns {Promise<void>}
 */
const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ ok: false, mensaje: "Token no proporcionado" });
        }

        const token = authHeader.split(" ")[1];
        
        // 1. Verificamos que el token sea válido matemáticamente
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_secreto");

        // 2. BUSCAMOS AL USUARIO EN LA BD PARA VER SU ESTADO REAL AHORA MISMO
        const usuarioDB = await User.findByPk(decoded.id_user); // Usa el ID que guardes en el token

        if (!usuarioDB) {
            return res.status(404).json({ ok: false, mensaje: "El usuario del token ya no existe." });
        }

        // 3. ¡EL ESCUDO! Si está inactivo, lo bloqueamos aunque su token sea válido
        if (usuarioDB.is_active === false || usuarioDB.is_active === 0) {
            return res.status(403).json({ 
                ok: false, 
                mensaje: "Acceso denegado. Tu cuenta está inactiva." 
            });
        }

        // 4. Todo está bien, lo dejamos pasar
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ ok: false, mensaje: "Token inválido o expirado" });
    }
};

module.exports = verificarToken;