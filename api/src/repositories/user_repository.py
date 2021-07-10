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
    def create_user(self, username: str, first_name: str, last_name: str, email: str, student_number: str, class_number: str, lab_number: str):
        pass

    @abstractmethod
    def get_user_status(self):
        pass
    @abstractmethod
    def get_all_users(self):
        pass


class UserRepository(AUserRepository):
    def getUserByName(self, username: str) -> Users:
        session = Session()
        user = session.query(Users).filter(Users.Username==username).one_or_none()
        session.close()
        return user

    def doesUserExist(self, username: str) -> bool:
        session = Session()
        query = session.query(Users).filter(Users.Username==username)   
        exist = session.query(query.exists())
        result = session.execute(exist).scalar_one()
        session.close()
        
        return result

    def create_user(self, username: str, first_name: str, last_name: str, email: str, student_number: str, class_number: str, lab_number: str):
        session = Session()
        user = Users(Username=username,Firstname=first_name,Lastname=last_name,Email=email,StudentNumber=student_number,ClassName=class_number,LabNumber=lab_number,Role = 0)
        session.add(user)
        session.commit()
        
    def get_user_status(self):
        return str(current_user.Role)

    def get_all_users(self):
        session = Session()
        user = session.query(Users).all()
        session.close()
        return user
        
