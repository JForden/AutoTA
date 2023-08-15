from typing import Dict, List
from src.repositories.database import db
from .models import ClassAssignments, Classes, Labs, LectureSections
from sqlalchemy import desc, and_

from ..models.LabJson import LabJson
from ..models.LectureSectionsJson import LectureSectionsJson


class ClassRepository():

    def get_class_id(self, class_name):
        """[Gets class id given the name]"""
        class_id = Classes.query.filter(Classes.Name==class_name).first().Id
        
        return class_id
    def get_lecture_id_withName(self,lectureName):
        # changed LectureSections.Name to Id
        lecture_id = LectureSections.query.filter(LectureSections.Id==lectureName).first().Id
        return lecture_id
    def get_lab_id_withName(self,labName):
        # changed Labs.Name to Labs.Id
        lab_id = Labs.query.filter(Labs.Id==labName).first().Id
        return lab_id
    def get_classes(self) -> List[Classes]:
        """[Get all the current classes]"""
        classes = Classes.query.order_by(desc(Classes.Name)).all()
        return classes
    
    def get_assigned_courses(self, user_id):
        classes = Classes.query.filter(Classes.Tid==user_id).all()
        classDict = {}
        for c in classes:
            classDict[c.Id] = c.Name
        return classDict
    
    def create_assignments(self, class_id: int, lab_id:int, user_id: int, lecture_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        class_assignment = ClassAssignments(ClassId=class_id,LabId=lab_id,UserId=user_id,LectureId=lecture_id)
        db.session.add(class_assignment)
        db.session.commit()

        
    def get_student_class_by_id(self, user_id: int) -> Dict[int, str]:
        classList= ClassAssignments.query.filter(ClassAssignments.UserId==user_id).all()
        classDict = {}
        for item in classList:
            classDict[item.ClassId] = Classes.query.filter(Classes.Id==item.ClassId).first().Name
        return classDict


    def get_labs(self) -> Dict[int, List[LabJson]]:
        """[Once given a class, get all the labs for that class]"""
        labs = Labs.query.all()

        labs_dict = {}
        for lab in labs:
            if lab.ClassId in labs_dict:
                labs_dict[lab.ClassId].append(LabJson(lab.Id, lab.Name))
            else:
                labs_dict[lab.ClassId] = [LabJson(lab.Id, lab.Name)]

        for lab_id in labs_dict:
            labs_dict[lab_id].sort(key=lambda x: x.Name)

        return labs_dict

    def get_lecture_sections(self) -> Dict[int, List[LectureSectionsJson]]:
        """[loop through classes, get all the labs for that class]"""
        lecture_sections = LectureSections.query.all()

        labs_dict = {}
        for lecture_section in lecture_sections:
            if lecture_section.ClassId in labs_dict:
                labs_dict[lecture_section.ClassId].append(LectureSectionsJson(lecture_section.Id, lecture_section.Name))
            else:
                labs_dict[lecture_section.ClassId] = [LectureSectionsJson(lecture_section.Id, lecture_section.Name)]

        for lab_id in labs_dict:
            labs_dict[lab_id].sort(key=lambda x: x.Name)

        return labs_dict

    def add_class_assignment(self, class_id: int, lab_id:int, lecture_id: int, user_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        #TODO: check if this works?
        print("in repo", flush=True)
        class_assignment = ClassAssignments(ClassId=class_id,LabId=lab_id,LectureId=lecture_id,UserId=user_id,)
        db.session.add(class_assignment)
        db.session.commit()
        return "ok"


