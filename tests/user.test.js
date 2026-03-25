const request = require('supertest');
const app = require('../index'); // Asegúrate de que tu index.js/app.js exporte la app (module.exports = app;)

// 1. Mockeamos el servicio (Para no tocar la base de datos real)
jest.mock('../services/userService', () => ({
  crearUsuario: jest.fn(),
  loginUsuario: jest.fn(),
  obtenerSaldo: jest.fn(),
}));

// 2. Mockeamos el middleware de seguridad
// Dependiendo de cómo lo exportes, Jest necesita que sea una función directa
jest.mock('../middlewares/authMiddleware', () => (req, res, next) => {
  req.usuario = { id_user: 1, email: 'test@minex.com' };
  next();
});

const userService = require('../services/userService');

describe('API de Usuarios - MineX ⛏️', () => {
  
  // Limpiamos los mocks antes de cada test para que no se mezclen
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/usuarios/registrar', () => {
    test('Registra un usuario nuevo correctamente (201)', async () => {
      const payload = { email: 'nuevo@minex.com', password: '123' };
      const respuestaSimulada = { id_user: 2, email: 'nuevo@minex.com' };
      
      userService.crearUsuario.mockResolvedValue(respuestaSimulada);

      const res = await request(app).post('/api/usuarios/registrar').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.mensaje).toMatch(/registrado correctamente/i);
      expect(res.body.datos.email).toBe(payload.email);
    });

    test('Devuelve error si el email ya existe (400)', async () => {
      const payload = { email: 'repetido@minex.com', password: '123' };
      
      userService.crearUsuario.mockRejectedValue(new Error('El email ya está registrado'));

      const res = await request(app).post('/api/usuarios/registrar').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.mensaje).toMatch(/registrado/i);
    });
  });

  describe('POST /api/usuarios/login', () => {
    test('Login exitoso devuelve un token (200)', async () => {
      const payload = { email: 'test@minex.com', password: '123' };
      const respuestaSimulada = { token: 'tokenFalso123', usuario: { id_user: 1 } };
      
      userService.loginUsuario.mockResolvedValue(respuestaSimulada);

      const res = await request(app).post('/api/usuarios/login').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.datos.token).toBeDefined();
    });
  });

  describe('GET /api/usuarios/saldo', () => {
    test('Recupera el saldo del usuario logueado (200)', async () => {
      // Simulamos que el usuario tiene 10500.50$
      userService.obtenerSaldo.mockResolvedValue("10500.5000");

      // No pasamos token en el header porque nuestro mock del middleware ya nos deja pasar
      const res = await request(app).get('/api/usuarios/saldo');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.balance).toBe("10500.5000");
    });

    test('Devuelve error 500 si falla la base de datos', async () => {
      userService.obtenerSaldo.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/usuarios/saldo');

      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.mensaje).toMatch(/Error al consultar el saldo/i);
    });
    // Forzamos el cierre de cualquier proceso que Jest haya dejado abierto
  afterAll(async () => {
    // Si tuvieras que cerrar la BBDD explícitamente se haría aquí.
    // Ej: await db.close();
    
    // Este truco ayuda a que Jest termine limpiamente el proceso de Node
    await new Promise(resolve => setTimeout(() => resolve(), 500)); 
  });
  });

});