from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://dbmasteruser:pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^@ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com/autota"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#connection = "mysql+pymysql://{0}:{1}@{2}/{3}".format("dbmasteruser","pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^","ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com","autota")

Session = sessionmaker(autocommit=False,autoflush=False,bind=engine)

Base = declarative_base()