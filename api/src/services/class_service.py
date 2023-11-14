from src.repositories.class_repository import ClassRepository
from src.repositories.models import Classes, Users
from src.constants import STUDENT_ROLE, ADMIN_ROLE


class ClassService:
    def get_assigned_classes(self, current_user: Users, class_repo: ClassRepository) -> [Classes]:
        classes_list = []
        
        if current_user.Role == STUDENT_ROLE:
            classes_list = class_repo.get_assigned_student_classes(current_user.Id)
        elif current_user.Role == ADMIN_ROLE:
            classes = class_repo.get_classes()
            for c in classes:
                if str(current_user.Id) == str(c.Tid):
                    classes_list.append(c)

        return classes_list
