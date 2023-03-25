import json
import os
import shutil
import subprocess
import os.path
from typing import List
import zipfile
import stat
import sys
from subprocess import Popen
from src.repositories.user_repository import UserRepository
from src.repositories.submission_repository import SubmissionRepository
from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.project_repository import ProjectRepository
from src.services.dataService import all_submissions 
from src.models.ProjectJson import ProjectJson
from src.constants import ADMIN_ROLE
from flask import jsonify
from flask import request
from dependency_injector.wiring import inject, Provide
from container import Container

projects_api = Blueprint('projects_api', __name__)

@projects_api.route('/all_projects', methods=['GET'])
@jwt_required()
@inject
def all_projects(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    data = project_repo.get_all_projects()
    new_projects = []
    thisdic = submission_repo.get_total_submission_for_all_projects()
    for proj in data:
        new_projects.append(ProjectJson(proj.Id, proj.Name, proj.Start.strftime("%x %X"), proj.End.strftime("%x %X"), thisdic[proj.Id]).toJson())
    return jsonify(new_projects)



@projects_api.route('/run-moss', methods=['POST'])
@jwt_required()
@inject
def run_moss(user_repo: UserRepository = Provide[Container.user_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    
    input_json = request.get_json()
    projectid = input_json['project_id']

    userId=current_user.Id
    all_submissions(projectid, userId, submission_repo, user_repo)
    
    return make_response("Done, the results should appear in your email within 24 hours. Please only run this call once a day. NOTE: PLEASE CHECK JUNK FOLDER ", HTTPStatus.OK)
    
    
@projects_api.route('/projects-by-user', methods=['GET'])
@jwt_required()
@inject
def get_projects_by_user(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    projects= project_repo.get_all_projects()
    student_submissions={}
    for project in projects:
        subs = submission_repo.get_most_recent_submission_by_project(project.Id, [current_user.Id])
        if current_user.Id in subs: 
            sub = subs[current_user.Id]
            student_submissions[project.Name]=[sub.Id, sub.Points, sub.Time.strftime("%x %X")]
    return make_response(json.dumps(student_submissions), HTTPStatus.OK)



@projects_api.route('/create_project', methods=['POST'])
@jwt_required()
@inject
def create_project(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if 'file' not in request.files:
        print("NO FILE")
        message = {
            'message': 'No selected file'
        }
        return make_response(message, HTTPStatus.BAD_REQUEST)    
    file = request.files['file']
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    
    if 'name' in request.form:
        name = request.form['name']
    if 'start_date' in request.form:
        start_date = request.form['start_date']
    if  'end_date' in request.form:
        end_date= request.form['end_date']
    if 'language' in request.form:
        language = request.form['language']
    if  'class_id'  in request.form:
        class_id = request.form['class_id']
    if name == '' or start_date == '' or end_date == '' or language == '':
        return make_response("Error in form", HTTPStatus.BAD_REQUEST)
    extension_mapping = {
    "python": "py",
    "java": "java",
    "c++": "cpp",
    "c": "c",
    "javascript": "js",
    "ruby": "rb",
    "php": "php"
    }

    filename =file.filename
    extension = os.path.splitext(filename)[1]
    print("Extension in projects: ", extension, flush=True)
    if extension != ".zip":
        path = os.path.join("/ta-bot/project-files", f"{name}.{extension}")
        file.save(path)
    else:
        path = os.path.join("/ta-bot/project-files", f"{name}")
        if os.path.isdir(path):
            shutil.rmtree(path)
        os.mkdir(path)
        with zipfile.ZipFile(file, "r") as zip_ref:
            zip_ref.extractall(path) 
    #TODO: Add class ID and path

    project_repo.create_project(name, start_date, end_date, language,class_id,path)

    new_project_id = project_repo.get_project_id_by_name(name)
    project_repo.levels_creator(new_project_id)

    return make_response(str(new_project_id), HTTPStatus.OK)

@projects_api.route('/edit_project', methods=['POST'])
@jwt_required()
@inject
def edit_project(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    if "id" in request.form:
        pid = request.form["id"]
    if 'name' in request.form:
        name = request.form['name']
    if 'start_date' in request.form:
        start_date = request.form['start_date']
    if  'end_date' in request.form:
        end_date= request.form['end_date']
    if 'language' in request.form:
        language = request.form['language']
    if name == '' or start_date == '' or end_date == '' or language == '':
        return make_response("Error in form", HTTPStatus.BAD_REQUEST)
    
    project_repo.edit_project(name, start_date, end_date, language, pid)
    return make_response("Project Edited", HTTPStatus.OK)


@projects_api.route('/get_project_id', methods=['GET'])
@jwt_required()
@inject
def get_project(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    project_info=project_repo.get_project(request.args.get('id'))
    print(project_info,flush=True)
    return make_response(json.dumps(project_info), HTTPStatus.OK)
    
@projects_api.route('/get_testcases', methods=['GET'])
@jwt_required()
@inject
def get_testcases(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)

    project_id = request.args.get('id')
    testcases = project_repo.get_testcases(project_id)
    levels = project_repo.get_levels_by_project(project_id)
    for key in testcases:
        value = testcases[key]
        for level in levels:
            if level.Id==value[0]:
                value.append(level.Name)

    return make_response(json.dumps(testcases), HTTPStatus.OK)



@projects_api.route('/json_add_testcases', methods=['POST'])
@jwt_required()
@inject   
def json_add_testcases(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    file = request.files['file']
    project_id = request.form["project_id"]
    try:
        json_obj = json.load(file)
    except json.JSONDecodeError:
         message = {
            'message': 'Incorrect JSON format'
        }
         return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
    else:
        for testcase in json_obj:
            project_repo.add_or_update_testcase(project_id, -1, testcase["levelname"], testcase["name"], testcase["description"], testcase["input"], testcase["output"], bool(testcase["isHidden"]))
        print("hi")
    return make_response("Testcase Added", HTTPStatus.OK)


@projects_api.route('/add_or_update_testcase', methods=['POST'])
@jwt_required()
@inject   
def add_or_update_testcase(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)

    if 'id' in request.form:
        id_val=request.form['id']
    if 'name' in request.form:
        name = request.form['name']
    if 'levelName' in request.form:
        level_name = request.form['levelName']
    if 'input' in request.form:
        input_data = request.form['input']
    if 'output' in request.form:
        output = request.form['output']
    if 'project_id' in request.form:
        project_id = request.form['project_id']
    if 'isHidden' in request.form:
        isHidden = request.form['isHidden']
    if 'description' in request.form:
        description = request.form['description']
    
    if id_val == '' or name == '' or input_data == '' or project_id == '' or isHidden == '' or description == '':
        return make_response("Error in form", HTTPStatus.BAD_REQUEST)
    


    isHidden = True if isHidden.lower() =="true" else False
    
    project_repo.add_or_update_testcase(project_id, id_val, level_name, name, description, input_data, output, isHidden)
    return make_response("Testcase Added", HTTPStatus.OK)
    


@projects_api.route('/remove_testcase', methods=['POST'])
@jwt_required()
@inject
def remove_testcase(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)

    if 'id' in request.form:
        id_val=request.form['id']
    project_repo.remove_testcase(id_val)
    return make_response("Testcase Removed", HTTPStatus.OK)

    
    
@projects_api.route('/get_projects_by_class_id', methods=['GET'])
@jwt_required()
@inject
def get_projects_by_class_id(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    print("ID: ", request.args.get('id'), flush=True)
    data = project_repo.get_projects_by_class_id(request.args.get('id'))
    print(data, " <- Data", flush=True)
    new_projects = []
    thisdic = submission_repo.get_total_submission_for_all_projects()
    for proj in data:
        new_projects.append(ProjectJson(proj.Id, proj.Name, proj.Start.strftime("%x %X"), proj.End.strftime("%x %X"), thisdic[proj.Id]).toJson())
    return jsonify(new_projects)


@projects_api.route('/reset_project', methods=['POST', 'DELETE'])
@jwt_required()
@inject
def reset_project(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    project_id = request.args.get('id')
    project_repo.wipe_submissions(project_id)
    return make_response("Project reset", HTTPStatus.OK)


@projects_api.route('/delete_project', methods=['POST', 'DELETE'])
@jwt_required()
@inject
def delete_project(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    print(current_user.Role, flush=True)
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    project_id = request.args.get('id')
    print("ProjectID: ", project_id)
    
    project_repo.wipe_submissions(project_id)
    print("MADE IT HERE", flush=True)
    project_repo.delete_project(project_id)
    print("Finished", flush=True)
    return make_response("Project reset", HTTPStatus.OK)
    