CREATE DATABASE  IF NOT EXISTS `autota` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `autota`;
-- MySQL dump 10.13  Distrib 8.0.31, for Linux (x86_64)
--
-- ------------------------------------------------------
-- Server version	8.0.31-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ClassAssignments`
--

DROP TABLE IF EXISTS `ClassAssignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ClassAssignments` (
  `UserId` int NOT NULL,
  `ClassId` int NOT NULL,
  `LabId` int NOT NULL,
  `LectureId` int NOT NULL,
  PRIMARY KEY (`UserId`,`ClassId`),
  KEY `fk_ClassAssignments_1_idx` (`ClassId`),
  KEY `fk_ClassAssignments_4_idx` (`LectureId`),
  KEY `fk_ClassAssignments_2_idx` (`LabId`),
  CONSTRAINT `fk_ClassAssignments_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`),
  CONSTRAINT `fk_ClassAssignments_2` FOREIGN KEY (`LabId`) REFERENCES `Labs` (`Id`),
  CONSTRAINT `fk_ClassAssignments_3` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `fk_ClassAssignments_4` FOREIGN KEY (`LectureId`) REFERENCES `LectureSections` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Classes`
--

DROP TABLE IF EXISTS `Classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Classes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Config`
--

DROP TABLE IF EXISTS `Config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Config` (
  `Name` varchar(256) NOT NULL,
  `Value` varchar(256) NOT NULL,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Labs`
--

DROP TABLE IF EXISTS `Labs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Labs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `ClassId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_Labs_1_idx` (`ClassId`),
  CONSTRAINT `fk_Labs_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LectureSections`
--

DROP TABLE IF EXISTS `LectureSections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LectureSections` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `ClassId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_LectureSections_1_idx` (`ClassId`),
  CONSTRAINT `fk_LectureSections_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Levels`
--

DROP TABLE IF EXISTS `Levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Levels` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProjectId` int NOT NULL,
  `Name` varchar(45) NOT NULL,
  `Points` int NOT NULL,
  `Order` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_Levels_1_idx` (`ProjectId`),
  CONSTRAINT `fk_Levels_1` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LoginAttempts`
--

DROP TABLE IF EXISTS `LoginAttempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LoginAttempts` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Time` datetime NOT NULL,
  `IPAddress` varchar(39) NOT NULL,
  `Username` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `fk_LoginAttempts_1_idx` (`Username`),
  CONSTRAINT `fk_LoginAttempts` FOREIGN KEY (`Username`) REFERENCES `Users` (`Username`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Projects`
--

DROP TABLE IF EXISTS `Projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Projects` (
  `Id` int NOT NULL AUTO_INCREMENT COMMENT 'Table to keep track of projects',
  `Name` varchar(45) NOT NULL,
  `Start` datetime NOT NULL,
  `End` datetime NOT NULL,
  `Language` varchar(45) NOT NULL,
  `ClassId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idProjects_UNIQUE` (`Id`),
  UNIQUE KEY `name_UNIQUE` (`Name`),
  UNIQUE KEY `Start_UNIQUE` (`Start`),
  UNIQUE KEY `End_UNIQUE` (`End`),
  KEY `fk_Projects_1_idx` (`ClassId`),
  CONSTRAINT `fk_Projects_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StudentProgress`
--

DROP TABLE IF EXISTS `StudentProgress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentProgress` (
  `SubmissionId` int NOT NULL,
  `LatestLevel` varchar(45) NOT NULL,
  `UserId` int NOT NULL,
  `ProjectId` int NOT NULL,
  PRIMARY KEY (`ProjectId`,`UserId`),
  KEY `fk_StudentProgress_1_idx` (`UserId`),
  KEY `fk_StudentProgress_3_idx` (`SubmissionId`),
  CONSTRAINT `fk_StudentProgress_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `fk_StudentProgress_2` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`),
  CONSTRAINT `fk_StudentProgress_3` FOREIGN KEY (`SubmissionId`) REFERENCES `Submissions` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StudentUnlocks`
--

DROP TABLE IF EXISTS `StudentUnlocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentUnlocks` (
  `UserId` int NOT NULL,
  `ProjectId` int NOT NULL,
  `Time` datetime NOT NULL,
  PRIMARY KEY (`UserId`,`ProjectId`),
  KEY `fk_StudentUnlocks_2_idx` (`ProjectId`),
  CONSTRAINT `fk_StudentUnlocks_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `fk_StudentUnlocks_2` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Submissions`
--

DROP TABLE IF EXISTS `Submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Submissions` (
  `Id` int NOT NULL AUTO_INCREMENT COMMENT 'Table to keep track of submissions from users',
  `User` int NOT NULL,
  `Time` datetime NOT NULL,
  `OutputFilepath` varchar(256) NOT NULL,
  `Project` int NOT NULL,
  `PylintFilepath` varchar(256) NOT NULL,
  `CodeFilepath` varchar(256) NOT NULL,
  `NumberOfPylintErrors` int NOT NULL,
  `IsPassing` tinyint(1) NOT NULL,
  `SubmissionLevel` varchar(45) NOT NULL,
  `Points` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idSubmissions_UNIQUE` (`Id`),
  UNIQUE KEY `Filepath_UNIQUE` (`OutputFilepath`),
  UNIQUE KEY `PylintFilepath_UNIQUE` (`PylintFilepath`),
  KEY `iduser_idx` (`User`),
  KEY `projectmap_idx` (`Project`),
  CONSTRAINT `iduser` FOREIGN KEY (`User`) REFERENCES `Users` (`Id`),
  CONSTRAINT `proect` FOREIGN KEY (`Project`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(45) NOT NULL,
  `Role` int NOT NULL,
  `Firstname` varchar(45) NOT NULL,
  `Lastname` varchar(45) NOT NULL,
  `Email` varchar(256) NOT NULL,
  `StudentNumber` varchar(45) NOT NULL,
  `IsLocked` tinyint(1) NOT NULL,
  `ResearchGroup` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idusers_UNIQUE` (`Id`),
  UNIQUE KEY `username_UNIQUE` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This is a table to store website login''s and all users';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-08 13:01:29
