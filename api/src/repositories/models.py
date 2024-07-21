from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.types import Date

from src.repositories.database import db


class Projects(db.Model):
    __tablename__ = "Projects"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    ClassId = Column(Integer, ForeignKey('Classes.Id'))
    Name = Column(String)
    Start = Column(Date)
    End = Column(Date)
    Language = Column(String)

    Submissions=relationship('Submissions') 
    Levels=relationship('Levels')
    StudentProgress=relationship('StudentProgress')
    StudentUnlocks=relationship('StudentUnlocks') 
    solutionpath=Column(String)
    AsnDescriptionPath = Column(String)

class Users(db.Model):
    __tablename__ = "Users"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String)
    Firstname = Column(String)
    Lastname = Column(String)
    Email = Column(String)
    StudentNumber = Column(String)
    Role = Column(Integer)
    IsLocked = Column(Boolean)
    ResearchGroup = Column(Integer)
    Submissions=relationship('Submissions')
    ClassAssignments=relationship('ClassAssignments')
    LoginAttempts=relationship('LoginAttempts')
    StudentProgress=relationship('StudentProgress')
    StudentUnlocks=relationship('StudentUnlocks') 

class Submissions(db.Model):
    __tablename__ = "Submissions"
    Id = Column(Integer, primary_key=True)
    OutputFilepath = Column(String)
    PylintFilepath = Column(String)
    CodeFilepath = Column(String)
    IsPassing = Column(Boolean)
    NumberOfPylintErrors = Column(String)
    Time = Column(Date)
    User = Column(Integer, ForeignKey('Users.Id'))
    Project = Column(Integer, ForeignKey('Projects.Id'))
    SubmissionLevel =Column(String)
    Points = Column(Integer)
    StudentProgress=relationship('StudentProgress')
    visible = Column(Integer)
    TestCaseResults=Column(String)
    LintingResults=Column(String)

class LoginAttempts(db.Model):
    __tablename__ = "LoginAttempts"
    Id = Column(Integer, primary_key=True)
    Time = Column(Date)
    IPAddress = Column(String)
    Username = Column(String, ForeignKey('Users.Username'))

class Classes(db.Model):
    __tablename__ = "Classes"
    Id = Column(Integer, primary_key=True)
    Name = Column(String)
    Tid = Column(String)
    

class Labs(db.Model):
    __tablename__ = "Labs"
    Id = Column(Integer, primary_key=True)
    Name = Column(String)
    ClassId = Column(Integer, ForeignKey('Classes.Id'))
    ClassAssignments=relationship('ClassAssignments')

class LectureSections(db.Model):
    __tablename__ = "LectureSections"
    Id = Column(Integer, primary_key=True)
    Name = Column(String)
    ClassId = Column(Integer, ForeignKey('Classes.Id'), primary_key=True)
    ClassAssignments=relationship('ClassAssignments')

class ClassAssignments(db.Model):
    __tablename__ = "ClassAssignments"
    UserId = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    ClassId = Column(Integer, ForeignKey('Classes.Id'), primary_key=True)
    LabId = Column(Integer, ForeignKey('Labs.Id'))
    LectureId = Column(Integer, ForeignKey('LectureSections.Id'))

class StudentProgress(db.Model):
    __tablename__ = "StudentProgress"
    UserId = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'), primary_key=True)
    SubmissionId = Column(Integer, ForeignKey('Submissions.Id'), primary_key=True)
    LatestLevel = Column(String)

class StudentUnlocks(db.Model):
    __tablename__ = "StudentUnlocks"
    UserId = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'), primary_key=True)
    Time = Column(DateTime)

class Config(db.Model):
    __tablename__ = "Config"
    Name  = Column(String, primary_key=True)
    Value = Column(String)

class Levels(db.Model):
    __tablename__ = "Levels"
    Id = Column(Integer, primary_key=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'))
    Name=Column(String)
    Order=Column(Integer)
    Points=Column(Integer)

class Testcases(db.Model):
    __tablename__ = "Testcases"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'))
    LevelId = Column(Integer, ForeignKey("Levels.Id"))
    Name = Column(String)
    Description = Column(String)
    input = Column(String)
    Output = Column(String)
    IsHidden = Column(Boolean)
    additionalfilepath = Column(String)
class GPTLogs(db.Model):
    __tablename__ = "GPTLogs"
    Qid = Column(Integer, primary_key=True, autoincrement=True)
    SubmissionId = Column(Integer, ForeignKey('Submissions.Id'))
    GPTResponse = Column(String)
    StudentFeedback = Column(Integer)
    Type = Column(Integer)

class ChatGPTkeys(db.Model):
    __tablename__ = "ChatGPTkeys"
    idChatGPTkeys = Column(Integer, primary_key=True, autoincrement=True)
    ChatGPTkeyscol = Column(String)
    LastUsed = Column(DateTime)

class StudentQuestions(db.Model):
    __tablename__ = "StudentQuestions"
    Sqid = Column(Integer, primary_key=True, autoincrement=True)
    StudentQuestionscol = Column(String)
    ruling = Column(Integer)
    dismissed = Column(Integer)
    StudentId = Column(Integer, ForeignKey('Users.Id'))
    TimeSubmitted = Column(DateTime)
    projectId = Column(Integer, ForeignKey('Projects.Id'))
    TimeAccepted = Column(DateTime)
    TimeCompleted = Column(DateTime)

class StudentGrades(db.Model):
    __tablename__ = "StudentGrades"
    Sid = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    Pid = Column(Integer, ForeignKey('Projects.Id'), primary_key=True)
    Grade = Column(Integer)
class StudentSuggestions(db.Model):
    __tablename__ = "StudentSuggestions"
    idStudentSuggestions = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer)
    StudentSuggestionscol = Column(String)
    TimeSubmitted = Column(DateTime)
class SnippetRuns(db.Model):
    __tablename__ = "SnippetRuns"
    idSnippetRuns = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer)
    Code = Column(String)
    Language = Column(String)
    TestCaseInput = Column(String)
    Result = Column(DateTime)
    TimeSubmitted = Column(DateTime)
class ChatLogs(db.Model):
    __tablename__ = "ChatLogs"
    idChatLogs = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer)
    ClassId = Column(Integer)
    ResponseTo = Column(Integer)
    UserPseudonym = Column(String)
    UserImage = Column(String)
    Response = Column(String)
    Code = Column(String)
    Language = Column(String)
    TimeSubmitted = Column(DateTime)
    MessageFlag = Column(Integer)
    AcceptedFlag = Column(Integer)
    Likes=Column(Integer)
class SubmissionCharges(db.Model):
    __tablename__ = "SubmissionCharges"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer)
    ClassId = Column(Integer)
    BaseCharge = Column(Integer)
    RewardCharge = Column(Integer)
class SubmissionChargeRedeptions(db.Model):
    __tablename__ = "SubmissionChargeRedeptions"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer)
    ClassId = Column(Integer)
    projectId = Column(Integer)
    Type = Column(String)
    ClaimedTime = Column(DateTime)
    RedeemedTime = Column(DateTime)
    SubmissionId = Column(Integer)
    Recouped = Column(Integer)
