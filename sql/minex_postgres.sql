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

-- ÍNDICES
CREATE INDEX idx_products_mineral ON products(id_mineral);
CREATE INDEX idx_price_alerts_user ON price_alerts(id_user);
CREATE INDEX idx_price_alerts_mineral ON price_alerts(id_mineral);
CREATE INDEX idx_alert_notifications_alert ON alert_notifications(id_alert);
CREATE INDEX idx_treasuries_user ON treasuries(id_user);
CREATE INDEX idx_treasury_items_treasury ON treasury_items(id_treasury);
CREATE INDEX idx_treasury_items_mineral ON treasury_items(id_mineral);

-- DATOS

INSERT INTO minerals (id_mineral, name, symbol, description, is_precious) VALUES
(1, 'oro', 'Au', 'Metal precioso muy valorado en joyería, inversión y tecnología.', TRUE),
(2, 'plata', 'Ag', 'Metal precioso con la mayor conductividad eléctrica y térmica.', TRUE),
(3, 'platino', 'Pt', 'Metal precioso muy denso y maleable, usado en joyería y convertidores catalíticos.', TRUE),
(4, 'paladio', 'Pd', 'Metal raro y brillante, crucial para la industria automotriz y electrónica.', TRUE),
(5, 'cobre', 'Cu', 'Metal industrial esencial, excelente conductor de electricidad.', FALSE);

INSERT INTO users (id_user, username, email, password_hash, created_at, is_active, balance) VALUES
(2, 'prueba_minex', 'prueba@minex.com', '$2b$10$nkzqflGEfQDggErhGquXee6qsvk51Hgk/hZzcXeGZGdUV5.wD/RVS', '2026-03-08 13:29:03', TRUE, 15263.6540),
(3, 'miguel_minex', 'miguel@minex.com', '$2b$10$58CQxW9HUZ61uv65fObZHOaUaeRjX9HoUoK8xpYNG5S9ATXBjJS.u', '2026-03-13 07:51:54', FALSE, 10000.0000),
(4, 'miguel-prueba_minex', 'miguel-prueba@minex.com', '$2b$10$.GRWwHMYxvTnSQoKoNVxV.1J4nmId0zWweREJHcMokdLqt1qnEbC2', '2026-03-13 09:22:05', TRUE, 10000.0000),
(5, 'ADMIN', 'miguelrodriguezcasado06@gmail.com', '$2b$10$z5FzpWllUBeJPSkx6TeVyOwF7375NR99xqTwlS262gr6jcOb1B6fO', '2026-03-24 12:31:09', TRUE, 9679.5775),
(6, 'Sergio', 'smrcuriel@gmail.com', '$2b$10$EPUtz7se/e6sstqDfT06cewgaOeTdjylq5ZohASWeN6Lb.akpCmza', '2026-03-24 13:00:56', TRUE, 10000.0000),
(7, 'p', 'p@gmail.com', '$2b$10$tsKVBMEy75sJL1KjLFRoceQLiBdXCCI74p/.RVX8FHkcTtcrwh03u', '2026-04-06 07:56:56', TRUE, 10000.0000);

INSERT INTO products (id_product, id_mineral, name, type, weight_oz, purity, year, country, is_exclusive, premium_pct, description, image_url) VALUES
(1, 1, 'American Eagle 1 oz', 'coin', 1.0000, 0.9167, 2024, 'Estados Unidos', TRUE, 5.50, 'La moneda de oro más popular del mundo, emitida por la Casa de la Moneda de EE.UU. desde 1986.', '/coins/american-eagle-1oz.png'),
(2, 1, 'Krugerrand 1 oz', 'coin', 1.0000, 0.9167, 2024, 'Sudáfrica', FALSE, 4.00, 'Primera moneda de inversión moderna del mundo, acuñada en Sudáfrica desde 1967.', '/coins/krugerrand-1oz.png'),
(3, 1, 'Maple Leaf 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Canadá', FALSE, 4.50, 'Moneda de oro de máxima pureza emitida por la Real Casa de la Moneda de Canadá.', '/coins/maple-leaf-1oz.png'),
(4, 1, 'Philharmonic 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Austria', FALSE, 4.00, 'La moneda de oro más vendida de Europa, emitida por la Casa de la Moneda de Austria.', '/coins/philharmonic-1oz.png'),
(5, 1, 'Nugget Canguro 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Australia', TRUE, 6.00, 'Moneda coleccionable australiana con diseño de canguro que cambia cada año.', '/coins/nugget-canguro-1oz.png'),
(6, 1, 'Britannia 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Reino Unido', TRUE, 5.00, 'Moneda oficial de oro del Reino Unido, emitida por la Real Casa de la Moneda Británica.', '/coins/britannia-1oz.png'),
(7, 2, 'American Eagle 1 oz (Plata)', 'coin', 1.0000, 0.9993, 2024, 'Estados Unidos', FALSE, 20.00, 'La moneda de plata más reconocida del mundo, de curso legal en EE.UU.', '/coins/american-eagle-1oz-plata.png'),
(8, 2, 'Maple Leaf 1 oz (Plata)', 'coin', 1.0000, 0.9999, 2024, 'Canadá', FALSE, 18.00, 'Moneda de plata de máxima pureza con la hoja de arce canadiense.', '/coins/maple-leaf-1oz-plata.png'),
(9, 2, 'Libertad 1 oz', 'coin', 1.0000, 0.9990, 2024, 'México', TRUE, 22.00, 'Moneda de plata mexicana con el Ángel de la Independencia, muy valorada por coleccionistas.', '/coins/libertad-1oz.png'),
(10, 2, 'Toro de Cheshire 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Reino Unido', TRUE, 25.00, 'Moneda de edición limitada de la serie "Animales Míticos de Gran Bretaña".', '/coins/toro-de-cheshire-1oz.png'),
(11, 1, 'Lingote de Oro 1 oz', 'ingot', 1.0000, 0.9999, NULL, 'Suiza', FALSE, 2.50, 'Lingote estándar de oro de inversión certificado LBMA, fabricado por PAMP Suisse.', '/coins/lingote-de-oro-1oz.png'),
(12, 1, 'Lingote de Oro 10 oz', 'ingot', 10.0000, 0.9999, NULL, 'Suiza', FALSE, 1.80, 'Lingote de oro de gran formato, ideal para inversión a largo plazo.', '/coins/lingote-de-oro-10oz.png'),
(13, 1, 'Lingote de Oro 100 g', 'bar', 3.2151, 0.9999, NULL, 'Alemania', FALSE, 2.00, 'Barra de oro estándar de 100 gramos, una de las más populares en Europa.', '/coins/lingote-de-oro-100g.png'),
(14, 2, 'Lingote de Plata 10 oz', 'ingot', 10.0000, 0.9990, NULL, 'Estados Unidos', FALSE, 12.00, 'Lingote de plata de 10 onzas, formato ideal para comenzar a invertir en plata.', '/coins/lingote-de-plata-10oz.png'),
(15, 2, 'Lingote de Plata 100 oz', 'bar', 100.0000, 0.9990, NULL, 'Estados Unidos', FALSE, 8.00, 'Barra de plata de 100 onzas, el formato más eficiente en coste para inversores.', '/coins/lingote-de-plata-100oz.png');

INSERT INTO price_alerts (id_alert, id_user, id_mineral, threshold_price, condition_type, is_active, created_at) VALUES
(1, 2, 1, 2500.0000, 'above', TRUE, '2026-03-24 12:17:59'),
(5, 6, 1, 1.0000, 'above', FALSE, '2026-03-24 13:03:03'),
(24, 5, 1, 1.0000, 'above', FALSE, '2026-04-10 07:50:38');

INSERT INTO alert_notifications (id_notification, id_alert, triggered_at, price_at_trigger) VALUES
(4, 5, '2026-03-24 13:04:01', 140.9039);

INSERT INTO treasuries (id_treasury, id_user, created_at) VALUES
(1, 2, '2026-03-08 15:46:07'),
(2, 3, '2026-03-13 09:05:39'),
(3, 5, '2026-04-08 11:27:51');

INSERT INTO treasury_items (id_item, id_treasury, id_mineral, quantity, purchase_price, created_at) VALUES
(3, 1, 1, 0.8000, 163.6377, '2026-03-13 08:03:59'),
(4, 2, 1, 15.5000, 163.5701, '2026-03-13 09:05:40'),
(5, 2, 2, 1.5000, 2.6667, '2026-03-13 09:15:23'),
(21, 3, 1, 2.0000, 154.6322, '2026-04-17 07:21:25');

-- Sincronizar secuencias SERIAL con los IDs insertados
SELECT setval('minerals_id_mineral_seq', (SELECT MAX(id_mineral) FROM minerals));
SELECT setval('users_id_user_seq', (SELECT MAX(id_user) FROM users));
SELECT setval('products_id_product_seq', (SELECT MAX(id_product) FROM products));
SELECT setval('price_alerts_id_alert_seq', (SELECT MAX(id_alert) FROM price_alerts));
SELECT setval('alert_notifications_id_notification_seq', (SELECT MAX(id_notification) FROM alert_notifications));
SELECT setval('treasuries_id_treasury_seq', (SELECT MAX(id_treasury) FROM treasuries));
SELECT setval('treasury_items_id_item_seq', (SELECT MAX(id_item) FROM treasury_items));
