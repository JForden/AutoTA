from abc import ABC, abstractmethod
from .models import Users
from .database import Session
from flask_jwt_extended import current_user


class AUserRepository(ABC):

    @abstractmethod
    def getUserByName(self, username: str) -> Users:
        pass

    @abstractmethod
    def doesUserExist(self, username: str) -> bool:
        pass

    @abstractmethod
    def create_user(self, username: str):
        pass
    @abstractmethod
    def get_user_status():
        pass


class UserRepository(AUserRepository):
    def getUserByName(self, username: str) -> Users:
        session = Session()
        user = session.query(Users).filter(Users.Username==username).one_or_none()
        session.close()
        return user

    def doesUserExist(self, username: str) -> bool:
        session = Session()
        q=session.query(Users).filter(Users.Username==username)   
        exist = session.query(q.exists())
        result = session.execute(exist).scalar_one()
        session.close()
        
        return result

    def create_user(self, username: str):
        session = Session()
        c1 = Users(Username=username)
        session.add(c1)
        session.commit()
        
    def get_user_status(self):
        return str(current_user.Role)
