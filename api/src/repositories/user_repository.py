import datetime
from typing import Dict, List

from sqlalchemy import asc, desc

from src.repositories.database import db
from .models import ClassAssignments, LectureSections, Users, LoginAttempts, ChatGPTQuestions, ChatGPTFormSubmits, ChatGPTkeys
from flask_jwt_extended import current_user


class UserRepository():
    def getUserByName(self, username: str) -> Users:
        user = Users.query.filter(Users.Username==username).one_or_none()
        return user
    
    def get_user(self, user_id: int) -> Users:
        user = Users.query.filter(Users.Id == user_id).one_or_none()
        return user

    def get_user_by_id(self,user_id: int) -> str:
        user = Users.query.filter(Users.Id==user_id).one_or_none()
        return user.Username
    
    def get_user_by_studentid(self, student_id: int):
        user = Users.query.filter(Users.StudentNumber==student_id).one_or_none()
        return user.Username

    def doesUserExist(self, username: str) -> bool:
        user = Users.query.filter(Users.Username==username).first()
        
        return user is not None

    def create_user(self, username: str, first_name: str, last_name: str, email: str, student_number: str):
        user = Users(Username=username,Firstname=first_name,Lastname=last_name,Email=email,StudentNumber=student_number,Role = 0,IsLocked=False,ResearchGroup=0,ChatSubTime= datetime.datetime.now() - datetime.timedelta(hours=6))
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
        return str(research_group)
    def get_user_chatSubTime(self,userId) -> int:
        query = Users.query.filter(Users.Id==userId).one()
        user_time = query.ChatSubTime
        print("User time ", user_time, flush=True)
        return str(user_time)
    def set_user_chatSubTime(self,userId):
        query = Users.query.filter(Users.Id==userId).one()
        now = datetime.datetime.now() + datetime.timedelta(hours=0.1)
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        query.ChatSubTime=dt_string
        db.session.commit()
    def chat_question_logger(self,userId,message,response,passFlag):
        now = datetime.datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        submitquestion = ChatGPTQuestions(ChatGPTQuestionscol=message, ChatGPTResponse=response, Uid=userId, SubmitDate=dt_string, Passflag=passFlag)
        db.session.add(submitquestion)
        db.session.commit()
    def chat_form_logger(self,userId,q1,q2,q3):
        #get most recent question Qid from Questions
        query = ChatGPTQuestions.query.filter(ChatGPTQuestions.Uid==userId).order_by(desc(ChatGPTQuestions.SubmitDate)).first()
        now = datetime.datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        submitForm = ChatGPTFormSubmits(Uid=userId,Qid=query.Qid,q1=q1,q2=q2,q3=q3,SubmitDate=dt_string)
        db.session.add(submitForm)
        db.session.commit()
    def chatGPT_key(self):
        query = ChatGPTkeys.query.order_by(asc(ChatGPTkeys.LastUsed)).first()
        api_key = query.ChatGPTkeyscol
        print(api_key)
        now = datetime.datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        query.LastUsed =dt_string
        print(dt_string, flush=True)
        db.session.commit()
        return api_key
    def form_count(self,userId):
        query = ChatGPTFormSubmits.query.filter(ChatGPTFormSubmits.Uid==userId).count()
        return str(query)
    def gpt_submit_count(self,userId):
        query = ChatGPTQuestions.query.filter(ChatGPTQuestions.Uid==userId).count()
        return str(query)
    def get_missed_GPT_form(self,userId):
        query = ChatGPTQuestions.query.filter(ChatGPTQuestions.Uid==userId).order_by(desc(ChatGPTQuestions.Qid)).first()
        return([query.ChatGPTQuestionscol, query.ChatGPTResponse])




        



        
    