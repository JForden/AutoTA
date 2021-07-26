"""[setup variables for connecting to our mysql database]"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

USER_NAME = "root"
PASSWORD = "7.qetuoSFHK"
SERVICE = "@localhost"
PATH = "/autota"
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://"+USER_NAME+PASSWORD+SERVICE+PATH
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
Session = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base = declarative_base()
