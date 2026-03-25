// controllers/userController.js
const userService = require("../services/userService");

class UserController {
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
  async obtenerPerfil(req, res) {
    // Gracias a nuestro middleware, aquí ya sabemos quién es el usuario (req.usuario)
    res.status(200).json({
      ok: true,
      mensaje: "¡Has logrado entrar a la zona VIP de MineX!",
      datosDelToken: req.usuario,
    });
  }
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
}

module.exports = new UserController();
