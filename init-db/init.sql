-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: autota
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `ChatGPTkeys`
--

DROP TABLE IF EXISTS `ChatGPTkeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatGPTkeys` (
  `idChatGPTkeys` int NOT NULL,
  `ChatGPTkeyscol` varchar(100) DEFAULT NULL,
  `LastUsed` datetime DEFAULT NULL,
  PRIMARY KEY (`idChatGPTkeys`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `Tid` varchar(45) DEFAULT NULL,
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
-- Table structure for table `GPTLogs`
--

DROP TABLE IF EXISTS `GPTLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GPTLogs` (
  `Qid` int NOT NULL AUTO_INCREMENT,
  `SubmissionId` int DEFAULT NULL,
  `GPTResponse` varchar(10000) DEFAULT NULL,
  `StudentFeedback` int DEFAULT NULL,
  `Type` int DEFAULT NULL,
  PRIMARY KEY (`Qid`),
  KEY `fk_gptkeys_1_idx` (`SubmissionId`),
  CONSTRAINT `fk_gptkeys_1` FOREIGN KEY (`SubmissionId`) REFERENCES `Submissions` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  PRIMARY KEY (`Id`)
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
  `solutionpath` varchar(200) DEFAULT NULL,
  `AsnDescriptionPath` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idProjects_UNIQUE` (`Id`),
  UNIQUE KEY `name_UNIQUE` (`Name`),
  KEY `fk_Projects_1_idx` (`ClassId`),
  CONSTRAINT `fk_Projects_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StudentGrades`
--

DROP TABLE IF EXISTS `StudentGrades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentGrades` (
  `Sid` int NOT NULL,
  `Pid` int NOT NULL,
  `Grade` int NOT NULL,
  PRIMARY KEY (`Sid`,`Pid`),
  KEY `fki_idx` (`Sid`),
  KEY `fk2_idx` (`Pid`),
  CONSTRAINT `fk2` FOREIGN KEY (`Pid`) REFERENCES `Projects` (`Id`),
  CONSTRAINT `fki` FOREIGN KEY (`Sid`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
-- Table structure for table `StudentQuestions`
--

DROP TABLE IF EXISTS `StudentQuestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentQuestions` (
  `Sqid` int NOT NULL AUTO_INCREMENT,
  `StudentQuestionscol` varchar(10000) DEFAULT NULL,
  `ruling` int DEFAULT '0',
  `dismissed` int DEFAULT '0',
  `StudentId` int DEFAULT NULL,
  `TimeSubmitted` datetime DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `TimeAccepted` datetime DEFAULT NULL,
  `TimeCompleted` datetime DEFAULT NULL,
  PRIMARY KEY (`Sqid`),
  KEY `fkSQ_idx` (`StudentId`),
  KEY `fkSQ1_idx` (`ProjectId`),
  CONSTRAINT `fkSQ` FOREIGN KEY (`StudentId`) REFERENCES `Users` (`Id`),
  CONSTRAINT `fkSQ1` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `visible` int DEFAULT NULL,
  `TestCaseResults` text,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idSubmissions_UNIQUE` (`Id`),
  KEY `iduser_idx` (`User`),
  KEY `projectmap_idx` (`Project`),
  CONSTRAINT `iduser` FOREIGN KEY (`User`) REFERENCES `Users` (`Id`),
  CONSTRAINT `proect` FOREIGN KEY (`Project`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2385 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Testcases`
--

DROP TABLE IF EXISTS `Testcases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Testcases` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProjectId` int DEFAULT NULL,
  `LevelId` int DEFAULT NULL,
  `Name` text,
  `Description` text,
  `input` text,
  `Output` text,
  `IsHidden` tinyint DEFAULT NULL,
  `additionalfilepath` text,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `tc_fk_idx` (`ProjectId`),
  KEY `tc_fk2_idx` (`LevelId`),
  CONSTRAINT `tc_fk` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`),
  CONSTRAINT `tc_fk2` FOREIGN KEY (`LevelId`) REFERENCES `Levels` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserCredentials`
--

DROP TABLE IF EXISTS `UserCredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserCredentials` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `UserName` text,
  `PasswordHash` binary(60) DEFAULT NULL,
  `Salt` binary(60) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ucredid_idx` (`UserId`),
  CONSTRAINT `ucredid` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Role` int NOT NULL,
  `Firstname` varchar(45) NOT NULL,
  `Lastname` varchar(45) NOT NULL,
  `Email` varchar(256) NOT NULL,
  `StudentNumber` varchar(45) NOT NULL,
  `IsLocked` tinyint(1) NOT NULL,
  `ResearchGroup` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idusers_UNIQUE` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This is a table to store website login''s and all users';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-16 10:27:57
