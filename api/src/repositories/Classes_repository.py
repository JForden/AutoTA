from abc import ABC, abstractmethod
from typing import List
from .models import ClassAssignments, Classes, Labs
from .database import Session
from sqlalchemy import desc


class AClassRepository(ABC):
    """[This is the head docstring for the class repo]
    """
    @abstractmethod
    def get_classes(self) -> List[Classes]:
        """[Get all the current classes]"""
        pass
    @abstractmethod
    def get_Labs(self, class_id: int) -> List[Labs]:
        """[Once given a class, get all the labs for that class]"""
        pass
    
    @abstractmethod
    def create_assignments(self, class_id: int, lab_id: int, user_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        pass

class ClassRepository(AClassRepository):
    def get_classes(self) -> List[Classes]:
        """[Get all the current classes]"""
        session = Session()
        classes = session.query(Classes).order_by(desc(Classes.Name)).all()
        session.close()
        return classes

    def get_Labs(self, class_id: int) -> List[Labs]:
        """[Once given a class, get all the labs for that class]"""
        session = Session()
        labs = session.query(Labs).filter(Labs.Class == class_id).all()
        session.close()
        return labs
        
    def create_assignments(self, class_id: int, lab_id:int, user_id: int):
        """[Creates a new entry in the ClassAssignments table]"""
        session = Session()
        class_assignment = ClassAssignments(ClassId=class_id,LabId=lab_id,UserId=user_id)
        session.add(class_assignment)
        session.commit()