from abc import ABC, abstractmethod
from .models import Submissions
from .database import Session
from sqlalchemy import desc


class ASubmissionRepository(ABC):

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


class SubmissionRepository(ASubmissionRepository):

    def getSubmissionByUserId(self, user_id: int) -> Submissions:
        session = Session()
        submission = session.query(Submissions).filter(Submissions.User == user_id).order_by(desc("Time")).first()

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
