from src.repositories.submission_repository import ASubmissionRepository
from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.project_repository import AProjectRepository
from flask_cors import CORS, cross_origin
from src.models.ProjectJson import ProjectJson
import json
from datetime import datetime

projects_api = Blueprint('projects_api', __name__)


@projects_api.route('/all_projects', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def all_projects(project_repository: AProjectRepository, submission_repository: ASubmissionRepository):
    if current_user.Role != 1:
        message = {
            'message': 'UNAUTHORIZED.  REPORTED TO MUPD'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
        
    data = project_repository.get_all_projects()
    new_projects = []
    thisdic = submission_repository.getTotalSubmissionsForAllProjects()
    for proj in data:
        new_projects.append(ProjectJson(proj.Id, proj.Name, proj.Start.strftime("%m/%d/%Y"), proj.End.strftime("%m/%d/%Y"), thisdic[proj.Id]).toJson())
    projects = json.dumps(new_projects)
    return make_response(projects, HTTPStatus.OK)
    