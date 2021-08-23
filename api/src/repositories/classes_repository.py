from abc import ABC, abstractmethod
from typing import List

from src.repositories.database import db
from .models import ClassAssignments, Classes, Labs
from sqlalchemy import desc


class ClassRepository():
    def get_classes(self) -> List[Classes]:
        """[Get all the current classes]"""
        classes = Classes.query.order_by(desc(Classes.Name)).all()
        return classes

    def get_Labs(self, class_id: int) -> List[Labs]:
        """[Once given a class, get all the labs for that class]"""
        labs = Labs.query.filter(Labs.Class == class_id).all()
        return labs
        
    def create_assignments(self, class_id: int, lab_id:int, user_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        class_assignment = ClassAssignments(ClassId=class_id,LabId=lab_id,UserId=user_id)
        db.session.add(class_assignment)
        db.session.commit()