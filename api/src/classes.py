from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from dependency_injector.wiring import inject, Provide
from container import Container

from src.repositories.class_repository import ClassRepository
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
    if is_filtered:
        classes = class_service.get_assigned_classes(current_user, class_repo)
    else:
        classes = class_repo.get_classes()

    for c in classes:
        classes_list.append({"name":c.Name, "id": c.Id})
    return jsonify(classes_list)

@class_api.route('/sections', methods=['GET'])
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

        holder.append({
            "name": cls.Name,
            "id": cls.Id,
            "labs": class_lab,
            "lectures": class_lectures
        })

    return jsonify(holder)
