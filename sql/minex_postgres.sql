-- MineX - PostgreSQL migration (converted from MySQL dump)

-- TIPOS ENUM
CREATE TYPE product_type AS ENUM ('coin', 'ingot', 'bar', 'round');
CREATE TYPE condition_type AS ENUM ('above', 'below');

-- TABLAS

CREATE TABLE minerals (
  id_mineral SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  symbol VARCHAR(10),
  description TEXT,
  is_precious BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users (
  id_user SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  balance DECIMAL(12,4) NOT NULL DEFAULT 10000.0000
);

CREATE TABLE products (
  id_product SERIAL PRIMARY KEY,
  id_mineral INTEGER NOT NULL REFERENCES minerals(id_mineral) ON UPDATE CASCADE,
  name VARCHAR(100) NOT NULL,
  type product_type NOT NULL,
  weight_oz DECIMAL(10,4) NOT NULL,
  purity DECIMAL(5,4) NOT NULL,
  year INTEGER,
  country VARCHAR(50),
  is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
  premium_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  image_url VARCHAR(255)
);

CREATE TABLE price_alerts (
  id_alert SERIAL PRIMARY KEY,
  id_user INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  id_mineral INTEGER NOT NULL REFERENCES minerals(id_mineral) ON DELETE CASCADE,
  threshold_price DECIMAL(12,4) NOT NULL,
  condition_type condition_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_notifications (
  id_notification SERIAL PRIMARY KEY,
  id_alert INTEGER NOT NULL REFERENCES price_alerts(id_alert) ON DELETE CASCADE,
  triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price_at_trigger DECIMAL(12,4) NOT NULL
);

CREATE TABLE treasuries (
  id_treasury SERIAL PRIMARY KEY,
  id_user INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_items (
  id_item SERIAL PRIMARY KEY,
  id_treasury INTEGER NOT NULL REFERENCES treasuries(id_treasury) ON DELETE CASCADE,
  id_mineral INTEGER NOT NULL REFERENCES minerals(id_mineral) ON DELETE CASCADE,
  quantity DECIMAL(12,4) NOT NULL,
  purchase_price DECIMAL(12,4) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  id_user    INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  token      VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES
CREATE INDEX idx_products_mineral ON products(id_mineral);
CREATE INDEX idx_price_alerts_user ON price_alerts(id_user);
CREATE INDEX idx_price_alerts_mineral ON price_alerts(id_mineral);
CREATE INDEX idx_alert_notifications_alert ON alert_notifications(id_alert);
CREATE INDEX idx_treasuries_user ON treasuries(id_user);
CREATE INDEX idx_treasury_items_treasury ON treasury_items(id_treasury);
CREATE INDEX idx_treasury_items_mineral ON treasury_items(id_mineral);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(id_user);

-- DATOS

INSERT INTO minerals (name, symbol, description, is_precious) VALUES
('oro',     'Au', 'Metal precioso muy valorado en joyería, inversión y tecnología.', TRUE),
('plata',   'Ag', 'Metal precioso con la mayor conductividad eléctrica y térmica.', TRUE),
('platino', 'Pt', 'Metal precioso muy denso y maleable, usado en joyería y convertidores catalíticos.', TRUE),
('paladio', 'Pd', 'Metal raro y brillante, crucial para la industria automotriz y electrónica.', TRUE),
('cobre',   'Cu', 'Metal industrial esencial, excelente conductor de electricidad.', FALSE);

-- Usuarios de demo (contraseña: demo1234)
INSERT INTO users (username, email, password_hash, is_active, balance) VALUES
('demo_user',  'demo@minex.com',  '$2b$10$nkzqflGEfQDggErhGquXee6qsvk51Hgk/hZzcXeGZGdUV5.wD/RVS', TRUE, 10000.0000),
('demo_admin', 'admin@minex.com', '$2b$10$nkzqflGEfQDggErhGquXee6qsvk51Hgk/hZzcXeGZGdUV5.wD/RVS', TRUE, 10000.0000);

INSERT INTO products (id_mineral, name, type, weight_oz, purity, year, country, is_exclusive, premium_pct, description, image_url) VALUES
(1, 'American Eagle 1 oz',       'coin',  1.0000,   0.9167, 2024, 'Estados Unidos', TRUE,  5.50, 'La moneda de oro más popular del mundo, emitida por la Casa de la Moneda de EE.UU. desde 1986.', '/coins/american-eagle-1oz.png'),
(1, 'Krugerrand 1 oz',           'coin',  1.0000,   0.9167, 2024, 'Sudáfrica',      FALSE, 4.00, 'Primera moneda de inversión moderna del mundo, acuñada en Sudáfrica desde 1967.', '/coins/krugerrand-1oz.png'),
(1, 'Maple Leaf 1 oz',           'coin',  1.0000,   0.9999, 2024, 'Canadá',         FALSE, 4.50, 'Moneda de oro de máxima pureza emitida por la Real Casa de la Moneda de Canadá.', '/coins/maple-leaf-1oz.png'),
(1, 'Philharmonic 1 oz',         'coin',  1.0000,   0.9999, 2024, 'Austria',        FALSE, 4.00, 'La moneda de oro más vendida de Europa, emitida por la Casa de la Moneda de Austria.', '/coins/philharmonic-1oz.png'),
(1, 'Nugget Canguro 1 oz',       'coin',  1.0000,   0.9999, 2024, 'Australia',      TRUE,  6.00, 'Moneda coleccionable australiana con diseño de canguro que cambia cada año.', '/coins/nugget-canguro-1oz.png'),
(1, 'Britannia 1 oz',            'coin',  1.0000,   0.9999, 2024, 'Reino Unido',    TRUE,  5.00, 'Moneda oficial de oro del Reino Unido, emitida por la Real Casa de la Moneda Británica.', '/coins/britannia-1oz.png'),
(2, 'American Eagle 1 oz (Plata)', 'coin', 1.0000,  0.9993, 2024, 'Estados Unidos', FALSE, 20.00, 'La moneda de plata más reconocida del mundo, de curso legal en EE.UU.', '/coins/american-eagle-1oz-plata.png'),
(2, 'Maple Leaf 1 oz (Plata)',   'coin',  1.0000,   0.9999, 2024, 'Canadá',         FALSE, 18.00, 'Moneda de plata de máxima pureza con la hoja de arce canadiense.', '/coins/maple-leaf-1oz-plata.png'),
(2, 'Libertad 1 oz',             'coin',  1.0000,   0.9990, 2024, 'México',         TRUE,  22.00, 'Moneda de plata mexicana con el Ángel de la Independencia, muy valorada por coleccionistas.', '/coins/libertad-1oz.png'),
(2, 'Toro de Cheshire 1 oz',     'coin',  1.0000,   0.9999, 2024, 'Reino Unido',    TRUE,  25.00, 'Moneda de edición limitada de la serie "Animales Míticos de Gran Bretaña".', '/coins/toro-de-cheshire-1oz.png'),
(1, 'Lingote de Oro 1 oz',       'ingot', 1.0000,   0.9999, NULL, 'Suiza',          FALSE,  2.50, 'Lingote estándar de oro de inversión certificado LBMA, fabricado por PAMP Suisse.', '/coins/lingote-de-oro-1oz.png'),
(1, 'Lingote de Oro 10 oz',      'ingot', 10.0000,  0.9999, NULL, 'Suiza',          FALSE,  1.80, 'Lingote de oro de gran formato, ideal para inversión a largo plazo.', '/coins/lingote-de-oro-10oz.png'),
(1, 'Lingote de Oro 100 g',      'bar',   3.2151,   0.9999, NULL, 'Alemania',       FALSE,  2.00, 'Barra de oro estándar de 100 gramos, una de las más populares en Europa.', '/coins/lingote-de-oro-100g.png'),
(2, 'Lingote de Plata 10 oz',    'ingot', 10.0000,  0.9990, NULL, 'Estados Unidos', FALSE, 12.00, 'Lingote de plata de 10 onzas, formato ideal para comenzar a invertir en plata.', '/coins/lingote-de-plata-10oz.png'),
(2, 'Lingote de Plata 100 oz',   'bar',   100.0000, 0.9990, NULL, 'Estados Unidos', FALSE,  8.00, 'Barra de plata de 100 onzas, el formato más eficiente en coste para inversores.', '/coins/lingote-de-plata-100oz.png');
