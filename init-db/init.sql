-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: autota
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ChatGPTFormSubmits`
--

DROP TABLE IF EXISTS `ChatGPTFormSubmits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatGPTFormSubmits` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Uid` int NOT NULL,
  `Qid` int DEFAULT NULL,
  `q1` varchar(45) DEFAULT NULL,
  `q2` varchar(45) DEFAULT NULL,
  `q3` varchar(100) DEFAULT NULL,
  `SubmitDate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `ChatLogs`
--

DROP TABLE IF EXISTS `ChatLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChatLogs` (
  `idChatLogs` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `ClassId` int DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `ResponseTo` int DEFAULT NULL,
  `UserPseudonym` varchar(100) DEFAULT NULL,
  `UserImage` varchar(1000) DEFAULT NULL,
  `Response` text,
  `Code` varchar(1000) DEFAULT NULL,
  `Language` varchar(45) DEFAULT NULL,
  `TimeSubmitted` datetime DEFAULT NULL,
  `MessageFlag` int DEFAULT NULL,
  `AcceptedFlag` int DEFAULT NULL,
  `Likes` int DEFAULT NULL,
  PRIMARY KEY (`idChatLogs`)
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
  `Tid` varchar(400) DEFAULT NULL,
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
  `submissionId` int DEFAULT NULL,
  `GPTResponse` varchar(10000) DEFAULT NULL,
  `StudentFeedback` int DEFAULT NULL,
  `Type` int DEFAULT NULL,
  PRIMARY KEY (`Qid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  KEY `fk_LoginAttempts_1_idx` (`Username`)
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
  `Name` varchar(1000) NOT NULL,
  `Start` datetime NOT NULL,
  `End` datetime NOT NULL,
  `Language` varchar(45) NOT NULL,
  `ClassId` int NOT NULL,
  `solutionpath` varchar(1000) DEFAULT NULL,
  `AsnDescriptionPath` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idProjects_UNIQUE` (`Id`),
  KEY `fk_Projects_1_idx` (`ClassId`),
  CONSTRAINT `fk_Projects_1` FOREIGN KEY (`ClassId`) REFERENCES `Classes` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Replies`
--

DROP TABLE IF EXISTS `Replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Replies` (
  `rid` int NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT NULL,
  `tid` int DEFAULT NULL,
  `reply` text,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SnippetRuns`
--

DROP TABLE IF EXISTS `SnippetRuns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SnippetRuns` (
  `idSnippetRuns` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `Code` text,
  `Language` varchar(45) DEFAULT NULL,
  `TestCaseInput` text,
  `Result` text,
  `TimeSubmitted` datetime DEFAULT NULL,
  PRIMARY KEY (`idSnippetRuns`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `StudentQuestionsCol` varchar(10000) DEFAULT NULL,
  `ruling` int DEFAULT NULL,
  `dismissed` int DEFAULT NULL,
  `StudentId` int DEFAULT NULL,
  `TimeSubmitted` datetime DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `TimeAccepted` datetime DEFAULT NULL,
  `TimeCompleted` datetime DEFAULT NULL,
  PRIMARY KEY (`Sqid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StudentSuggestions`
--

DROP TABLE IF EXISTS `StudentSuggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentSuggestions` (
  `idStudentSuggestions` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `StudentSuggestionscol` text,
  `TimeSubmitted` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idStudentSuggestions`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
-- Table structure for table `SubmissionChargeRedeptions`
--

DROP TABLE IF EXISTS `SubmissionChargeRedeptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SubmissionChargeRedeptions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `ClassId` int DEFAULT NULL,
  `ProjectId` int DEFAULT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `ClaimedTime` datetime DEFAULT NULL,
  `RedeemedTime` datetime DEFAULT NULL,
  `SubmissionId` int DEFAULT NULL,
  `Recouped` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SubmissionCharges`
--

DROP TABLE IF EXISTS `SubmissionCharges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SubmissionCharges` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `ClassId` int DEFAULT NULL,
  `BaseCharge` int DEFAULT NULL,
  `RewardCharge` int DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `External` int DEFAULT NULL,
  `visible` int DEFAULT NULL,
  `TestCaseResults` text,
  `LintingResults` text,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idSubmissions_UNIQUE` (`Id`),
  KEY `iduser_idx` (`User`),
  KEY `projectmap_idx` (`Project`),
  CONSTRAINT `iduser` FOREIGN KEY (`User`) REFERENCES `Users` (`Id`),
  CONSTRAINT `proect` FOREIGN KEY (`Project`) REFERENCES `Projects` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2507 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `additionalfilepath` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `tc_fk_idx` (`ProjectId`),
  KEY `tc_fk2_idx` (`LevelId`),
  CONSTRAINT `tc_fk` FOREIGN KEY (`ProjectId`) REFERENCES `Projects` (`Id`),
  CONSTRAINT `tc_fk2` FOREIGN KEY (`LevelId`) REFERENCES `Levels` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Threads`
--

DROP TABLE IF EXISTS `Threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Threads` (
  `Tid` int NOT NULL AUTO_INCREMENT,
  `ClassId` int DEFAULT NULL,
  `UserId` int DEFAULT NULL,
  `Created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Questions` varchar(255) DEFAULT NULL,
  `AcceptedFlag` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Tid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `anonymous_username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idusers_UNIQUE` (`Id`),
  UNIQUE KEY `username_UNIQUE` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=176 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This is a table to store website login''s and all users';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'autota'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11 13:13:47