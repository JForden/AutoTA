import openai
from src.repositories.project_repository import ProjectRepository
from src.repositories.database import db
from .models import StudentUnlocks, Submissions, Projects, StudentProgress, Users
from sqlalchemy import desc, and_
from typing import Dict, List, Tuple
from src.repositories.config_repository import ConfigRepository
from datetime import datetime

class SubmissionRepository():
    def get_submission_by_user_id(self, user_id: int) -> Submissions:
        submission = Submissions.query.filter(Submissions.User == user_id).order_by(desc("Time")).first()
        return submission

    def get_submission_by_submission_id(self, submission_id: int) -> Submissions:
        submission = Submissions.query.filter(Submissions.Id == submission_id).order_by(desc("Time")).first()
        return submission

    def get_json_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.OutputFilepath

    def get_pylint_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.PylintFilepath    

    def get_code_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.CodeFilepath

    def get_pylint_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.PylintFilepath

    def get_json_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.OutputFilepath

    def get_code_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.CodeFilepath
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool, errorcount: int, level: str, score: int):
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount,SubmissionLevel=level,Points=score)
        db.session.add(submission)
        db.session.commit()

    def get_total_submission_for_all_projects(self) -> Dict[int, int]:
        thisdic={}
        project_ids = Projects.query.with_entities(Projects.Id).all()
        for proj in project_ids:
            count = Submissions.query.with_entities(Submissions.User).filter(Submissions.Project == proj[0]).distinct().count()
            thisdic[proj[0]]=count
        return thisdic

    def get_most_recent_submission_by_project(self, project_id: int, user_ids: List[int]) -> Dict[int, Submissions]:
        holder = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User.in_(user_ids))).order_by(desc(Submissions.Time)).all()
        bucket={}
        for obj in holder:
            if obj.User in bucket:
                if bucket[obj.User].Time < obj.Time:
                    bucket[obj.User] = obj
                else:
                    pass
            else:
                bucket[obj.User] = obj
        return bucket
        

    def get_current_level(self,project_id: int, user_ids: int ) -> str:
        highest_level = StudentProgress.query.filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_ids)).first()
        if highest_level == None:
            return ""
        return highest_level.LatestLevel

    def modifying_level(self, project_id: int, user_id: int, submission_id: str, current_level: str) -> bool:
        level = StudentProgress.query.filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_id)).first()

        if level == None:
            Level_submission = StudentProgress(UserId=user_id,ProjectId=project_id,SubmissionId=submission_id,LatestLevel=current_level)
            db.session.add(Level_submission)
            db.session.commit()
            return True

        level.LatestLevel = current_level
        level.SubmissionId = submission_id
        db.session.commit()
        return True

    def get_project_by_submission_id(self,submission_id: int) -> int:
        submission = Submissions.query.filter(Submissions.Id == submission_id).first()
        return submission.Project

    def get_can_redeemed(self, Config_Repository: ConfigRepository,  user_id: int, previous_project_id: int, project_id: int) -> Tuple[bool, int]:
        if previous_project_id == -1:
            return (False, 0)
        
        submission = self.get_most_recent_submission_by_project(previous_project_id,[user_id])
        if user_id in submission:
            score=submission[user_id].Points
        else:
            score=0

        unlocked=StudentUnlocks.query.filter(and_(StudentUnlocks.ProjectId == project_id, StudentUnlocks.UserId == user_id)).first()
        if not unlocked == None:
            return (False,score)
        
        RedeemNumber=int(Config_Repository.get_config_setting("RedeemValue"))
        if score < RedeemNumber:
            return (False, score)
        return (True,score)
    
    def redeem_score(self,user_id: int, project_id: int,dt_string:str) -> bool:
        entry = StudentUnlocks(UserId=user_id,ProjectId=project_id,Time=dt_string)
        db.session.add(entry)
        db.session.commit()
        return True

    def get_score(self,submission_id:int)->int:
        submission = Submissions.query.filter(Submissions.Id==submission_id).one()
        return submission.Points

    def submission_view_verification(self, submission_id, user_id) -> bool:
        submission = Submissions.query.filter(and_(Submissions.Id==submission_id,Submissions.User==user_id)).first()
        return submission is not None
        
    def unlock_check(self, user_id,project_id) -> bool:
        unlocked_info = StudentUnlocks.query.filter(and_(StudentUnlocks.ProjectId==project_id,StudentUnlocks.UserId==user_id)).first()
        current_day=datetime.today().strftime('%A')
        #TODO: Make this not hardcoded for 2.0
        return (current_day == "Wednesday" and unlocked_info != None)
        
    def submission_counter(self, project_id: int, user_ids: List[int]) -> bool:
        submissions = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User.in_(user_ids))).all()
        submission_counter_dict={}
        for sub in submissions:
            if sub.User in submission_counter_dict:
                submission_counter_dict[sub.User] = submission_counter_dict[sub.User] +1
            else:
                submission_counter_dict[sub.User] = 1
        return submission_counter_dict

    def chatGPT_caller(self, student_code, student_question) -> str:
        #Jakes api key do not steal
        openai.api_key = ""

        #https://beta.openai.com/docs/models
        model_engine = "text-davinci-003" #newest model

        # Set the prompt
        assignment_prompt = student_code + "Here is my question: "+ student_question + "  NOTE: 1 ) If the question does not relate to the code, state that and reply with [does not relate]  2) DO NOT GIVE ME CODE, PROVIDE NUMERICAL SUGGESTIONS THAT WOULD BE HELPFUL TO A NOVICE PROGRAMMER DO NOT PROVIDE ME ANY EXAMPLE CODE"

        #print(assignment_prompt)
        # Use the completions endpoint to generate text
        completions = openai.Completion.create(
            engine=model_engine,
            prompt=assignment_prompt,
            max_tokens=1024,
            n=1,
            stop=None,
            temperature=0.5,
        )

        # Get the first completion from the response
        message = completions.choices[0].text

        if "not relate" in message:
            message="This question does not relate to the given code, if you believe this response was thrown in error, please note that in the form. We are working to improve TA-BOT, thank you for your understanding"
        if "GPT" in message or "chatGPT" in message or "chatgpt" in message or "openai" in message or "AI" in message or "ai" in message:
            message="This question does not relate to the given code, if you believe this response was thrown in error, please note that in the form. We are working to improve TA-BOT, thank you for your understanding"

        return message

