from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.types import Date

from src.repositories.database import db


class Projects(db.Model):
    __tablename__ = "Projects"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String)
    Start = Column(Date)
    End = Column(Date)
    Language = Column(String)

    Submissions=relationship('Submissions') 
    Levels=relationship('Levels')
    StudentProgress=relationship('StudentProgress')
    StudentUnlocks=relationship('StudentUnlocks') 

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
    Labs=relationship('Labs')
    LectureSections=relationship('LectureSections')
    ClassAssignments=relationship('ClassAssignments')

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

class TeacherClassAssignments(db.Model):
    __tablename__ = "TeacherClassAssignments"
    UserId = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    ClassId = Column(Integer, ForeignKey('Classes.Id'), primary_key=True)
    LectureId=Column(Integer, ForeignKey('LectureSections.Id'),primary_key=True)

    Classes=relationship('Classes')

class LectureSectionSettings(db.Model):
    __tablename__ = "LectureSectionSettings"
    LectureSectionId = Column(Integer, ForeignKey('LectureSections.Id'), primary_key=True)
    HasUnlockEnabled = Column(Boolean)
    HasScoreEnabled = Column(Boolean)
    HasTBSEnabled = Column(Boolean)
    HasLVLSYSEnabled = Column(Boolean)

class Testcases(db.Model):
    __tablename__ = "Testcases"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'))
    LevelId = Column(Integer, ForeignKey("Levels.Id"))
    Name = Column(String)
    Description = Column(String)
    Input = Column(String)
    Output = Column(String)
    IsHidden = Column(Boolean)