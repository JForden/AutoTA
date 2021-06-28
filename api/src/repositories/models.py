from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from sqlalchemy.types import Date
from .database import Base

class Projects(Base):
    __tablename__ = "Projects"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String)
    Start = Column(Date)
    End = Column(Date)
    Submissions=relationship('Submissions') 

class Users(Base):
    __tablename__ = "Users"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String)
    Role =Column(Integer)
    Submissions=relationship('Submissions')

class Submissions(Base):
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
    