from flask import Blueprint, make_response, request
from src.repositories.user_repository import UserRepository
from flask_jwt_extended import jwt_required
from src.repositories.class_repository import ClassRepository
from src.repositories.database import db
from dependency_injector.wiring import inject, Provide
from container import Container
from flask import jsonify
from flask_jwt_extended import current_user

from src.services import class_service

class_api = Blueprint('class_api', __name__)

@class_api.route('/all', methods=['GET'])
@jwt_required()
@inject
def get_classes_and_ids(class_repo: ClassRepository = Provide[Container.class_repo],
                        class_service: class_service = Provide[Container.class_service]):
    classes_list = []
    classes = []
    
    is_filtered = request.args.get('filter').lower() == "true"
    if(is_filtered):
        classes = class_service.get_assigned_classes(current_user, class_repo)
    else:
        classes = class_repo.get_classes()
        
    for c in classes:
            classes_list.append({"name":c.Name, "id": c.Id})
    return jsonify(classes_list)

@class_api.route('/get_classes_labs', methods=['GET'])
@inject
def get_class_labs(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes = class_repository.get_classes()
    labs = class_repository.get_labs()
    lecture_sections = class_repository.get_lecture_sections()
    holder=[]
    for cls in classes:
        class_lab = []
        class_lectures = []

        if cls.Id in labs:
            for lab in labs[cls.Id]:
                class_lab.append({"name": lab.Name, "id": lab.Id})

        if cls.Id in lecture_sections:
            for lab in lecture_sections[cls.Id]:
                class_lectures.append({"name": lab.Name, "id": lab.Id})

        holder.append({"name": cls.Name, "id": cls.Id, "labs": class_lab, "lectures": class_lectures})

    return jsonify(holder)

@class_api.route('/add_class_student', methods=['POST'])
@jwt_required()
@inject
def add_class_student(class_repository: ClassRepository = Provide[Container.class_repo]):
    class_name = request.form.get('class_name')
    lecture_name = request.form.get('lecture_name')
    lab_name = request.form.get('lab_name')
    class_id = class_repository.get_class_id(class_name)
    lecture_id = class_repository.get_lecture_id_withName(lecture_name)
    lab_id = class_repository.get_lab_id_withName(lab_name)
   
    class_repository.add_class_assignment(class_id= class_id,lab_id=lab_id,lecture_id= lecture_id,user_id= current_user.Id)

    return jsonify(message="Class assignment added successfully"), 200

