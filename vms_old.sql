-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 30, 2026 at 03:43 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vms`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
CREATE TABLE IF NOT EXISTS `audit_events` (
  `id` char(36) NOT NULL,
  `actor` varchar(128) NOT NULL,
  `action` enum('LOCATION_CREATE','LOCATION_UPDATE','LOCATION_DELETE','LOCATION_RECOVER','CAMERA_CREATE','CAMERA_UPDATE','CAMERA_DELETE','CAMERA_IMPORT','SETTINGS_UPDATE') NOT NULL,
  `entityId` char(36) DEFAULT NULL,
  `entityName` varchar(255) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_at` (`at`),
  KEY `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_events`
--

INSERT INTO `audit_events` (`id`, `actor`, `action`, `entityId`, `entityName`, `details`, `at`) VALUES
('8ffa4e7a-fde9-11f0-bfe6-a0e70ba38af9', 'system', 'CAMERA_IMPORT', NULL, 'Seed Data', '{\"cameras\": 68, \"locations\": 6}', '2026-01-30 20:10:01');

-- --------------------------------------------------------

--
-- Table structure for table `cameras`
--

DROP TABLE IF EXISTS `cameras`;
CREATE TABLE IF NOT EXISTS `cameras` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `locationId` char(36) NOT NULL,
  `zone` varchar(255) NOT NULL,
  `ipAddress` varchar(64) NOT NULL,
  `rtspUrl` text NOT NULL,
  `hlsUrl` text,
  `whepUrl` text,
  `codec` enum('H264','H265') DEFAULT NULL,
  `fps` int DEFAULT NULL,
  `resolution` varchar(64) DEFAULT NULL,
  `bitrateKbps` int DEFAULT NULL,
  `packetLossPct` decimal(5,2) DEFAULT NULL,
  `jitterMs` int DEFAULT NULL,
  `firmwareVersion` varchar(128) DEFAULT NULL,
  `lastRebootAt` datetime DEFAULT NULL,
  `cameraType` enum('PTZ','FIXED','DOME','BULLET') NOT NULL,
  `vendor` varchar(128) NOT NULL,
  `installationDate` date NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('ONLINE','OFFLINE','WARNING') NOT NULL DEFAULT 'ONLINE',
  `lastSeenAt` datetime DEFAULT NULL,
  `lastLatencyMs` int DEFAULT NULL,
  `signalStrength` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_camera_location` (`locationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cameras`
--

INSERT INTO `cameras` (`id`, `name`, `locationId`, `zone`, `ipAddress`, `rtspUrl`, `hlsUrl`, `whepUrl`, `codec`, `fps`, `resolution`, `bitrateKbps`, `packetLossPct`, `jitterMs`, `firmwareVersion`, `lastRebootAt`, `cameraType`, `vendor`, `installationDate`, `enabled`, `status`, `lastSeenAt`, `lastLatencyMs`, `signalStrength`) VALUES
('00968ffc-fde9-11f0-bfe6-a0e70ba38af9', 'Sudarsan', '004ea1c2-fde9-11f0-bfe6-a0e70ba38af9', 'Main Gate', '10.10.1.21', 'rtsp://10.10.1.21/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 25, '1920×1080', 2500, 0.20, 6, '1.8.3', '2026-01-30 20:06:02', 'PTZ', 'Axis', '2024-05-12', 1, 'ONLINE', NULL, NULL, NULL),
('009727af-fde9-11f0-bfe6-a0e70ba38af9', 'Yard-02', '004ea1c2-fde9-11f0-bfe6-a0e70ba38af9', 'Container Yard', '10.10.1.22', 'rtsp://10.10.1.22/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 20, '1280×720', 1800, 0.90, 18, 'V5.6.1', '2026-01-30 20:06:02', 'DOME', 'Hikvision', '2024-06-03', 1, 'WARNING', NULL, NULL, NULL),
('00973074-fde9-11f0-bfe6-a0e70ba38af9', 'Dock-03', '005173a1-fde9-11f0-bfe6-a0e70ba38af9', 'Loading Dock', '10.20.5.11', 'rtsp://10.20.5.11/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 25, '1920×1080', 2200, 0.30, 9, '3.1.0', '2026-01-30 20:06:02', 'BULLET', 'Dahua', '2023-11-19', 1, 'ONLINE', NULL, NULL, NULL),
('009740bc-fde9-11f0-bfe6-a0e70ba38af9', 'Perimeter-01', '0057fa8c-fde9-11f0-bfe6-a0e70ba38af9', 'Perimeter', '10.30.3.5', 'rtsp://10.30.3.5/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 15, '1280×720', 1400, 3.20, 45, '2.4.9', '2026-01-30 20:06:02', 'FIXED', 'Bosch', '2022-09-07', 1, 'OFFLINE', NULL, NULL, NULL),
('00974615-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-01', '005e2ebe-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.209', 'rtsp://live:WSS4Bosch!@117.236.225.209:554', 'http://localhost:8888/kesanapalli-01-h264/index.m3u8', 'http://localhost:8889/kesanapalli-01-h264/whep', 'H264', 25, '1920×1080', 3000, 0.40, 10, 'BOSCH-7.0.2', '2026-01-30 20:06:02', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('009749e0-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-02', '005e2ebe-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.211', 'rtsp://live:WSS4Bosch!@117.236.225.211:554', 'http://localhost:8888/kesanapalli-02/index.m3u8', 'http://localhost:8889/kesanapalli-02/whep', 'H264', 25, '1920×1080', 2800, 0.50, 11, 'BOSCH-7.0.2', '2026-01-30 20:06:02', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('00974c68-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-03', '005e2ebe-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.212', 'rtsp://live:WSS4Bosch!@117.236.225.212:554', 'http://localhost:8888/kesanapalli-03/index.m3u8', 'http://localhost:8889/kesanapalli-03/whep', 'H264', 25, '1920×1080', 2800, 0.60, 12, 'BOSCH-7.0.2', '2026-01-30 20:06:02', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('00974ee3-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-04', '005e2ebe-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.213', 'rtsp://live:WSS4Bosch!@117.236.225.213:554', 'http://localhost:8888/kesanapalli-04-h264/index.m3u8', 'http://localhost:8889/kesanapalli-04-h264/whep', 'H264', 25, '1920×1080', 3000, 0.40, 10, 'BOSCH-7.0.2', '2026-01-30 20:06:02', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('51b409ed-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-01', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/1/1', 'http://localhost:8888/vijayawada-01/index.m3u8', 'http://localhost:8889/vijayawada-01/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4317c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-02', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/2/1', 'http://localhost:8888/vijayawada-02/index.m3u8', 'http://localhost:8889/vijayawada-02/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b433c2-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-03', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/3/1', 'http://localhost:8888/vijayawada-03/index.m3u8', 'http://localhost:8889/vijayawada-03/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b434c5-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-04', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/4/1', 'http://localhost:8888/vijayawada-04/index.m3u8', 'http://localhost:8889/vijayawada-04/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4359d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-05', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/5/1', 'http://localhost:8888/vijayawada-05/index.m3u8', 'http://localhost:8889/vijayawada-05/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4367b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-06', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/6/1', 'http://localhost:8888/vijayawada-06/index.m3u8', 'http://localhost:8889/vijayawada-06/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43753-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-07', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/7/1', 'http://localhost:8888/vijayawada-07/index.m3u8', 'http://localhost:8889/vijayawada-07/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43af6-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-08', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/8/1', 'http://localhost:8888/vijayawada-08/index.m3u8', 'http://localhost:8889/vijayawada-08/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43c21-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-09', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/9/1', 'http://localhost:8888/vijayawada-09/index.m3u8', 'http://localhost:8889/vijayawada-09/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43cea-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-10', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/10/1', 'http://localhost:8888/vijayawada-10/index.m3u8', 'http://localhost:8889/vijayawada-10/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43dd1-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-11', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/11/1', 'http://localhost:8888/vijayawada-11/index.m3u8', 'http://localhost:8889/vijayawada-11/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43e9f-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-12', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/12/1', 'http://localhost:8888/vijayawada-12/index.m3u8', 'http://localhost:8889/vijayawada-12/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b43f97-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-13', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/13/1', 'http://localhost:8888/vijayawada-13/index.m3u8', 'http://localhost:8889/vijayawada-13/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b440a9-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-14', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/14/1', 'http://localhost:8888/vijayawada-14/index.m3u8', 'http://localhost:8889/vijayawada-14/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4417e-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-15', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/15/1', 'http://localhost:8888/vijayawada-15/index.m3u8', 'http://localhost:8889/vijayawada-15/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b44254-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-16', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/16/1', 'http://localhost:8888/vijayawada-16/index.m3u8', 'http://localhost:8889/vijayawada-16/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b44338-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-17', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/17/1', 'http://localhost:8888/vijayawada-17/index.m3u8', 'http://localhost:8889/vijayawada-17/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b44414-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-18', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/18/1', 'http://localhost:8888/vijayawada-18/index.m3u8', 'http://localhost:8889/vijayawada-18/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b46c33-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-19', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/19/1', 'http://localhost:8888/vijayawada-19/index.m3u8', 'http://localhost:8889/vijayawada-19/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b47389-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-20', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/20/1', 'http://localhost:8888/vijayawada-20/index.m3u8', 'http://localhost:8889/vijayawada-20/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b47681-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-21', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/21/1', 'http://localhost:8888/vijayawada-21/index.m3u8', 'http://localhost:8889/vijayawada-21/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b48080-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-22', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/22/1', 'http://localhost:8888/vijayawada-22/index.m3u8', 'http://localhost:8889/vijayawada-22/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b48710-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-23', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/23/1', 'http://localhost:8888/vijayawada-23/index.m3u8', 'http://localhost:8889/vijayawada-23/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b489e8-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-24', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/24/1', 'http://localhost:8888/vijayawada-24/index.m3u8', 'http://localhost:8889/vijayawada-24/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b48c79-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-25', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/25/1', 'http://localhost:8888/vijayawada-25/index.m3u8', 'http://localhost:8889/vijayawada-25/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b48f49-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-26', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/26/1', 'http://localhost:8888/vijayawada-26/index.m3u8', 'http://localhost:8889/vijayawada-26/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b491df-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-27', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/27/1', 'http://localhost:8888/vijayawada-27/index.m3u8', 'http://localhost:8889/vijayawada-27/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4946d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-28', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/28/1', 'http://localhost:8888/vijayawada-28/index.m3u8', 'http://localhost:8889/vijayawada-28/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b49731-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-29', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/29/1', 'http://localhost:8888/vijayawada-29/index.m3u8', 'http://localhost:8889/vijayawada-29/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b49a13-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-30', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/30/1', 'http://localhost:8888/vijayawada-30/index.m3u8', 'http://localhost:8889/vijayawada-30/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b49d29-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-31', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/31/1', 'http://localhost:8888/vijayawada-31/index.m3u8', 'http://localhost:8889/vijayawada-31/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4a047-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-32', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/32/1', 'http://localhost:8888/vijayawada-32/index.m3u8', 'http://localhost:8889/vijayawada-32/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4a36b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-33', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/33/1', 'http://localhost:8888/vijayawada-33/index.m3u8', 'http://localhost:8889/vijayawada-33/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4a639-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-34', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/34/1', 'http://localhost:8888/vijayawada-34/index.m3u8', 'http://localhost:8889/vijayawada-34/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4a929-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-35', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/35/1', 'http://localhost:8888/vijayawada-35/index.m3u8', 'http://localhost:8889/vijayawada-35/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4adbc-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-36', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/36/1', 'http://localhost:8888/vijayawada-36/index.m3u8', 'http://localhost:8889/vijayawada-36/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4b13d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-37', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/37/1', 'http://localhost:8888/vijayawada-37/index.m3u8', 'http://localhost:8889/vijayawada-37/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4b418-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-38', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/38/1', 'http://localhost:8888/vijayawada-38/index.m3u8', 'http://localhost:8889/vijayawada-38/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4b706-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-39', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/39/1', 'http://localhost:8888/vijayawada-39/index.m3u8', 'http://localhost:8889/vijayawada-39/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4ba15-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-40', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/40/1', 'http://localhost:8888/vijayawada-40/index.m3u8', 'http://localhost:8889/vijayawada-40/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4bd12-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-41', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/41/1', 'http://localhost:8888/vijayawada-41/index.m3u8', 'http://localhost:8889/vijayawada-41/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4c055-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-42', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/42/1', 'http://localhost:8888/vijayawada-42/index.m3u8', 'http://localhost:8889/vijayawada-42/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4c3b7-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-43', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/43/1', 'http://localhost:8888/vijayawada-43/index.m3u8', 'http://localhost:8889/vijayawada-43/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4c70c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-44', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/44/1', 'http://localhost:8888/vijayawada-44/index.m3u8', 'http://localhost:8889/vijayawada-44/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4c9da-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-45', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/45/1', 'http://localhost:8888/vijayawada-45/index.m3u8', 'http://localhost:8889/vijayawada-45/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4ccb8-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-46', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/46/1', 'http://localhost:8888/vijayawada-46/index.m3u8', 'http://localhost:8889/vijayawada-46/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4cf8c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-47', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/47/1', 'http://localhost:8888/vijayawada-47/index.m3u8', 'http://localhost:8889/vijayawada-47/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4df7c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-48', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/48/1', 'http://localhost:8888/vijayawada-48/index.m3u8', 'http://localhost:8889/vijayawada-48/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4e366-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-49', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/49/1', 'http://localhost:8888/vijayawada-49/index.m3u8', 'http://localhost:8889/vijayawada-49/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('51b4eb88-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-50', '', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/50/1', 'http://localhost:8888/vijayawada-50/index.m3u8', 'http://localhost:8889/vijayawada-50/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', NULL, 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8f7baf4d-fde9-11f0-bfe6-a0e70ba38af9', 'Gate-01', '8f315838-fde9-11f0-bfe6-a0e70ba38af9', 'Main Gate', '10.10.1.21', 'rtsp://10.10.1.21/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 25, '1920×1080', 2500, 0.20, 6, '1.8.3', '2026-01-30 20:10:01', 'PTZ', 'Axis', '2024-05-12', 1, 'ONLINE', NULL, NULL, NULL),
('8f7bb8f0-fde9-11f0-bfe6-a0e70ba38af9', 'Yard-02', '8f315838-fde9-11f0-bfe6-a0e70ba38af9', 'Container Yard', '10.10.1.22', 'rtsp://10.10.1.22/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 20, '1280×720', 1800, 0.90, 18, 'V5.6.1', '2026-01-30 20:10:01', 'DOME', 'Hikvision', '2024-06-03', 1, 'WARNING', NULL, NULL, NULL),
('8f7bbd18-fde9-11f0-bfe6-a0e70ba38af9', 'Dock-03', '8f3bd0cc-fde9-11f0-bfe6-a0e70ba38af9', 'Loading Dock', '10.20.5.11', 'rtsp://10.20.5.11/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 25, '1920×1080', 2200, 0.30, 9, '3.1.0', '2026-01-30 20:10:01', 'BULLET', 'Dahua', '2023-11-19', 1, 'ONLINE', NULL, NULL, NULL),
('8f7bc057-fde9-11f0-bfe6-a0e70ba38af9', 'Perimeter-01', '8f423f2c-fde9-11f0-bfe6-a0e70ba38af9', 'Perimeter', '10.30.3.5', 'rtsp://10.30.3.5/stream1', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', NULL, 'H264', 15, '1280×720', 1400, 3.20, 45, '2.4.9', '2026-01-30 20:10:01', 'FIXED', 'Bosch', '2022-09-07', 1, 'OFFLINE', NULL, NULL, NULL),
('8f7bc3ce-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-01', '8f48ed34-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.209', 'rtsp://live:WSS4Bosch!@117.236.225.209:554', 'http://localhost:8888/kesanapalli-01-h264/index.m3u8', 'http://localhost:8889/kesanapalli-01-h264/whep', 'H264', 25, '1920×1080', 3000, 0.40, 10, 'BOSCH-7.0.2', '2026-01-30 20:10:01', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('8f7bdb97-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-02', '8f48ed34-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.211', 'rtsp://live:WSS4Bosch!@117.236.225.211:554', 'http://localhost:8888/kesanapalli-02/index.m3u8', 'http://localhost:8889/kesanapalli-02/whep', 'H264', 25, '1920×1080', 2800, 0.50, 11, 'BOSCH-7.0.2', '2026-01-30 20:10:01', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('8f7bde3c-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-03', '8f48ed34-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.212', 'rtsp://live:WSS4Bosch!@117.236.225.212:554', 'http://localhost:8888/kesanapalli-03/index.m3u8', 'http://localhost:8889/kesanapalli-03/whep', 'H264', 25, '1920×1080', 2800, 0.60, 12, 'BOSCH-7.0.2', '2026-01-30 20:10:01', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('8f7be01b-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli-04', '8f48ed34-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', '117.236.225.213', 'rtsp://live:WSS4Bosch!@117.236.225.213:554', 'http://localhost:8888/kesanapalli-04-h264/index.m3u8', 'http://localhost:8889/kesanapalli-04-h264/whep', 'H264', 25, '1920×1080', 3000, 0.40, 10, 'BOSCH-7.0.2', '2026-01-30 20:10:01', 'FIXED', 'Bosch', '2026-01-28', 1, 'ONLINE', NULL, NULL, NULL),
('8fad54c2-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-01', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/1/1', 'http://localhost:8888/vijayawada-01/index.m3u8', 'http://localhost:8889/vijayawada-01/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad6c43-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-02', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/2/1', 'http://localhost:8888/vijayawada-02/index.m3u8', 'http://localhost:8889/vijayawada-02/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad6ed6-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-03', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/3/1', 'http://localhost:8888/vijayawada-03/index.m3u8', 'http://localhost:8889/vijayawada-03/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad7104-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-04', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/4/1', 'http://localhost:8888/vijayawada-04/index.m3u8', 'http://localhost:8889/vijayawada-04/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad72c4-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-05', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/5/1', 'http://localhost:8888/vijayawada-05/index.m3u8', 'http://localhost:8889/vijayawada-05/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad747f-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-06', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/6/1', 'http://localhost:8888/vijayawada-06/index.m3u8', 'http://localhost:8889/vijayawada-06/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad75fc-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-07', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/7/1', 'http://localhost:8888/vijayawada-07/index.m3u8', 'http://localhost:8889/vijayawada-07/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad7781-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-08', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/8/1', 'http://localhost:8888/vijayawada-08/index.m3u8', 'http://localhost:8889/vijayawada-08/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad7974-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-09', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/9/1', 'http://localhost:8888/vijayawada-09/index.m3u8', 'http://localhost:8889/vijayawada-09/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad7cec-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-10', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/10/1', 'http://localhost:8888/vijayawada-10/index.m3u8', 'http://localhost:8889/vijayawada-10/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad803d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-11', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/11/1', 'http://localhost:8888/vijayawada-11/index.m3u8', 'http://localhost:8889/vijayawada-11/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad81b9-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-12', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/12/1', 'http://localhost:8888/vijayawada-12/index.m3u8', 'http://localhost:8889/vijayawada-12/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad8328-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-13', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/13/1', 'http://localhost:8888/vijayawada-13/index.m3u8', 'http://localhost:8889/vijayawada-13/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad848a-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-14', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/14/1', 'http://localhost:8888/vijayawada-14/index.m3u8', 'http://localhost:8889/vijayawada-14/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad85e5-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-15', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/15/1', 'http://localhost:8888/vijayawada-15/index.m3u8', 'http://localhost:8889/vijayawada-15/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad874c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-16', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/16/1', 'http://localhost:8888/vijayawada-16/index.m3u8', 'http://localhost:8889/vijayawada-16/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad8ae0-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-17', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/17/1', 'http://localhost:8888/vijayawada-17/index.m3u8', 'http://localhost:8889/vijayawada-17/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad904b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-18', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/18/1', 'http://localhost:8888/vijayawada-18/index.m3u8', 'http://localhost:8889/vijayawada-18/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad956a-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-19', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/19/1', 'http://localhost:8888/vijayawada-19/index.m3u8', 'http://localhost:8889/vijayawada-19/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad99c2-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-20', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/20/1', 'http://localhost:8888/vijayawada-20/index.m3u8', 'http://localhost:8889/vijayawada-20/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad9bd5-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-21', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/21/1', 'http://localhost:8888/vijayawada-21/index.m3u8', 'http://localhost:8889/vijayawada-21/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad9d5d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-22', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/22/1', 'http://localhost:8888/vijayawada-22/index.m3u8', 'http://localhost:8889/vijayawada-22/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fad9ed9-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-23', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/23/1', 'http://localhost:8888/vijayawada-23/index.m3u8', 'http://localhost:8889/vijayawada-23/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada075-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-24', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/24/1', 'http://localhost:8888/vijayawada-24/index.m3u8', 'http://localhost:8889/vijayawada-24/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada1ef-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-25', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/25/1', 'http://localhost:8888/vijayawada-25/index.m3u8', 'http://localhost:8889/vijayawada-25/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada37b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-26', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/26/1', 'http://localhost:8888/vijayawada-26/index.m3u8', 'http://localhost:8889/vijayawada-26/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada508-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-27', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/27/1', 'http://localhost:8888/vijayawada-27/index.m3u8', 'http://localhost:8889/vijayawada-27/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada6a2-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-28', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/28/1', 'http://localhost:8888/vijayawada-28/index.m3u8', 'http://localhost:8889/vijayawada-28/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada838-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-29', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/29/1', 'http://localhost:8888/vijayawada-29/index.m3u8', 'http://localhost:8889/vijayawada-29/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fada9f3-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-30', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/30/1', 'http://localhost:8888/vijayawada-30/index.m3u8', 'http://localhost:8889/vijayawada-30/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadabcc-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-31', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/31/1', 'http://localhost:8888/vijayawada-31/index.m3u8', 'http://localhost:8889/vijayawada-31/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadae05-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-32', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/32/1', 'http://localhost:8888/vijayawada-32/index.m3u8', 'http://localhost:8889/vijayawada-32/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadb01f-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-33', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/33/1', 'http://localhost:8888/vijayawada-33/index.m3u8', 'http://localhost:8889/vijayawada-33/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadb22b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-34', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/34/1', 'http://localhost:8888/vijayawada-34/index.m3u8', 'http://localhost:8889/vijayawada-34/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadb44c-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-35', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/35/1', 'http://localhost:8888/vijayawada-35/index.m3u8', 'http://localhost:8889/vijayawada-35/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadcb99-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-36', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/36/1', 'http://localhost:8888/vijayawada-36/index.m3u8', 'http://localhost:8889/vijayawada-36/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadce40-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-37', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/37/1', 'http://localhost:8888/vijayawada-37/index.m3u8', 'http://localhost:8889/vijayawada-37/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadcfd8-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-38', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/38/1', 'http://localhost:8888/vijayawada-38/index.m3u8', 'http://localhost:8889/vijayawada-38/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadd19b-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-39', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/39/1', 'http://localhost:8888/vijayawada-39/index.m3u8', 'http://localhost:8889/vijayawada-39/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadd324-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-40', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/40/1', 'http://localhost:8888/vijayawada-40/index.m3u8', 'http://localhost:8889/vijayawada-40/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadd4a6-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-41', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/41/1', 'http://localhost:8888/vijayawada-41/index.m3u8', 'http://localhost:8889/vijayawada-41/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fade8cf-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-42', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/42/1', 'http://localhost:8888/vijayawada-42/index.m3u8', 'http://localhost:8889/vijayawada-42/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadf2db-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-43', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/43/1', 'http://localhost:8888/vijayawada-43/index.m3u8', 'http://localhost:8889/vijayawada-43/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadf56e-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-44', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/44/1', 'http://localhost:8888/vijayawada-44/index.m3u8', 'http://localhost:8889/vijayawada-44/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadf9d5-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-45', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/45/1', 'http://localhost:8888/vijayawada-45/index.m3u8', 'http://localhost:8889/vijayawada-45/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadfba3-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-46', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/46/1', 'http://localhost:8888/vijayawada-46/index.m3u8', 'http://localhost:8889/vijayawada-46/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadfd3d-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-47', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/47/1', 'http://localhost:8888/vijayawada-47/index.m3u8', 'http://localhost:8889/vijayawada-47/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fadfeda-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-48', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/48/1', 'http://localhost:8888/vijayawada-48/index.m3u8', 'http://localhost:8889/vijayawada-48/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fae00a2-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-49', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/49/1', 'http://localhost:8888/vijayawada-49/index.m3u8', 'http://localhost:8889/vijayawada-49/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fae0263-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada-NVR-50', '8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Vijayawada (NVR)', '10.205.101.141', 'rtsp://admin:Acss%405995@10.205.101.141:554/50/1', 'http://localhost:8888/vijayawada-50/index.m3u8', 'http://localhost:8889/vijayawada-50/whep', 'H264', 25, '1920×1080', 2400, 0.80, 15, 'NVR-5.2.0', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdfdf8d-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-01', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/1/2', 'http://localhost:8888/mumbai-01/index.m3u8', 'http://localhost:8889/mumbai-01/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdfe82e-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-02', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/2/2', 'http://localhost:8888/mumbai-02/index.m3u8', 'http://localhost:8889/mumbai-02/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdff197-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-03', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/3/2', 'http://localhost:8888/mumbai-03/index.m3u8', 'http://localhost:8889/mumbai-03/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdff4e1-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-04', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/4/2', 'http://localhost:8888/mumbai-04/index.m3u8', 'http://localhost:8889/mumbai-04/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdff5db-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-05', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/5/2', 'http://localhost:8888/mumbai-05/index.m3u8', 'http://localhost:8889/mumbai-05/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdffaa0-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-06', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/6/2', 'http://localhost:8888/mumbai-06/index.m3u8', 'http://localhost:8889/mumbai-06/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdffbef-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-07', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/7/2', 'http://localhost:8888/mumbai-07/index.m3u8', 'http://localhost:8889/mumbai-07/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdffccb-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-08', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/8/2', 'http://localhost:8888/mumbai-08/index.m3u8', 'http://localhost:8889/mumbai-08/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL),
('8fdffd9d-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-09', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/9/2', 'http://localhost:8888/mumbai-09/index.m3u8', 'http://localhost:8889/mumbai-09/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL);
INSERT INTO `cameras` (`id`, `name`, `locationId`, `zone`, `ipAddress`, `rtspUrl`, `hlsUrl`, `whepUrl`, `codec`, `fps`, `resolution`, `bitrateKbps`, `packetLossPct`, `jitterMs`, `firmwareVersion`, `lastRebootAt`, `cameraType`, `vendor`, `installationDate`, `enabled`, `status`, `lastSeenAt`, `lastLatencyMs`, `signalStrength`) VALUES
('8fdffe71-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai-NVR-10', '8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Mumbai (NVR)', '10.227.96.70', 'rtsp://admin:EV2002%40123@10.227.96.70:554/10/2', 'http://localhost:8888/mumbai-10/index.m3u8', 'http://localhost:8889/mumbai-10/whep', 'H264', 25, '1920×1080', 2200, 0.70, 14, 'NVR-4.9.1', '2026-01-30 20:10:01', 'FIXED', 'NVR', '2026-01-29', 1, 'ONLINE', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `health_settings`
--

DROP TABLE IF EXISTS `health_settings`;
CREATE TABLE IF NOT EXISTS `health_settings` (
  `id` tinyint NOT NULL DEFAULT '1',
  `pingIntervalSeconds` int NOT NULL,
  `timeoutMs` int NOT NULL,
  `unstableThreshold` int NOT NULL,
  `offlineTimeoutSeconds` int NOT NULL,
  `latencyWarnMs` int NOT NULL,
  `autoRetryCount` int NOT NULL,
  `escalationMinutes` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `health_settings`
--

INSERT INTO `health_settings` (`id`, `pingIntervalSeconds`, `timeoutMs`, `unstableThreshold`, `offlineTimeoutSeconds`, `latencyWarnMs`, `autoRetryCount`, `escalationMinutes`) VALUES
(1, 5, 1200, 2, 20, 250, 2, 10);

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
CREATE TABLE IF NOT EXISTS `locations` (
  `id` char(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(64) NOT NULL,
  `region` varchar(128) DEFAULT NULL,
  `locationType` enum('PLANT','WAREHOUSE','OFFICE','SITE') DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `state` varchar(128) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT NULL,
  `primaryContactName` varchar(255) DEFAULT NULL,
  `primaryContactPhone` varchar(64) DEFAULT NULL,
  `slaPriority` enum('HIGH','MEDIUM','LOW') DEFAULT NULL,
  `notes` text,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `archivedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_code` (`code`),
  UNIQUE KEY `uq_location_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `code`, `region`, `locationType`, `city`, `state`, `timezone`, `primaryContactName`, `primaryContactPhone`, `slaPriority`, `notes`, `latitude`, `longitude`, `active`, `createdAt`, `archivedAt`, `deletedAt`) VALUES
('8f315838-fde9-11f0-bfe6-a0e70ba38af9', 'Plant A - Chennai', 'PLANT-A', 'South', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL),
('8f3bd0cc-fde9-11f0-bfe6-a0e70ba38af9', 'Warehouse B - Pune', 'WH-B', 'West', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL),
('8f423f2c-fde9-11f0-bfe6-a0e70ba38af9', 'Site C - Kolkata', 'SITE-C', 'East', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL),
('8f48ed34-fde9-11f0-bfe6-a0e70ba38af9', 'Kesanapalli', 'KESANAPALLI', 'South', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL),
('8f4fb185-fde9-11f0-bfe6-a0e70ba38af9', 'Location 5 - Vijayawada', 'VIJAYAWADA', 'South', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL),
('8f5625ea-fde9-11f0-bfe6-a0e70ba38af9', 'Location 6 - Mumbai', 'MUMBAI', 'West', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-30 20:10:01', NULL, NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
