from abc import ABC, abstractmethod
from .models import Users
from .database import Session


class AUserRepository(ABC):

    @abstractmethod
    def getUserByName(self, username: str) -> Users:
        pass

    @abstractmethod
    def doesUserExist(self, username: str) -> bool:
        pass


class UserRepository(AUserRepository):
    def getUserByName(self, username: str) -> Users:
        session = Session()
        return session.query(Users).filter(Users.username==username).one_or_none()

    def doesUserExist(self, username: str) -> bool:
        session = Session()
        q=session.query(Users).filter(Users.username==username)   
        exist = session.query(q.exists())
        result = session.execute(exist).scalar_one()
        
        return result
