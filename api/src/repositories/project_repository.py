from abc import ABC, abstractmethod
import os
import random
import shutil
import subprocess
from typing import Optional, Dict

from flask import send_file

from sqlalchemy.sql.expression import asc
from .models import ChatLogs, Projects, Levels, StudentGrades, StudentProgress, Submissions, Testcases, Classes
from src.repositories.database import db
from sqlalchemy import desc, and_
from datetime import datetime
from pyston import PystonClient,File
import asyncio
import json



class ProjectRepository():

    #TODO: Remove
    def get_current_project(self) -> Optional[Projects]:
        """[Identifies the current project based on the start and end date]
        Returns:
            Project: [this should be the currently assigned project object]
        """
        now = datetime.now()
        project = Projects.query.filter(Projects.End >= now, Projects.Start < now).first()
        return project

    def get_current_project_by_class(self, class_id: int) -> Optional[Projects]:
        """Identifies the current project based on the start and end date.

        Args:
            class_id (int): The ID of the class.

        Returns:
            Optional[Projects]: The currently assigned project object.
        """
        now = datetime.now()
        project = Projects.query.filter(Projects.ClassId==class_id,Projects.End >= now, Projects.Start < now).first()
        #Start and end time format: 2023-05-31 14:33:00
        return project

    #TODO: Remove
    def get_all_projects(self) -> Projects:
        """Get all projects from the mySQL database and return a project object sorted by end date.

        Returns:
            Projects: A project object sorted by end date.
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
        """
        Returns a list of projects associated with a given class ID.

        Args:
        class_id (int): The ID of the class to retrieve projects for.

        Returns:
        A list of project objects associated with the given class ID.
        """
        class_projects = Projects.query.filter(Projects.ClassId==class_id)
        return class_projects
    
    def get_levels(self, project_id: int) -> Dict[str, int]:
        """
        Returns a dictionary of level names and their corresponding points for a given project.

        Args:
            project_id (int): The ID of the project to retrieve levels for.

        Returns:
            Dict[str, int]: A dictionary where the keys are level names and the values are the corresponding points.
        """
        levels = Levels.query.filter(Levels.ProjectId == project_id).all()
        level_score = {}
        for level in levels:
            level_score[level.Name] = level.Points

        return level_score

    def get_levels_by_project(self, project_id: int) -> Dict[str, int]:
        levels = Levels.query.filter(Levels.ProjectId == project_id).order_by(asc(Levels.Order)).all()

        return levels

    def create_project(self, name: str, start: datetime, end: datetime, language:str,class_id:int,file_path:str, description_path:str):    
        project = Projects(Name = name, Start = start, End = end, Language = language,ClassId=class_id,solutionpath=file_path, AsnDescriptionPath = description_path)
        db.session.add(project)
        db.session.commit()
        return project.Id
    def get_project(self, project_id:int) -> Projects:
        project_data = Projects.query.filter(Projects.Id == project_id).first()
        project ={}
        now=project_data.Start
        start_string = now.strftime("%Y-%m-%dT%H:%M:%S")
        now = project_data.End
        end_string = now.strftime("%Y-%m-%dT%H:%M:%S")
        project_solutionFile = project_data.solutionpath
        #Strip just the file name from the path
        project_solutionFile = project_solutionFile.split("/")[-1]
        project_descriptionfile = project_data.AsnDescriptionPath
        project_descriptionfile = project_descriptionfile.split("/")[-1]
        project[project_data.Id] = [str(project_data.Name),str(start_string),str(end_string), str(project_data.Language), str(project_solutionFile), str(project_descriptionfile)]
        return project

    def edit_project(self, name: str, start: datetime, end: datetime, language:str, project_id:int, path:str, description_path:str):
        project = Projects.query.filter(Projects.Id == project_id).first()
        project.Name = name
        project.Start = start
        project.End = end
        project.Language = language
        project.solutionpath = path
        project.AsnDescriptionPath = description_path
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
            if test.additionalfilepath != "":
                testcase_data.append(test.additionalfilepath)
            else:
                testcase_data.append("")
            testcase_info[test.Id] = testcase_data
        return testcase_info
    
    def add_or_update_testcase(self, project_id:int, testcase_id:int, level_name:str, name:str, description:str, input_data:str, output:str, is_hidden:bool, additional_file_path:str):
        project = Projects.query.filter(Projects.Id == project_id).first()
        filepath = project.solutionpath
        #TODO: see if we can get away from stdout
        result = subprocess.run(["python","../ta-bot/tabot.py", "ADMIN", str(-1), project.Language, input_data, filepath, additional_file_path], stdout=subprocess.PIPE, text=True)
        if output == "":
            output = result.stdout.strip()        
        testcase = Testcases.query.filter(Testcases.Id == testcase_id).first()
        if testcase is None:
            level = Levels.query.filter(and_(Levels.ProjectId==project_id, Levels.Name==level_name)).first()
            level_id = level.Id 
            testcase = Testcases(ProjectId = project_id, LevelId = level_id, Name = name, Description = description, input = input_data, Output = output, IsHidden = is_hidden, additionalfilepath = additional_file_path)
            db.session.add(testcase)
            db.session.commit()
        else:
            level = Levels.query.filter(and_(Levels.ProjectId==project_id, Levels.Name==level_name)).first()
            level_id = level.Id 
            testcase.projectid=project_id
            testcase.LevelId = level_id
            testcase.Name = name
            testcase.Description = description
            testcase.input = input_data
            testcase.Output = output
            testcase.IsHidden = is_hidden
            if additional_file_path != "":
                testcase.additionalfilepath = additional_file_path
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
            testcase_holder[test.Id] = [test.Name,level_name,test.Description, test.input, test.Output, test.IsHidden, test.additionalfilepath]
        json_object = json.dumps(testcase_holder)
        print(json_object,flush=True) 
        return json_object
    def wipe_submissions(self, project_id:int):
        submissions = Submissions.query.filter(Submissions.Project == project_id).all()
        student_progress = StudentProgress.query.filter(StudentProgress.ProjectId ==project_id).all()
        for student in student_progress:
            db.session.delete(student)
        db.session.commit()
        for submission in submissions:
            db.session.delete(submission)
        db.session.commit()
    def delete_project(self, project_id:int):
        project = Projects.query.filter(Projects.Id == project_id).first()
        testcases =Testcases.query.filter(Testcases.ProjectId==project_id).all()
        path = "../../ta-bot/" + project.Name +"-out"
        shutil.rmtree(path)

        for test in testcases:
            db.session.delete(test)
            db.session.commit()
        levels = Levels.query.filter(Levels.ProjectId==project_id).all()
        for level in levels:
            print(level, flush=True)
            db.session.delete(level)
            db.session.commit()
        db.session.delete(project)
        db.session.commit()
    def get_className_by_projectId(self, project_id):
        project = Projects.query.filter(Projects.Id == project_id).first()
        class_obj = Classes.query.filter(Classes.Id ==project.ClassId).first()
        return class_obj.Name
    #TODO: Move this call to class repository
    def get_class_id_by_name(self, class_name):
        class_id = Classes.query.filter(Classes.Name==class_name).first().Id
        return class_id
    def get_project_path(self, project_id):
        project = Projects.query.filter(Projects.Id==project_id).first()
        return project.solutionpath
    def get_project_desc_path(self, project_id):
        project = Projects.query.filter(Projects.Id==project_id).first()
        return project.AsnDescriptionPath
    def get_project_desc_file(self, project_id):
        project = Projects.query.filter(Projects.Id == project_id).first()
        filepath = project.AsnDescriptionPath
        with open(filepath, 'rb') as file:
            file_contents = file.read()
        return file_contents  # Return the contents of the PDF file
    def get_student_grade(self, project_id, user_id):
        student_progress = StudentGrades.query.filter(and_(StudentGrades.Sid==user_id, StudentGrades.Pid==project_id)).first()
        if student_progress is None:
            return 0
        return student_progress.Grade
    def set_student_grade(self, project_id, user_id, grade):
        student_grade = StudentGrades.query.filter(and_(StudentGrades.Sid==user_id, StudentGrades.Pid==project_id)).first()
        if student_grade is not None:
            student_grade.Grade = grade
            db.session.commit()
            return
        studentGrade = StudentGrades(Sid=user_id, Pid=project_id, Grade=grade)
        db.session.add(studentGrade)
        db.session.commit()
        return
    def submit_student_chat(self, user_id, class_id, project_id, user_message, user_code, language, response_to):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        #Get User UserPseudonym
        UserPseudonym = ChatLogs.query.filter(ChatLogs.UserId==user_id).first().UserPseudonym
        new_flag = True
        if UserPseudonym is None:
            while new_flag:
                adjectives = ['Agile', 'Brave', 'Calm', 'Diligent', 'Eager', 'Fierce', 'Gentle', 'Heroic', 'Inventive', 'Jovial', 'Keen', 'Lively', 'Mighty', 'Noble', 'Optimistic', 'Proud', 'Quick', 'Resilient', 'Strong', 'Tenacious', 'Unique', 'Vibrant', 'Wise', 'Xenial', 'Youthful', 'Zealous']
                nouns = ['Lion', 'Eagle', 'Tiger', 'Leopard', 'Elephant', 'Bear', 'Fox', 'Wolf', 'Hawk', 'Shark', 'Dolphin', 'Cheetah', 'Panther', 'Falcon', 'Gazelle', 'Hippopotamus', 'Iguana', 'Jaguar', 'Kangaroo', 'Lemur', 'Mongoose', 'Narwhal', 'Octopus', 'Penguin', 'Quail', 'Raccoon', 'Squirrel', 'Tortoise', 'Urchin', 'Vulture', 'Walrus', 'Xerus', 'Yak', 'Zebra']
                colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Crimson', 'Cyan', 'Magenta', 'Lime', 'Maroon', 'Navy', 'Olive', 'Teal', 'Violet', 'Indigo', 'Gold', 'Silver', 'Bronze', 'Ruby', 'Emerald', 'Sapphire', 'Amethyst', 'Quartz', 'Onyx', 'Jade', 'Pearl', 'Topaz', 'Opal', 'Turquoise', 'Amber', 'Coral', 'Garnet', 'Jasper', 'Malachite', 'Peridot', 'Tourmaline', 'Zircon']
                UserPseudonym = random.choice(colors) + random.choice(adjectives) + random.choice(nouns)
                unique = ChatLogs.query.filter(ChatLogs.UserPseudonym==UserPseudonym).first()
                if unique is None:
                    new_flag = False
        
        chat = ChatLogs(UserId=user_id, 
                        ClassId=class_id,
                        project_id=project_id, 
                        ResponseTo=response_to,
                        UserPseudonym=UserPseudonym,
                        UserImage="",
                        Response=user_message, 
                        Code=user_code, 
                        Language=language, 
                        TimeSubmitted=dt_string,
                        MessageFlag=0,
                        AcceptedFlag=0,
                        Likes=0)
        db.session.add(chat)
        db.session.commit()
        return "ok"


        



        

    
