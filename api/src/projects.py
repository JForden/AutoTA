from src.repositories.submission_repository import ASubmissionRepository
from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.project_repository import AProjectRepository
from src.models.ProjectJson import ProjectJson
from src.constants import ADMIN_ROLE
from flask import jsonify

projects_api = Blueprint('projects_api', __name__)

@projects_api.route('/all_projects', methods=['GET'])
@jwt_required()
@inject
def all_projects(project_repository: AProjectRepository, submission_repository: ASubmissionRepository):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'UNAUTHORIZED.  REPORTED TO MUPD'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    data = project_repository.get_all_projects()
    new_projects = []
    thisdic = submission_repository.get_total_submission_for_all_projects()
    for proj in data:
        new_projects.append(ProjectJson(proj.Id, proj.Name, proj.Start.strftime("%m/%d/%Y"), proj.End.strftime("%m/%d/%Y"), thisdic[proj.Id]).toJson())
    return jsonify(new_projects)
    