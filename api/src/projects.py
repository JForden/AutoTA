import json
from src.repositories.user_repository import AUserRepository
from src.repositories.submission_repository import ASubmissionRepository
from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.project_repository import AProjectRepository
from src.services.dataService import all_submissions 
from src.models.ProjectJson import ProjectJson
from src.constants import ADMIN_ROLE
from flask import jsonify
from flask import request

projects_api = Blueprint('projects_api', __name__)

@projects_api.route('/all_projects', methods=['GET'])
@jwt_required()
@inject
def all_projects(project_repository: AProjectRepository, submission_repository: ASubmissionRepository):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    data = project_repository.get_all_projects()
    new_projects = []
    thisdic = submission_repository.get_total_submission_for_all_projects()
    for proj in data:
        new_projects.append(ProjectJson(proj.Id, proj.Name, proj.Start.strftime("%x %X"), proj.End.strftime("%x %X"), thisdic[proj.Id]).toJson())
    return jsonify(new_projects)
    
@projects_api.route('/run-moss', methods=['POST'])
@jwt_required()
@inject
def run_moss(user_repository: AUserRepository, submission_repository: ASubmissionRepository):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    
    input_json = request.get_json()
    projectid = input_json['project_id']

    url= all_submissions(projectid, submission_repository, user_repository)
    return make_response(url, HTTPStatus.OK)
    
    
@projects_api.route('/projects-by-user', methods=['GET'])
@jwt_required()
@inject
def get_projects_by_user(project_repository: AProjectRepository, submission_repository: ASubmissionRepository):
    projects= project_repository.get_all_projects()
    student_submissions={}
    for project in projects:
        subs = submission_repository.get_most_recent_submission_by_project(project.Id, [current_user.Id])
        sub = subs[current_user.Id]
        student_submissions[project.Name]=[sub.Id, sub.Points, sub.Time.strftime("%x %X")]
    
    print("This is the dict: ", student_submissions)
    print()
    print()
    print("This is the json results from student submissions: ", json.dumps(student_submissions))
    return make_response(json.dumps(student_submissions), HTTPStatus.OK)


