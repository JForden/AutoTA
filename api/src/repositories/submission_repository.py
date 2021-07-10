from abc import ABC, abstractmethod
from .models import Submissions, Projects
from .database import Session
from sqlalchemy import desc, and_
from typing import Dict, List


class ASubmissionRepository(ABC):

    @abstractmethod
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int):
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
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool,errorcount: int ):
        session = Session()
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount)
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
        print(holder)
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
   