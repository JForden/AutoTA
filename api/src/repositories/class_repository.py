from typing import Dict, List
from src.repositories.database import db
from .models import ClassAssignments, Classes, Labs, LectureSections
from sqlalchemy import desc

from ..models.LabJson import LabJson
from ..models.LectureSectionsJson import LectureSectionsJson


class ClassRepository():
    def get_classes(self) -> List[Classes]:
        """[Get all the current classes]"""
        classes = Classes.query.order_by(desc(Classes.Name)).all()
        return classes

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
        """[Once given a class, get all the labs for that class]"""
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


    def create_assignments(self, class_id: int, lab_id:int, user_id: int, lecture_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        class_assignment = ClassAssignments(ClassId=class_id,LabId=lab_id,UserId=user_id,LectureId=lecture_id)
        db.session.add(class_assignment)
        db.session.commit()