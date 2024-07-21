from src.repositories.class_repository import ClassRepository
from src.repositories.models import Classes, Users
from src.constants import STUDENT_ROLE, ADMIN_ROLE


class ClassService:
    def get_assigned_classes(self, current_user: Users, class_repo: ClassRepository) -> [Classes]:
        classes_list = []
        
        if current_user.Role == STUDENT_ROLE:
            classes = class_repo.get_assigned_student_classes(current_user.Id)
            for c in classes:
                classes_list.append({"name":c.Name, "id": c.Id}) 
        elif current_user.Role == ADMIN_ROLE:
            classes = class_repo.get_classes()
            for c in classes:
                if str(current_user.Id) in str(c.Tid):
                    classes_list.append({"name":c.Name, "id": c.Id}) 
        return classes_list
