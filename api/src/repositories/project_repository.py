from abc import ABC, abstractmethod
from typing import Optional, Dict

from sqlalchemy.sql.expression import asc
from .models import Projects, Levels, Testcases
from src.repositories.database import db
from sqlalchemy import desc, and_
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


    def get_project_by_class_id(self,class_id: int) -> int:
        project_id = Projects.query.filter(Projects.ClassId==class_id).first()
        return project_id.Id
    
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
        
    def get_testcases(self, project_id:int) -> Dict[str,str]:
        testcases = Testcases.query.filter(Testcases.ProjectId == project_id).all()
        testcase_info = {}
        for test in testcases:
            testcase_data=[]
            testcase_data.append(test.LevelId)
            testcase_data.append(test.Name)
            testcase_data.append(test.Description)
            testcase_data.append(test.Input)
            testcase_data.append(test.Output)
            testcase_data.append(test.IsHidden)
            testcase_info[test.Id] = testcase_data
        return testcase_info
    
    def add_or_update_testcase(self, project_id:int, testcase_id:int, level_name:str, name:str, description:str, input_data:str, output:str, is_hidden:bool):
        #TODO: run grading script and generate output for the testcases.
        print("This is the testcase id: ",testcase_id)
        testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
        if testcase is None:
            print(project_id)
            print(level_name)
            level = Levels.query.filter(and_(Levels.ProjectId==project_id, Levels.Name==level_name)).first()
            print(level.Id)
            level_id = level.Id 
            testcase = Testcases(ProjectId = project_id, LevelId = level_id, Name = name, Description = description, Input = input_data, Output = output, IsHidden = is_hidden)
            db.session.add(testcase)
            db.session.commit()
        else:
            level = Levels.query.filter(and_(Levels.ProjectId==project_id, Levels.Name==level_name)).first()
            print(level.Id)
            level_id = level.Id 
            testcase.projectid=project_id
            testcase.LevelId = level_id
            testcase.Name = name
            testcase.Description = description
            testcase.Input = input_data
            testcase.Output = output
            testcase.IsHidden = is_hidden
            db.session.commit()

    def remove_testcase(self, testcase_id:int):
        testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
        db.session.delete(testcase)
        db.session.commit()





