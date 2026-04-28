/**
 * @fileoverview Controlador de usuarios: registro, login, perfil y gestión de cuenta.
 * Cada método delega la lógica de negocio en {@link module:services/userService}.
 * @module controllers/userController
 */

// controllers/userController.js
const userService = require("../services/userService");

/**
 * Controlador HTTP para todas las operaciones relacionadas con usuarios.
 */
class UserController {
  /**
   * Registra un nuevo usuario en MineX.
   * @route POST /api/usuarios
   * @param {Express.Request}  req - Body: `{ username, email, password }`.
   * @param {Express.Response} res - 201 con datos del usuario creado, o 400/500 en error.
   * @returns {Promise<void>}
   */
  async registrarUsuario(req, res) {
    try {
      // req.body contiene el JSON que enviaremos desde el archivo .rest
      const nuevoUsuario = await userService.crearUsuario(req.body);

      res.status(201).json({
        ok: true,
        mensaje: "Usuario registrado correctamente en MineX",
        datos: nuevoUsuario,
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error.message);
      // Si el error es el del email repetido, mandamos un error 400
      if (error.message.includes("registrado")) {
        return res.status(400).json({ ok: false, mensaje: error.message });
      }
      res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
    }
  }

  /**
   * Autentica a un usuario y devuelve un JWT de 24 h.
   * @route POST /api/usuarios/login
   * @param {Express.Request}  req - Body: `{ email, password }`.
   * @param {Express.Response} res - 200 con token y datos del usuario, o 401 en error.
   * @returns {Promise<void>}
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validación básica
      if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: "Email y contraseña son obligatorios" });
      }

      // Llamamos al servicio
      const usuarioLogueado = await userService.loginUsuario(email, password);

      // Si todo va bien, devolvemos un 200 OK
      res.status(200).json({
        ok: true,
        mensaje: "Login exitoso",
        datos: usuarioLogueado,
      });
    } catch (error) {
      console.error("Error en login:", error.message);
      // Devolvemos un 401 Unauthorized si fallan las credenciales
      res.status(401).json({ ok: false, mensaje: error.message });
    }
  }
  /**
   * Devuelve los datos del usuario autenticado extraídos del JWT.
   * @route GET /api/usuarios/perfil
   * @param {Express.Request}  req - Requiere `req.usuario` (inyectado por authMiddleware).
   * @param {Express.Response} res - 200 con payload del token.
   * @returns {void}
   */
  async obtenerPerfil(req, res) {
    // Gracias a nuestro middleware, aquí ya sabemos quién es el usuario (req.usuario)
    res.status(200).json({
      ok: true,
      mensaje: "¡Has logrado entrar a la zona VIP de MineX!",
      datosDelToken: req.usuario,
    });
  }
  /**
   * Devuelve la lista completa de usuarios registrados (sin contraseñas).
   * @route GET /api/usuarios
   * @param {Express.Request}  req - Requiere token válido.
   * @param {Express.Response} res - 200 con array de usuarios, o 500 en error.
   * @returns {Promise<void>}
   */
  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await userService.obtenerTodosLosUsuarios();

      res.status(200).json({
        ok: true,
        cantidad: usuarios.length, // Un detallito útil para saber cuántos hay
        datos: usuarios,
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      res.status(500).json({ ok: false, mensaje: "Error interno del servidor al obtener usuarios" });
    }
  }
  /**
   * Actualiza el username o email del usuario autenticado.
   * El ID se extrae del token para evitar que se pueda suplantar otro usuario.
   * @route PUT /api/usuarios/perfil
   * @param {Express.Request}  req - Body: `{ username?, email? }`. Requiere token.
   * @param {Express.Response} res - 200 con datos actualizados, o 400 en error.
   * @returns {Promise<void>}
   */
  async actualizarPerfil(req, res) {
    try {
      // ¡LA MAGIA DE LA SEGURIDAD!
      // Sacamos el ID directamente del token, es imposible de falsificar.
      const idUsuario = req.usuario.id_user;
      const datosNuevos = req.body; // Lo que el usuario escribe en el formulario

      const usuarioActualizado = await userService.actualizarUsuario(idUsuario, datosNuevos);

      res.status(200).json({
        ok: true,
        mensaje: "Perfil actualizado correctamente",
        datos: usuarioActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error.message);
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  /**
   * Desactiva (baja lógica) la cuenta del usuario autenticado.
   * @route PUT /api/usuarios/baja
   * @param {Express.Request}  req - Requiere token válido.
   * @param {Express.Response} res - 200 confirmando la desactivación, o 500 en error.
   * @returns {Promise<void>}
   */
  async darDeBaja(req, res) {
    try {
      // Sacamos el ID del usuario directamente del Token (¡seguridad máxima!)
      const idUsuario = req.usuario.id_user;

      await userService.inactivarUsuario(idUsuario);

      res.status(200).json({
        ok: true,
        mensaje: "Tu cuenta ha sido desactivada correctamente. ¡Esperamos verte pronto!",
      });
    } catch (error) {
      console.error("Error al desactivar la cuenta:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno al intentar dar de baja la cuenta.",
      });
    }
  }

  /**
   * Reactiva una cuenta previamente desactivada verificando credenciales.
   * Ruta pública: no requiere token activo (el usuario no puede loguearse si está inactivo).
   * @route PUT /api/usuarios/reactivar
   * @param {Express.Request}  req - Body: `{ email, password }`.
   * @param {Express.Response} res - 200 confirmando la reactivación, o 401 en error.
   * @returns {Promise<void>}
   */
  async reactivarCuenta(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: "Falta el email o la contraseña." });
      }

      await userService.reactivarUsuario(email, password);

      res.status(200).json({
        ok: true,
        mensaje: "¡Bienvenido de nuevo! Tu cuenta ha sido reactivada con éxito. Ya puedes iniciar sesión.",
      });
    } catch (error) {
      console.error("Error al reactivar cuenta:", error.message);
      // Devolvemos status 400 (Bad Request) o 401 (Unauthorized) según el error
      res.status(401).json({ ok: false, mensaje: error.message });
    }
  }
  /**
   * Devuelve el saldo disponible (balance) del usuario autenticado.
   * @route GET /api/usuarios/saldo
   * @param {Express.Request}  req - Requiere token válido.
   * @param {Express.Response} res - 200 con `{ ok, balance }`, o 500 en error.
   * @returns {Promise<void>}
   */
  async obtenerSaldo(req, res) {
    try {
      const id_user = req.usuario.id_user;
      // 1. Le pedimos el saldo al servicio, que es el experto en la base de datos
      const balance = await userService.obtenerSaldo(id_user);

      res.status(200).json({ ok: true, balance: balance });
    } catch (error) {
      console.error("🚨 ERROR REAL AL OBTENER SALDO:", error);
      res.status(500).json({ ok: false, mensaje: "Error al consultar el saldo." });
    }
  }

  async solicitarRecuperacion(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ ok: false, mensaje: "Introduce tu email." });
      await userService.solicitarRecuperacion(email);
      res.json({ ok: true, mensaje: "Si el email existe, recibirás un enlace para restablecer tu contraseña." });
    } catch (error) {
      console.error("Error en recuperación:", error.message);
      res.status(500).json({ ok: false, mensaje: "No se pudo enviar el email. Inténtalo más tarde." });
    }
  }

  async resetearPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ ok: false, mensaje: "Faltan datos." });
      await userService.resetearPassword(token, password);
      res.json({ ok: true, mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
    } catch (error) {
      console.error("Error al resetear password:", error.message);
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
}

module.exports = new UserController();
