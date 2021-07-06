from abc import ABC, abstractmethod
from .models import Projects, Submissions
from .database import Session
from sqlalchemy import desc, and_
from datetime import datetime, timedelta


class AProjectRepository(ABC):

    @abstractmethod
    def get_current_project(self) -> Projects:
        pass
    @abstractmethod
    def get_all_projects(self) -> Projects:
        pass
    @abstractmethod
    def get_selected_project(self) -> Projects:
        pass


class ProjectRepository(AProjectRepository):

    def get_current_project(self) -> Projects:
        now = datetime.now()
        session = Session()
        project = session.query(Projects).filter(Projects.End >= now, Projects.Start < now).first()
        session.close()
        return project
        
    def get_all_projects(self) -> Projects:
        session = Session()
        project = session.query(Projects).order_by(desc(Projects.Id)).all()
        session.close()
        return project
        
    def get_selected_project(self,project_id: int) -> Projects:
        session = Session()
        project= session.query(Projects).filter(Projects.Id == project_id).first()
        session.close()
        return project


