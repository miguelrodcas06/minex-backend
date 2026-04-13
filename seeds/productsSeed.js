// seeds/productsSeed.js
// Ejecutar con: node seeds/productsSeed.js
const initModels = require('../models/init-models.js').initModels;
const sequelize = require('../config/sequelize.js');
require('dotenv').config();

const models = initModels(sequelize);
const Product = models.products;
const Mineral = models.minerals;

const productos = [
  // ── MONEDAS DE ORO ──────────────────────────────────────────
  {
    mineralName: 'oro',
    name: 'American Eagle 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9167,
    year: 2024,
    country: 'Estados Unidos',
    is_exclusive: true,
    premium_pct: 5.5,
    description: 'La moneda de oro más popular del mundo, emitida por la Casa de la Moneda de EE.UU. desde 1986.',
    image_url: '/coins/american-eagle-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Krugerrand 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9167,
    year: 2024,
    country: 'Sudáfrica',
    is_exclusive: false,
    premium_pct: 4.0,
    description: 'Primera moneda de inversión moderna del mundo, acuñada en Sudáfrica desde 1967.',
    image_url: '/coins/krugerrand-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Maple Leaf 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Canadá',
    is_exclusive: false,
    premium_pct: 4.5,
    description: 'Moneda de oro de máxima pureza emitida por la Real Casa de la Moneda de Canadá.',
    image_url: '/coins/maple-leaf-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Philharmonic 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Austria',
    is_exclusive: false,
    premium_pct: 4.0,
    description: 'La moneda de oro más vendida de Europa, emitida por la Casa de la Moneda de Austria.',
    image_url: '/coins/philharmonic-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Nugget Canguro 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Australia',
    is_exclusive: true,
    premium_pct: 6.0,
    description: 'Moneda coleccionable australiana con diseño de canguro que cambia cada año.',
    image_url: '/coins/nugget-canguro-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Britannia 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Reino Unido',
    is_exclusive: true,
    premium_pct: 5.0,
    description: 'Moneda oficial de oro del Reino Unido, emitida por la Real Casa de la Moneda Británica.',
    image_url: '/coins/britannia-1oz.png'
  },

  // ── MONEDAS DE PLATA ────────────────────────────────────────
  {
    mineralName: 'plata',
    name: 'American Eagle 1 oz (Plata)',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9993,
    year: 2024,
    country: 'Estados Unidos',
    is_exclusive: false,
    premium_pct: 20.0,
    description: 'La moneda de plata más reconocida del mundo, de curso legal en EE.UU.',
    image_url: '/coins/american-eagle-1oz-plata.png'
  },
  {
    mineralName: 'plata',
    name: 'Maple Leaf 1 oz (Plata)',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Canadá',
    is_exclusive: false,
    premium_pct: 18.0,
    description: 'Moneda de plata de máxima pureza con la hoja de arce canadiense.',
    image_url: '/coins/maple-leaf-1oz-plata.png'
  },
  {
    mineralName: 'plata',
    name: 'Libertad 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.999,
    year: 2024,
    country: 'México',
    is_exclusive: true,
    premium_pct: 22.0,
    description: 'Moneda de plata mexicana con el Ángel de la Independencia, muy valorada por coleccionistas.',
    image_url: '/coins/libertad-1oz.png'
  },
  {
    mineralName: 'plata',
    name: 'Toro de Cheshire 1 oz',
    type: 'coin',
    weight_oz: 1.0,
    purity: 0.9999,
    year: 2024,
    country: 'Reino Unido',
    is_exclusive: true,
    premium_pct: 25.0,
    description: 'Moneda de edición limitada de la serie "Animales Míticos de Gran Bretaña".',
    image_url: '/coins/toro-de-cheshire-1oz.png'
  },

  // ── LINGOTES DE ORO ─────────────────────────────────────────
  {
    mineralName: 'oro',
    name: 'Lingote de Oro 1 oz',
    type: 'ingot',
    weight_oz: 1.0,
    purity: 0.9999,
    year: null,
    country: 'Suiza',
    is_exclusive: false,
    premium_pct: 2.5,
    description: 'Lingote estándar de oro de inversión certificado LBMA, fabricado por PAMP Suisse.',
    image_url: '/coins/lingote-de-oro-1oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Lingote de Oro 10 oz',
    type: 'ingot',
    weight_oz: 10.0,
    purity: 0.9999,
    year: null,
    country: 'Suiza',
    is_exclusive: false,
    premium_pct: 1.8,
    description: 'Lingote de oro de gran formato, ideal para inversión a largo plazo.',
    image_url: '/coins/lingote-de-oro-10oz.png'
  },
  {
    mineralName: 'oro',
    name: 'Lingote de Oro 100 g',
    type: 'bar',
    weight_oz: 3.2151,
    purity: 0.9999,
    year: null,
    country: 'Alemania',
    is_exclusive: false,
    premium_pct: 2.0,
    description: 'Barra de oro estándar de 100 gramos, una de las más populares en Europa.',
    image_url: '/coins/lingote-de-oro-100g.png'
  },

  // ── LINGOTES DE PLATA ───────────────────────────────────────
  {
    mineralName: 'plata',
    name: 'Lingote de Plata 10 oz',
    type: 'ingot',
    weight_oz: 10.0,
    purity: 0.999,
    year: null,
    country: 'Estados Unidos',
    is_exclusive: false,
    premium_pct: 12.0,
    description: 'Lingote de plata de 10 onzas, formato ideal para comenzar a invertir en plata.',
    image_url: '/coins/lingote-de-plata-10oz.png'
  },
  {
    mineralName: 'plata',
    name: 'Lingote de Plata 100 oz',
    type: 'bar',
    weight_oz: 100.0,
    purity: 0.999,
    year: null,
    country: 'Estados Unidos',
    is_exclusive: false,
    premium_pct: 8.0,
    description: 'Barra de plata de 100 onzas, el formato más eficiente en coste para inversores.',
    image_url: '/coins/lingote-de-plata-100oz.png'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD establecida.');

    // Sincronizamos la tabla products (CREATE TABLE IF NOT EXISTS)
    await Product.sync({ alter: true });
    console.log('Tabla products sincronizada.');

    for (const p of productos) {
      const mineral = await Mineral.findOne({ where: { name: p.mineralName } });
      if (!mineral) {
        console.warn(`Mineral '${p.mineralName}' no encontrado en la BD. Saltando: ${p.name}`);
        continue;
      }

      const [producto, creado] = await Product.findOrCreate({
        where: { name: p.name },
        defaults: {
          id_mineral: mineral.id_mineral,
          type: p.type,
          weight_oz: p.weight_oz,
          purity: p.purity,
          year: p.year,
          country: p.country,
          is_exclusive: p.is_exclusive,
          premium_pct: p.premium_pct,
          description: p.description,
          image_url: p.image_url
        }
      });

      console.log(`${creado ? 'CREADO' : 'YA EXISTE'}: ${producto.name}`);
    }

    console.log('\nSeed completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

seed();
