// services/userService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// solo alguien que tenga un Token válido (que haya hecho login)
// podrá ver la lista de usuarios.

// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");
// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar el modelo user (tu tabla en la base de datos se llama 'users')
const User = models.users;

class UserService {
  async crearUsuario(datos) {
    const { username, email, password } = datos;

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
  async obtenerTodosLosUsuarios() {
    // Usamos 'attributes' para decirle a Sequelize exactamente qué columnas queremos.
    // Así evitamos enviar los hashes de las contraseñas por error.
    const usuarios = await User.findAll({
      attributes: ["id_user", "username", "email", "is_active", "created_at"],
    });

    return usuarios;
  }
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
  async obtenerSaldo(id_user) {
    const usuario = await User.findByPk(id_user, { attributes: ["balance"] });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }
    return usuario.balance;
  }
}

module.exports = new UserService();
