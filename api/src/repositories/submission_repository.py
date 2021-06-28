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
    def getSubmissionByUserId(self, user_id: int) -> Submissions:
        pass

    @abstractmethod
    def getPylintPathByUserId(self, user_id: int) -> str:
        pass

    @abstractmethod
    def getJsonPathByUserId(self, user_id: int) -> str:
        pass

    @abstractmethod
    def getCodePathByUserId(self, user_id: int) -> str:
        pass

    @abstractmethod
    def getSubmissionsRemaining(self, user_id: int) -> int:
        pass

    @abstractmethod
    def getTotalSubmissionsForAllProjects(self) -> Dict[int, int]:
        pass
    
   


class SubmissionRepository(ASubmissionRepository):

    def getSubmissionByUserId(self, user_id: int) -> Submissions:
        session = Session()
        submission = session.query(Submissions).filter(Submissions.User == user_id).order_by(desc("Time")).first()
        session.close()
        return submission

    def getPylintPathByUserId(self, user_id: int) -> str:
        submission = self.getSubmissionByUserId(user_id)
        return submission.PylintFilepath

    def getJsonPathByUserId(self, user_id: int) -> str:
        submission = self.getSubmissionByUserId(user_id)
        return submission.OutputFilepath

    def getCodePathByUserId(self, user_id: int) -> str:
        submission = self.getSubmissionByUserId(user_id)
        return submission.CodeFilepath
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool,errorcount: int ):
        session = Session()
        # TODO: Get current project from table
        c1 = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount)
        session.add(c1)
        session.commit()

    def getSubmissionsRemaining(self, user_id: int, project_id: int) -> int:
        session = Session()
        count = session.query(Submissions).filter(and_(Submissions.User == user_id, Submissions.Project == project_id)).count()
        session.close()
        return count

    def getTotalSubmissionsForAllProjects(self) -> Dict[int, int]:
        session = Session()
        thisdic={}
        project_ids = session.query(Projects.Id).all()
        for proj in project_ids:
            count = session.query(Submissions.User).filter(Submissions.Project == proj[0]).distinct().count()
            thisdic[proj[0]]=count
        session.close()
        return thisdic


