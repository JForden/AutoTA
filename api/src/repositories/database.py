"""[setup variables for connecting to our mysql database]"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#mysql+pymysql://dbmasteruser:pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^@ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com/autota
USER_NAME = "dbmasteruser"
PASSWORD = ":pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^"
SERVICE = "@ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com"
PATH = "/autota"
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://"+USER_NAME+PASSWORD+SERVICE+PATH
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
Session = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base = declarative_base()
