/**
 * @fileoverview Servicio de usuarios: registro, autenticación JWT, consulta, actualización,
 * baja lógica y reactivación de cuentas. Accede directamente al modelo Sequelize `users`.
 * @module services/userService
 */

// services/userService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");
const models = initModels(sequelize);
const User = models.users;
const PasswordResetToken = models.passwordResetTokens;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/**
 * Capa de negocio para todas las operaciones sobre usuarios de MineX.
 */
class UserService {
  /**
   * Crea un nuevo usuario hasheando su contraseña con bcrypt (salt 10).
   * Lanza error si el email ya existe en la base de datos.
   * @param {{ username: string, email: string, password: string }} datos - Datos del nuevo usuario.
   * @returns {Promise<{ id_user: number, username: string, email: string }>} Datos públicos del usuario creado.
   * @throws {Error} Si el email ya está registrado.
   */
  async crearUsuario(datos) {
    const { username, email, password } = datos;

    if (!password || password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    // 1. Comprobamos si el correo ya existe en la base de datos
    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new Error("El email ya está registrado en MineX");
    }

    // 2. Encriptamos la contraseña para que sea segura
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 3. Creamos el usuario
    // Nota: 'is_active' y 'created_at' se generan automáticamente por MySQL
    const nuevoUsuario = await User.create({
      username: username,
      email: email,
      password_hash: passwordEncriptada, // Tu columna de la BD
    });

    // 4. Devolvemos los datos limpios y seguros al cliente
    return {
      id_user: nuevoUsuario.id_user,
      username: nuevoUsuario.username,
      email: nuevoUsuario.email,
    };
  }
  /**
   * Valida las credenciales y genera un JWT con expiración de 24 h.
   * Bloquea el acceso si la cuenta está inactiva.
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<{ usuario: object, token: string }>} Datos del usuario y JWT firmado.
   * @throws {Error} Si las credenciales son inválidas o la cuenta está desactivada.
   */
  async loginUsuario(email, password) {
    // 1. Buscamos el email
    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // 2. Comprobamos la contraseña
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecta) {
      throw new Error("Credenciales inválidas");
    }

    // 🛑 3. ¡EL FRENO DE SEGURIDAD PARA INACTIVOS! 🛑
    if (usuario.is_active === false || usuario.is_active === 0) {
      throw new Error("Tu cuenta está desactivada. Usa la ruta de reactivación para volver a entrar.");
    }

    // 4. Fabricamos el Token (solo si pasó el freno de arriba)
    const token = jwt.sign(
      {
        id_user: usuario.id_user,
        email: usuario.email,
      },
      process.env.JWT_SECRET, // Usamos la firma de tu .env
      { expiresIn: "24h" }, // El token caducará en 24 horas
    );

    // 5. Devolvemos los datos del usuario Y el token
    return {
      usuario: {
        id_user: usuario.id_user,
        username: usuario.username,
        email: usuario.email,
      },
      token: token, 
    };
  }
  /**
   * Devuelve todos los usuarios registrados omitiendo el campo `password_hash`.
   * @returns {Promise<Array<object>>} Array de usuarios con id, username, email, is_active y created_at.
   */
  async obtenerTodosLosUsuarios() {
    // Usamos 'attributes' para decirle a Sequelize exactamente qué columnas queremos.
    // Así evitamos enviar los hashes de las contraseñas por error.
    const usuarios = await User.findAll({
      attributes: ["id_user", "username", "email", "is_active", "created_at"],
    });

    return usuarios;
  }
  /**
   * Actualiza el username y/o email de un usuario.
   * Los campos no proporcionados se conservan con su valor actual.
   * @param {number} id_user - ID del usuario a actualizar.
   * @param {Object} datosActualizar - Nuevos valores.
   * @returns {Promise<{ id_user: number, username: string, email: string }>} Datos actualizados.
   * @throws {Error} Si el usuario no existe.
   */
  async actualizarUsuario(id_user, datosActualizar) {
    // 1. Buscamos el usuario por su Primary Key (ID)
    const usuario = await User.findByPk(id_user);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 2. Actualizamos los datos.
    // Si no nos envían un dato nuevo, mantenemos el que ya tenía (usuario.username)
    await usuario.update({
      username: datosActualizar.username || usuario.username,
      email: datosActualizar.email || usuario.email,
    });

    // 3. Devolvemos los datos limpios actualizados
    return {
      id_user: usuario.id_user,
      username: usuario.username,
      email: usuario.email,
    };
  }

  /**
   * Realiza la baja lógica de un usuario estableciendo `is_active = false`.
   * No elimina el registro de la base de datos.
   * @param {number} id_user - ID del usuario a desactivar.
   * @returns {Promise<true>}
   * @throws {Error} Si el usuario no existe.
   */
  async inactivarUsuario(id_user) {
    // 1. Buscamos al usuario por su ID
    const usuario = await User.findByPk(id_user);

    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    // 2. Apagamos el booleano. Sequelize traducirá este 'false' a un '0' en tu MySQL.
    usuario.is_active = false;

    // 3. Guardamos los cambios
    await usuario.save();

    return true;
  }

  /**
   * Reactiva una cuenta inactiva tras verificar las credenciales del usuario.
   * Lanza error si la cuenta ya estaba activa para evitar trabajo redundante.
   * @param {string} email - Email de la cuenta a reactivar.
   * @param {string} password - Contraseña en texto plano para verificación.
   * @returns {Promise<true>}
   * @throws {Error} Si las credenciales son incorrectas o la cuenta ya está activa.
   */
  async reactivarUsuario(email, password) {
    // 1. Buscamos al usuario por su email
    const usuario = await User.findOne({ where: { email: email } });
    
    if (!usuario) {
      throw new Error("Credenciales incorrectas."); // Mensaje genérico por seguridad
    }

    // 2. Comprobamos si la contraseña coincide con el hash de la base de datos
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      throw new Error("Credenciales incorrectas.");
    }

    // 3. Verificamos si ya estaba activo para no hacer trabajo de más
    if (usuario.is_active === true || usuario.is_active === 1) {
      throw new Error("Esta cuenta ya está activa. Por favor, inicia sesión normalmente.");
    }

    // 4. ¡Magia! Reactivamos la cuenta
    usuario.is_active = true;
    await usuario.save();

    return true;
  }
  /**
   * Consulta únicamente el campo `balance` de un usuario.
   * @param {number} id_user - ID del usuario.
   * @returns {Promise<number>} Saldo disponible en USD.
   * @throws {Error} Si el usuario no existe.
   */
  async obtenerSaldo(id_user) {
    const usuario = await User.findByPk(id_user, { attributes: ["balance"] });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }
    return usuario.balance;
  }

  async solicitarRecuperacion(email) {
    const usuario = await User.findOne({ where: { email } });
    if (!usuario) return; // No revelamos si el email existe

    await PasswordResetToken.destroy({ where: { id_user: usuario.id_user } });

    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await PasswordResetToken.create({ id_user: usuario.id_user, token, expires_at });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const enlace = `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"MineX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña - MineX",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e07b39;">Recuperar contraseña de MineX</h2>
          <p>Hola <b>${usuario.username}</b>,</p>
          <p>Haz clic en el siguiente botón para restablecer tu contraseña. El enlace expira en <b>1 hora</b>.</p>
          <a href="${enlace}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#e07b39;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Restablecer contraseña
          </a>
          <p style="color:#999;font-size:12px;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });
  }

  async resetearPassword(token, nuevaPassword) {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    const resetToken = await PasswordResetToken.findOne({
      where: { token, used: false, expires_at: { [Op.gt]: new Date() } },
    });
    if (!resetToken) throw new Error("El enlace no es válido, ya fue utilizado, o ha expirado.");

    const usuario = await User.findByPk(resetToken.id_user);
    if (!usuario) throw new Error("Usuario no encontrado.");

    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    resetToken.used = true;
    await resetToken.save();
  }
}

module.exports = new UserService();
