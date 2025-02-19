-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-09-2024 a las 06:34:00
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cap3d`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `idalumno` int(11) NOT NULL,
  `apenomb` varchar(500) NOT NULL,
  `dni` int(20) NOT NULL,
  `carrera` varchar(120) NOT NULL,
  `año` int(20) NOT NULL,
  `fecha` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`idalumno`, `apenomb`, `dni`, `carrera`, `año`, `fecha`) VALUES
(1, 'ALDERETE DIEGO EDUARDO', 31840303, 'Prof. de Informática', 3, '2024-09-24 16:26:12'),
(2, 'HERRERA IRENE DEL CARMEN', 32723694, 'Prof. de Informática', 1, '2024-09-24 16:33:32'),
(3, 'MORALES MARIO', 13894069, 'Prof. de Informática', 4, '2024-09-24 16:35:46'),
(4, 'María Esther Lara', 31545544, 'Prof. de Informática', 1, '2024-09-24 16:48:10'),
(5, 'Ariel Delgado', 31840339, 'Prof. de Informática', 3, '2024-09-26 00:17:28'),
(6, 'Exequiel Pavón ', 40965712, 'Prof. de Informática', 3, '2024-09-26 00:38:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `idasistencia` int(11) NOT NULL,
  `idalumno` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` varchar(120) NOT NULL,
  `obs` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`idasistencia`, `idalumno`, `fecha`, `estado`, `obs`) VALUES
(1, 1, '2024-09-24', 'Presente', ''),
(2, 2, '2024-09-24', 'Presente', ''),
(3, 3, '2024-09-24', 'Presente', ''),
(4, 4, '2024-09-24', 'Presente', ''),
(5, 1, '2024-09-25', 'Presente', ''),
(6, 2, '2024-09-25', 'Presente', ''),
(7, 3, '2024-09-25', 'Presente', ''),
(8, 5, '2024-09-26', 'Presente', ''),
(9, 1, '2024-09-26', 'Presente', ''),
(10, 6, '2024-09-26', 'Presente', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`idalumno`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`idasistencia`),
  ADD KEY `idalumno` (`idalumno`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `idalumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `idasistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`idalumno`) REFERENCES `alumno` (`idalumno`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
