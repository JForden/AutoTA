from abc import ABC, abstractmethod
from .models import Projects
from .database import Session
from sqlalchemy import desc
from datetime import datetime


class AProjectRepository(ABC):
    """[a class for abstract methods]
    """
    @abstractmethod
    def get_current_project(self) -> Projects:
        """[an abstract method]"""
        pass
    @abstractmethod
    def get_all_projects(self) -> Projects:
        """[an abstract method]"""
        pass
    @abstractmethod
    def get_selected_project(self, project_id: int) -> Projects:
        """[an abstract method]"""
        pass

class ProjectRepository(AProjectRepository):

    def get_current_project(self) -> Projects:
        """[Identifies the current project based on the start and end date]
        Returns:
            Project: [this should be the currently assigned project object]
        """
        now = datetime.now()
        session = Session()
        project = session.query(Projects).filter(Projects.End >= now, Projects.Start < now).first()
        session.close()
        return project        
    def get_all_projects(self) -> Projects:
        """[a method to get all the projects from the mySQL database]

        Returns:
            Projects: [a project object ]
        """
        session = Session()
        project = session.query(Projects).order_by(desc(Projects.Id)).all()
        session.close()
        return project
    def get_selected_project(self, project_id: int) -> Projects:
        """[summary]
        Args:
            project_id (int): [The Project ID]

        Returns:
            Project: [a project object]
        """
        session = Session()
        project= session.query(Projects).filter(Projects.Id == project_id).first()
        session.close()
        return project
