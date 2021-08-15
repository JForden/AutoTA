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
    MaxNumberOfSubmissions = Column(Integer)
    Submissions=relationship('Submissions') 

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

class Submissions(db.Model):
    __tablename__ = "Submissions"
    Id = Column(Integer, primary_key=True, autoincrement=True)
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

class LoginAttempts(db.Model):
    __tablename__ = "LoginAttempts"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Time = Column(Date)
    IPAddress = Column(String)
    Username = Column(String, ForeignKey('Users.Username'))

class Classes(db.Model):
    __tablename__ = "Classes"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String)
    Labs=relationship('Labs')
    ClassAssignments=relationship('ClassAssignments')

class Labs(db.Model):
    __tablename__ = "Labs"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String)
    Class = Column(Integer, ForeignKey('Classes.Id'))
    ClassAssignments=relationship('ClassAssignments')

class ClassAssignments(db.Model):
    __tablename__ = "ClassAssignments"
    UserId = Column(Integer, ForeignKey('Users.Id'), primary_key=True)
    ClassId = Column(Integer, ForeignKey('Classes.Id'), primary_key=True)
    LabId = Column(Integer, ForeignKey('Labs.Id'))

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
    Id = Column(Integer, primary_key=True, autoincrement=True)
    ProjectId = Column(Integer, ForeignKey('Projects.Id'))
    Name=Column(String)
    Points=Column(Integer)