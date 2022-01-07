from flask import Blueprint, make_response
from flask_jwt_extended import jwt_required
from src.repositories.class_repository import ClassRepository
from dependency_injector.wiring import inject, Provide
from container import Container
from flask import jsonify
from flask_jwt_extended import current_user

class_api = Blueprint('class_api', __name__)

@class_api.route('/all_classes', methods=['GET'])
@jwt_required()
@inject
def get_classes(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes = class_repository.get_classes()
    return jsonify(classes)










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

@class_api.route('/get_class_by_id', methods=['GET'])
@jwt_required()
@inject
def get_class_by_id(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes=class_repository.get_class_by_id(current_user.Id)
    return jsonify(classes)