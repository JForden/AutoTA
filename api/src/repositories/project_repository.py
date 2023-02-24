from abc import ABC, abstractmethod
from typing import Optional, Dict

from sqlalchemy.sql.expression import asc
from .models import Projects, Levels, Testcases
from src.repositories.database import db
from sqlalchemy import desc, and_
from datetime import datetime
from pyston import PystonClient,File
import asyncio
import json

async def runner(filepath,input, language):
        #TODO, Rewrite to call local TA-BOT
        with open(filepath) as f:
            file = File(f)
            client = PystonClient()
            output = await client.execute(language,[file],"*",input)
        return output



class ProjectRepository():

    def get_current_project(self) -> Optional[Projects]:
        """[Identifies the current project based on the start and end date]
        Returns:
            Project: [this should be the currently assigned project object]
        """
        now = datetime.now()
        project = Projects.query.filter(Projects.End >= now, Projects.Start < now).first()
        return project

    def get_current_project_by_class(self, class_id: int) -> Optional[Projects]:
        """[Identifies the current project based on the start and end date]
        Returns:
            Project: [this should be the currently assigned project object]
        """
        now = datetime.now()
        project = Projects.query.filter(Projects.ClassId==class_id,Projects.End >= now, Projects.Start < now).first()
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


    def get_projects_by_class_id(self,class_id: int) -> int:
        temp = Projects.query.filter(Projects.ClassId==class_id)
        return temp
    
    def get_levels(self, project_id: int) -> Dict[str, int]:
        levels = Levels.query.filter(Levels.ProjectId == project_id).all()
        level_score = {}
        for level in levels:
            level_score[level.Name] = level.Points

        return level_score

    def get_levels_by_project(self, project_id: int) -> Dict[str, int]:
        levels = Levels.query.filter(Levels.ProjectId == project_id).order_by(asc(Levels.Order)).all()

        return levels

    def create_project(self, name: str, start: datetime, end: datetime, language:str,class_id:int,file_path:str):    
        project = Projects(Name = name, Start = start, End = end, Language = language,ClassId=class_id,solutionpath=file_path)
        db.session.add(project)
        db.session.commit()
    def get_project(self, project_id:int) -> Projects:
        print("THis is the project id: ",project_id)
        project_data = Projects.query.filter(Projects.Id == project_id).first()
        project ={}
        now=project_data.Start
        start_string = now.strftime("%Y/%m/%d %H:%M:%S")
        now = project_data.End
        end_string = now.strftime("%Y/%m/%d %H:%M:%S")
        project[project_data.Id] = [str(project_data.Name),str(start_string),str(end_string)]
        print(project,flush=True)
        return project

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
            testcase_data.append(test.input)
            testcase_data.append(test.Output)
            testcase_data.append(test.IsHidden)
            testcase_info[test.Id] = testcase_data
        return testcase_info
    
    def add_or_update_testcase(self, project_id:int, testcase_id:int, level_name:str, name:str, description:str, input_data:str, output:str, is_hidden:bool):
        #TODO: run grading script and generate output for the testcases.
        project = Projects.query.filter(Projects.Id == project_id).first()
        language = project.Language
        filepath = project.solutionpath
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        output
        output = loop.run_until_complete(runner(filepath,input_data, language))
        loop.close()
        print("This is the testcase id: ",testcase_id)
        testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
        if testcase is None:
            print(project_id)
            print(level_name)
            level = Levels.query.filter(and_(Levels.ProjectId==project_id, Levels.Name==level_name)).first()
            print(level.Id)
            level_id = level.Id 
            testcase = Testcases(ProjectId = project_id, LevelId = level_id, Name = name, Description = description, input = input_data, Output = output, IsHidden = is_hidden)
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
    
    def get_testcase_input(self, testcase_id:int):
         testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
         return testcase.input
    
    def get_testcase_project(self, testcase_id:int):
        testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
        return testcase.ProjectId
    def get_project_id_by_name(self, projectname:str):
        if(Projects.query.filter(Projects.Name==projectname).count() == 0):
            return 0
        project = Projects.query.filter(Projects.Name==projectname).first()
        return project.Id
    def levels_creator(self,project_id:int):
        level_1=Levels(ProjectId=project_id,Name="Level 1",Points=20,Order=1)
        level_2=Levels(ProjectId=project_id,Name="Level 2",Points=20,Order=2)
        level_3=Levels(ProjectId=project_id,Name="Level 3",Points=20,Order=3)
        db.session.add(level_1)
        db.session.add(level_2)
        db.session.add(level_3)
        db.session.commit()
    def testcases_to_json(self,project_id:int):
        testcase_holder={}
        testcase = Testcases.query.filter(Testcases.ProjectId == project_id)
        for test in testcase:
            level  =  Levels.query.filter(Levels.Id == test.LevelId)
            print(level, flush=True)
            level_name=level[0].Name
            testcase_holder[test.Id] = [test.Name,level_name,test.Description, test.input, test.Output, test.IsHidden]
        json_object = json.dumps(testcase_holder)
        print(json_object,flush=True) 
        return json_object
        



        

    
