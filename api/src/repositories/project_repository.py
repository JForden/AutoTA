from abc import ABC, abstractmethod
from typing import Optional, Dict

from sqlalchemy.sql.expression import asc
from .models import Projects, Levels
from src.repositories.database import db
from sqlalchemy import desc
from datetime import datetime


class ProjectRepository():

    def get_current_project(self) -> Optional[Projects]:
        """[Identifies the current project based on the start and end date]
        Returns:
            Project: [this should be the currently assigned project object]
        """
        now = datetime.now()
        project = Projects.query.filter(Projects.End >= now, Projects.Start < now).first()
        return project

    def get_all_projects(self) -> Projects:
        """[a method to get all the projects from the mySQL database]

        Returns:
            Projects: [a project object ]
        """
        project = Projects.query.order_by(asc(Projects.End)).all()
        return project

    def get_selected_project(self, project_id: int) -> Projects:
        """[summary]
        Args:
            project_id (int): [The Project ID]

        Returns:
            Project: [a project object]
        """
        project= Projects.query.filter(Projects.Id == project_id).first()
        return project
    
    def get_levels(self, project_id: int) -> Dict[str, int]:
        levels = Levels.query.filter(Levels.ProjectId == project_id).all()
        level_score = {}
        for level in levels:
            level_score[level.Name] = level.Points

        return level_score

    def get_levels_by_project(self, project_id: int) -> Dict[str, int]:
        levels = Levels.query.filter(Levels.ProjectId == project_id).order_by(asc(Levels.Order)).all()

        return levels

    def create_project(self, name: str, start: datetime, end: datetime, language:str):    
        project = Projects(Name = name, Start = start, End = end, Language = language)
        db.session.add(project)
        db.session.commit()
    def get_project(self, project_id:int) -> Dict[str,int]:
        project_data = Projects.query.filter(Projects.Id == project_id).first()
        project_info={}
        project_info['name']=project_data.Name
        project_info['start_date']=project_data.Start.isoformat()
        project_info['end_date']=project_data.End.isoformat()
        project_info['language']=project_data.Language
        return project_info

    def edit_project(self, name: str, start: datetime, end: datetime, language:str, project_id:int):
        project = Projects.query.filter(Projects.Id == project_id).first()
        project.Name = name
        project.Start = start
        project.End = end
        project.Language = language
        db.session.commit()
