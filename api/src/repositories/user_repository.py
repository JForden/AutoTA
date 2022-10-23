import datetime
from typing import Dict, List

from src.repositories.database import db
from .models import ClassAssignments, LectureSections, Users, LoginAttempts
from flask_jwt_extended import current_user


class UserRepository():
    def getUserByName(self, username: str) -> Users:
        user = Users.query.filter(Users.Username==username).one_or_none()
        return user
    def get_user_by_id(self,user_id: int) -> int:
        user = Users.query.filter(Users.Id==user_id).one_or_none()
        return user.Username

    def doesUserExist(self, username: str) -> bool:
        user = Users.query.filter(Users.Username==username).first()
        
        return user is not None

    def create_user(self, username: str, first_name: str, last_name: str, email: str, student_number: str):
        user = Users(Username=username,Firstname=first_name,Lastname=last_name,Email=email,StudentNumber=student_number,Role = 0,IsLocked=False,ResearchGroup=0)
        db.session.add(user)
        db.session.commit()
        
    def get_user_status(self) -> str:
        return str(current_user.Role)

    def get_all_users(self) -> List[Users]:
        user = Users.query.all()
        return user

    def send_attempt_data(self, username: str, ipadr: str, time: datetime):
        login_attempt = LoginAttempts(IPAddress=ipadr, Username=username, Time=time)
        db.session.add(login_attempt)
        db.session.commit()

    def can_user_login(self, username: str) -> int:
        number = LoginAttempts.query.filter(LoginAttempts.Username == username).count()
        return number
        
    def clear_failed_attempts(self, username: str):
        attempts = LoginAttempts.query.filter(LoginAttempts.Username == username).all()
        for attempt in attempts:
            db.session.delete(attempt)
        db.session.commit()

    def lock_user_account(self, username: str):
        query = Users.query.filter(Users.Username==username).one()
        query.IsLocked=True
        db.session.commit()
    
    def get_user_lectures(self, userIds: List[int]) -> Dict[int, ClassAssignments]:
        class_assignments = ClassAssignments.query.filter(ClassAssignments.UserId.in_(userIds)).all()
        
        user_lectures_dict={}
        for class_assignment in class_assignments:
            user_lectures_dict[class_assignment.UserId] = LectureSections.query.filter(LectureSections.Id == class_assignment.LectureId).one().Name

        return user_lectures_dict
        
    def get_user_email(self, userId) -> str:
        query = Users.query.filter(Users.Id==userId).one()
        email = query.Email
        return email
    def get_user_researchgroup(self,userId) -> int:
        query = Users.query.filter(Users.Id==userId).one()
        research_group = query.ResearchGroup
        return research_group


        
    