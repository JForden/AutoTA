from abc import ABC, abstractmethod
from .models import Projects, Submissions
from .database import Session
from sqlalchemy import desc, and_
from datetime import datetime, timedelta


class AProjectRepository(ABC):

    @abstractmethod
    def get_current_project(self) -> Projects:
        pass


class ProjectRepository(AProjectRepository):

    def get_current_project(self) -> Projects:
        now = datetime.now()
        #dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        session = Session()
        project = session.query(Projects).filter(Projects.End >= now, Projects.Start < now).first()
        print(project)
        session.close()
        return project
