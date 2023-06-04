from flask import Blueprint, make_response, request
from flask_jwt_extended import jwt_required
from src.repositories.class_repository import ClassRepository
from src.repositories.database import db
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

@class_api.route('/classes_by_Tid', methods=['GET'])
@jwt_required()
@inject
def get_classes_by_tid(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes = class_repository.get_assigned_courses(current_user.Id)
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

@class_api.route('/get_teacher_class_by_id', methods=['GET'])
@jwt_required()
@inject
def get_teacher_class_by_id(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes=class_repository.get_teacher_class_by_id(current_user.Id)
    return jsonify(classes)


@class_api.route('/get_student_class_by_id', methods=['GET'])
@jwt_required()
@inject
def get_student_class_by_id(class_repository: ClassRepository = Provide[Container.class_repo]):
    classes=class_repository.get_student_class_by_id(current_user.Id)
    return jsonify(classes)

@class_api.route('/add_class_student', methods=['POST'])
@jwt_required()
@inject
def add_class_student(class_repository: ClassRepository = Provide[Container.class_repo]):
    print("IN ADD CLASSES", flush=True)
    class_name = request.form.get('class_name')
    lecture_name = request.form.get('lecture_name')
    lab_name = request.form.get('lab_name')

    print(class_name,lecture_name,lab_name,"out",flush=True)

    class_id = class_repository.get_class_id(class_name)
    lecture_id = class_repository.get_lecture_id_withName(lecture_name)
    lab_id = class_repository.get_lab_id_withName(lab_name)
   
    class_repository.add_class_assignment(class_id= class_id,lab_id=lab_id,lecture_id= lecture_id,user_id= current_user.Id)

    return jsonify(message="Class assignment added successfully"), 200

