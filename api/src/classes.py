from flask import Blueprint
from injector import inject
from flask_jwt_extended import jwt_required
from src.repositories.Classes_repository import AClassRepository
from flask import jsonify
from flask import request

class_api = Blueprint('class_api', __name__)

@class_api.route('/all_classes', methods=['GET'])
@jwt_required()
@inject
def get_classes(class_repository: AClassRepository):
    classes = class_repository.get_classes()
    return jsonify(classes)


@class_api.route('/labs', methods=['GET'])
@jwt_required()
@inject
def get_Labs(class_repository: AClassRepository):
    class_name = int(request.args.get("class"))
    labs = class_repository.get_Labs(class_name)
    return jsonify(labs)


@class_api.route('/get_classes_labs', methods=['GET'])
@inject
def get_class_labs(class_repository: AClassRepository):
    classes = class_repository.get_classes()
    holder=[]
    for class_name in classes:
        labs = class_repository.get_Labs(class_name.Id)
        labs_holder=[]
        for lab in labs:
            labs_holder.append({"name": lab.Name, "id": lab.Id})
        holder.append({"name": class_name.Name, "id": class_name.Id, "labs": labs_holder})

    return jsonify(holder)