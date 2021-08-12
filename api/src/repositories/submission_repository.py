from abc import ABC, abstractmethod
from .models import StudentUnlocks, Submissions, Projects, StudentProgress, Users
from .database import Session
from sqlalchemy import desc, and_
from typing import Dict, List, Tuple
from src.repositories.config_repository import AConfigRepository


class ASubmissionRepository(ABC):

    @abstractmethod
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int, level: str, points: int):
        pass
    @abstractmethod
    def get_submission_by_user_id(self, user_id: int) -> Submissions:
        pass
    @abstractmethod
    def get_submission_by_submission_id(self, submission_id: int) -> Submissions:
        pass
    @abstractmethod
    def get_pylint_path_by_user_id(self, user_id: int) -> str:
        pass
    @abstractmethod
    def get_json_path_by_user_id(self, user_id: int) -> str:
        pass
    @abstractmethod
    def get_json_path_by_submission_id(self, submission_id: int) -> str:
        pass
    @abstractmethod
    def get_pylint_path_by_submission_id(self, submission_id: int) -> str:
        pass
    @abstractmethod
    def get_code_path_by_submission_id(self, submission_id: int) -> str:
        pass
    @abstractmethod
    def get_code_path_by_user_id(self, user_id: int) -> str:
        pass
    @abstractmethod
    def get_submissions_remaining(self, user_id: int, project_id: int) -> int:
        pass
    @abstractmethod
    def get_total_submission_for_all_projects(self) -> Dict[int, int]:
        pass
    @abstractmethod
    def get_most_recent_submission_by_project(self, project_id: int, user_ids: List[int]) -> Dict[int, Submissions]:
        pass
    @abstractmethod
    def get_current_level(self,project_id: int, user_ids: int ) -> str:
        pass
    @abstractmethod
    def modifying_level(self, project_id: int, user_id: int, submission_id: str, current_level: str) -> bool:
        pass
    @abstractmethod
    def get_project_by_submission_id(self,submission_id: int) -> int:
        pass
    @abstractmethod
    def get_can_redeemed(self, Config_Repository: AConfigRepository,  user_id: int, previous_project_id: int, project_id: int) -> Tuple[bool, int]:
        pass
    @abstractmethod
    def get_score(self,submission_id:int)->int:
        pass

class SubmissionRepository(ASubmissionRepository):

    def get_submission_by_user_id(self, user_id: int) -> Submissions:
        session = Session()
        submission = session.query(Submissions).filter(Submissions.User == user_id).order_by(desc("Time")).first()
        session.close()
        return submission

    def get_submission_by_submission_id(self, submission_id: int) -> Submissions:
        session = Session()
        submission = session.query(Submissions).filter(Submissions.Id == submission_id).order_by(desc("Time")).first()
        session.close()
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
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool, errorcount: int, level: str, points: int):
        session = Session()
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount,SubmissionLevel=level,Points=points)
        session.add(submission)
        session.commit()

    def get_submissions_remaining(self, user_id: int, project_id: int) -> int:
        session = Session()
        count = session.query(Submissions).filter(and_(Submissions.User == user_id, Submissions.Project == project_id)).count()
        session.close()
        return count

    def get_total_submission_for_all_projects(self) -> Dict[int, int]:
        session = Session()
        thisdic={}
        project_ids = session.query(Projects.Id).all()
        for proj in project_ids:
            count = session.query(Submissions.User).filter(Submissions.Project == proj[0]).distinct().count()
            thisdic[proj[0]]=count
        session.close()
        return thisdic

    def get_most_recent_submission_by_project(self, project_id: int, user_ids: List[int]) -> Dict[int, Submissions]:
        session = Session()
        holder = session.query(Submissions).filter(and_(Submissions.Project == project_id, Submissions.User.in_(user_ids))).order_by(desc(Submissions.Time)).all()
        session.close()
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
        session = Session()
        highest_level = session.query(StudentProgress).filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_ids)).first()
        session.close()
        if highest_level == None:
            return ""
        return highest_level.LatestLevel

    def modifying_level(self, project_id: int, user_id: int, submission_id: str, current_level: str) -> bool:
        session = Session()
        if current_level == "":
            Level_submission = StudentProgress(UserId=user_id,ProjectId=project_id,SubmissionId=submission_id,LatestLevel="Level 1")
            session.add(Level_submission)
            session.commit()
            return True
        level = session.query(StudentProgress).filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_id)).first()
        level.LatestLevel = current_level
        level.SubmissionId = submission_id
        session.commit()
        return True

    def get_project_by_submission_id(self,submission_id: int) -> int:
        session =Session()
        submission = session.query(Submissions).filter(Submissions.Id == submission_id).first()
        project_id = submission.Project
        return project_id

    def get_can_redeemed(self, Config_Repository: AConfigRepository,  user_id: int, previous_project_id: int, project_id: int) -> Tuple[bool, int]:
        if previous_project_id == -1:
            return (False, 0)
        
        session = Session()
        submission = self.get_most_recent_submission_by_project(previous_project_id,[user_id])
        points=submission[user_id].Points

        unlocked=session.query(StudentUnlocks).filter(and_(Projects.Id == project_id, Users.Id == user_id)).first()
        if not unlocked == None:
            return (False,points)
        
        #TODO: Get points from submission object
        RedeemNumber=int(Config_Repository.get_config_setting("RedeemValue"))
        if points < RedeemNumber:
            return (False, points)
        return (True,points)
    
    def redeem_points(self,user_id: int, project_id: int,dt_string:str) -> bool:
        session=Session()
        entry = StudentUnlocks(UserId=user_id,ProjectId=project_id,Time=dt_string)
        session.add(entry)
        session.commit()
        return True

    def get_score(self,submission_id:int)->int:
        session=Session()
        submission = session.query(Submissions).filter(Submissions.Id==submission_id).one()
        return submission.Points

    def submission_view_verification(self, submission_id, user_id) -> bool:
        
        session=Session()
        submission = session.query(Submissions).filter(and_(Submissions.Id==submission_id,Submissions.User==user_id)).first()
        return submission != None