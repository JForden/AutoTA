from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from sqlalchemy.types import Date
from database import Base

class Projects(Base):
    __tablename__ = "Projects"
    idProjects = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    submissions=relationship('Submissions') 

class Users(Base):
    __tablename__ = "users"
    idUsers = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String)
    submissions=relationship('Submissions')

class Submissions(Base):
    __tablename__ = "Submissions"
    idSubmissions = Column(Integer, primary_key=True, autoincrement=True)
    FilePath = Column(String)
    Time = Column(Date)
    User = Column(Integer, ForeignKey('users.idUsers'))
    project= Column(Integer, ForeignKey('Projects.idProjects'))