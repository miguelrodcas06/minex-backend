-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 20-04-2026 a las 08:44:40
-- Versión del servidor: 8.0.43
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `minex`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alert_notifications`
--

CREATE TABLE `alert_notifications` (
  `id_notification` int NOT NULL,
  `id_alert` int NOT NULL,
  `triggered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `price_at_trigger` decimal(12,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `alert_notifications`
--

INSERT INTO `alert_notifications` (`id_notification`, `id_alert`, `triggered_at`, `price_at_trigger`) VALUES
(4, 5, '2026-03-24 13:04:01', 140.9039);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `minerals`
--

CREATE TABLE `minerals` (
  `id_mineral` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `description` text,
  `is_precious` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `minerals`
--

INSERT INTO `minerals` (`id_mineral`, `name`, `symbol`, `description`, `is_precious`) VALUES
(1, 'oro', 'Au', 'Metal precioso muy valorado en joyería, inversión y tecnología.', 1),
(2, 'plata', 'Ag', 'Metal precioso con la mayor conductividad eléctrica y térmica.', 1),
(3, 'platino', 'Pt', 'Metal precioso muy denso y maleable, usado en joyería y convertidores catalíticos.', 1),
(4, 'paladio', 'Pd', 'Metal raro y brillante, crucial para la industria automotriz y electrónica.', 1),
(5, 'cobre', 'Cu', 'Metal industrial esencial, excelente conductor de electricidad.', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `price_alerts`
--

CREATE TABLE `price_alerts` (
  `id_alert` int NOT NULL,
  `id_user` int NOT NULL,
  `id_mineral` int NOT NULL,
  `threshold_price` decimal(12,4) NOT NULL,
  `condition_type` enum('above','below') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `price_alerts`
--

INSERT INTO `price_alerts` (`id_alert`, `id_user`, `id_mineral`, `threshold_price`, `condition_type`, `is_active`, `created_at`) VALUES
(1, 2, 1, 2500.0000, 'above', 1, '2026-03-24 12:17:59'),
(5, 6, 1, 1.0000, 'above', 0, '2026-03-24 13:03:03'),
(24, 5, 1, 1.0000, 'above', 0, '2026-04-10 07:50:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id_product` int NOT NULL,
  `id_mineral` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('coin','ingot','bar','round') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight_oz` decimal(10,4) NOT NULL COMMENT 'Peso en onzas troy',
  `purity` decimal(5,4) NOT NULL COMMENT 'Pureza del metal, ej: 0.9999',
  `year` int DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_exclusive` tinyint(1) NOT NULL DEFAULT '0',
  `premium_pct` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Porcentaje de prima sobre el precio spot',
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id_product`, `id_mineral`, `name`, `type`, `weight_oz`, `purity`, `year`, `country`, `is_exclusive`, `premium_pct`, `description`, `image_url`) VALUES
(1, 1, 'American Eagle 1 oz', 'coin', 1.0000, 0.9167, 2024, 'Estados Unidos', 1, 5.50, 'La moneda de oro más popular del mundo, emitida por la Casa de la Moneda de EE.UU. desde 1986.', '/coins/american-eagle-1oz.png'),
(2, 1, 'Krugerrand 1 oz', 'coin', 1.0000, 0.9167, 2024, 'Sudáfrica', 0, 4.00, 'Primera moneda de inversión moderna del mundo, acuñada en Sudáfrica desde 1967.', '/coins/krugerrand-1oz.png'),
(3, 1, 'Maple Leaf 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Canadá', 0, 4.50, 'Moneda de oro de máxima pureza emitida por la Real Casa de la Moneda de Canadá.', '/coins/maple-leaf-1oz.png'),
(4, 1, 'Philharmonic 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Austria', 0, 4.00, 'La moneda de oro más vendida de Europa, emitida por la Casa de la Moneda de Austria.', '/coins/philharmonic-1oz.png'),
(5, 1, 'Nugget Canguro 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Australia', 1, 6.00, 'Moneda coleccionable australiana con diseño de canguro que cambia cada año.', '/coins/nugget-canguro-1oz.png'),
(6, 1, 'Britannia 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Reino Unido', 1, 5.00, 'Moneda oficial de oro del Reino Unido, emitida por la Real Casa de la Moneda Británica.', '/coins/britannia-1oz.png'),
(7, 2, 'American Eagle 1 oz (Plata)', 'coin', 1.0000, 0.9993, 2024, 'Estados Unidos', 0, 20.00, 'La moneda de plata más reconocida del mundo, de curso legal en EE.UU.', '/coins/american-eagle-1oz-plata.png'),
(8, 2, 'Maple Leaf 1 oz (Plata)', 'coin', 1.0000, 0.9999, 2024, 'Canadá', 0, 18.00, 'Moneda de plata de máxima pureza con la hoja de arce canadiense.', '/coins/maple-leaf-1oz-plata.png'),
(9, 2, 'Libertad 1 oz', 'coin', 1.0000, 0.9990, 2024, 'México', 1, 22.00, 'Moneda de plata mexicana con el Ángel de la Independencia, muy valorada por coleccionistas.', '/coins/libertad-1oz.png'),
(10, 2, 'Toro de Cheshire 1 oz', 'coin', 1.0000, 0.9999, 2024, 'Reino Unido', 1, 25.00, 'Moneda de edición limitada de la serie \"Animales Míticos de Gran Bretaña\".', '/coins/toro-de-cheshire-1oz.png'),
(11, 1, 'Lingote de Oro 1 oz', 'ingot', 1.0000, 0.9999, NULL, 'Suiza', 0, 2.50, 'Lingote estándar de oro de inversión certificado LBMA, fabricado por PAMP Suisse.', '/coins/lingote-de-oro-1oz.png'),
(12, 1, 'Lingote de Oro 10 oz', 'ingot', 10.0000, 0.9999, NULL, 'Suiza', 0, 1.80, 'Lingote de oro de gran formato, ideal para inversión a largo plazo.', '/coins/lingote-de-oro-10oz.png'),
(13, 1, 'Lingote de Oro 100 g', 'bar', 3.2151, 0.9999, NULL, 'Alemania', 0, 2.00, 'Barra de oro estándar de 100 gramos, una de las más populares en Europa.', '/coins/lingote-de-oro-100g.png'),
(14, 2, 'Lingote de Plata 10 oz', 'ingot', 10.0000, 0.9990, NULL, 'Estados Unidos', 0, 12.00, 'Lingote de plata de 10 onzas, formato ideal para comenzar a invertir en plata.', '/coins/lingote-de-plata-10oz.png'),
(15, 2, 'Lingote de Plata 100 oz', 'bar', 100.0000, 0.9990, NULL, 'Estados Unidos', 0, 8.00, 'Barra de plata de 100 onzas, el formato más eficiente en coste para inversores.', '/coins/lingote-de-plata-100oz.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `treasuries`
--

CREATE TABLE `treasuries` (
  `id_treasury` int NOT NULL,
  `id_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `treasuries`
--

INSERT INTO `treasuries` (`id_treasury`, `id_user`, `created_at`) VALUES
(1, 2, '2026-03-08 15:46:07'),
(2, 3, '2026-03-13 09:05:39'),
(3, 5, '2026-04-08 11:27:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `treasury_items`
--

CREATE TABLE `treasury_items` (
  `id_item` int NOT NULL,
  `id_treasury` int NOT NULL,
  `id_mineral` int NOT NULL,
  `quantity` decimal(12,4) NOT NULL,
  `purchase_price` decimal(12,4) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `treasury_items`
--

INSERT INTO `treasury_items` (`id_item`, `id_treasury`, `id_mineral`, `quantity`, `purchase_price`, `created_at`) VALUES
(3, 1, 1, 0.8000, 163.6377, '2026-03-13 08:03:59'),
(4, 2, 1, 15.5000, 163.5701, '2026-03-13 09:05:40'),
(5, 2, 2, 1.5000, 2.6667, '2026-03-13 09:15:23'),
(21, 3, 1, 2.0000, 154.6322, '2026-04-17 07:21:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `balance` decimal(12,4) NOT NULL DEFAULT '10000.0000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `username`, `email`, `password_hash`, `created_at`, `is_active`, `balance`) VALUES
(2, 'prueba_minex', 'prueba@minex.com', '$2b$10$nkzqflGEfQDggErhGquXee6qsvk51Hgk/hZzcXeGZGdUV5.wD/RVS', '2026-03-08 13:29:03', 1, 15263.6540),
(3, 'miguel_minex', 'miguel@minex.com', '$2b$10$58CQxW9HUZ61uv65fObZHOaUaeRjX9HoUoK8xpYNG5S9ATXBjJS.u', '2026-03-13 07:51:54', 0, 10000.0000),
(4, 'miguel-prueba_minex', 'miguel-prueba@minex.com', '$2b$10$.GRWwHMYxvTnSQoKoNVxV.1J4nmId0zWweREJHcMokdLqt1qnEbC2', '2026-03-13 09:22:05', 1, 10000.0000),
(5, 'ADMIN', 'miguelrodriguezcasado06@gmail.com', '$2b$10$z5FzpWllUBeJPSkx6TeVyOwF7375NR99xqTwlS262gr6jcOb1B6fO', '2026-03-24 12:31:09', 1, 9679.5775),
(6, 'Sergio', 'smrcuriel@gmail.com', '$2b$10$EPUtz7se/e6sstqDfT06cewgaOeTdjylq5ZohASWeN6Lb.akpCmza', '2026-03-24 13:00:56', 1, 10000.0000),
(7, 'p', 'p@gmail.com', '$2b$10$tsKVBMEy75sJL1KjLFRoceQLiBdXCCI74p/.RVX8FHkcTtcrwh03u', '2026-04-06 07:56:56', 1, 10000.0000);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alert_notifications`
--
ALTER TABLE `alert_notifications`
  ADD PRIMARY KEY (`id_notification`),
  ADD KEY `fk_notification_alert` (`id_alert`);

--
-- Indices de la tabla `minerals`
--
ALTER TABLE `minerals`
  ADD PRIMARY KEY (`id_mineral`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `price_alerts`
--
ALTER TABLE `price_alerts`
  ADD PRIMARY KEY (`id_alert`),
  ADD KEY `fk_alert_user` (`id_user`),
  ADD KEY `fk_alert_mineral` (`id_mineral`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id_product`),
  ADD KEY `fk_product_mineral` (`id_mineral`);

--
-- Indices de la tabla `treasuries`
--
ALTER TABLE `treasuries`
  ADD PRIMARY KEY (`id_treasury`),
  ADD KEY `fk_treasury_user` (`id_user`);

--
-- Indices de la tabla `treasury_items`
--
ALTER TABLE `treasury_items`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `fk_item_treasury` (`id_treasury`),
  ADD KEY `fk_item_mineral` (`id_mineral`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alert_notifications`
--
ALTER TABLE `alert_notifications`
  MODIFY `id_notification` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `minerals`
--
ALTER TABLE `minerals`
  MODIFY `id_mineral` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `price_alerts`
--
ALTER TABLE `price_alerts`
  MODIFY `id_alert` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id_product` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `treasuries`
--
ALTER TABLE `treasuries`
  MODIFY `id_treasury` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `treasury_items`
--
ALTER TABLE `treasury_items`
  MODIFY `id_item` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alert_notifications`
--
ALTER TABLE `alert_notifications`
  ADD CONSTRAINT `alert_notifications_ibfk_1` FOREIGN KEY (`id_alert`) REFERENCES `price_alerts` (`id_alert`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_alert` FOREIGN KEY (`id_alert`) REFERENCES `price_alerts` (`id_alert`) ON DELETE CASCADE;

--
-- Filtros para la tabla `price_alerts`
--
ALTER TABLE `price_alerts`
  ADD CONSTRAINT `fk_alert_mineral` FOREIGN KEY (`id_mineral`) REFERENCES `minerals` (`id_mineral`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alert_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `price_alerts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `price_alerts_ibfk_2` FOREIGN KEY (`id_mineral`) REFERENCES `minerals` (`id_mineral`);

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`id_mineral`) REFERENCES `minerals` (`id_mineral`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `treasuries`
--
ALTER TABLE `treasuries`
  ADD CONSTRAINT `fk_treasury_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `treasuries_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Filtros para la tabla `treasury_items`
--
ALTER TABLE `treasury_items`
  ADD CONSTRAINT `fk_item_mineral` FOREIGN KEY (`id_mineral`) REFERENCES `minerals` (`id_mineral`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_treasury` FOREIGN KEY (`id_treasury`) REFERENCES `treasuries` (`id_treasury`) ON DELETE CASCADE,
  ADD CONSTRAINT `treasury_items_ibfk_1` FOREIGN KEY (`id_treasury`) REFERENCES `treasuries` (`id_treasury`) ON DELETE CASCADE,
  ADD CONSTRAINT `treasury_items_ibfk_2` FOREIGN KEY (`id_mineral`) REFERENCES `minerals` (`id_mineral`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
