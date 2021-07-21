from src.repositories.user_repository import AUserRepository
from flask import Blueprint
from flask import make_response
from flask import request
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.submission_repository import ASubmissionRepository
from src.repositories.project_repository import AProjectRepository
from src.services.link_service import LinkService
from src.constants import EMPTY, BASE_URL, ADMIN_ROLE
import json
from tap.parser import Parser
from flask import jsonify

submission_api = Blueprint('submission_api', __name__)

def convert_tap_to_json(file_path,role):
    parser = Parser()
    test=[]
    final={}
    for line in parser.parse_file(file_path):
        if line.category == "test":
            print(line.yaml_block["hidden"])
            print(bool(line.yaml_block["hidden"]))
            if role == ADMIN_ROLE:
                test.append({
                    'skipped': line.skip,
                    'passed': line.ok,
                    'test': line.yaml_block
                })
            elif line.yaml_block["hidden"] == "True" and role != ADMIN_ROLE:
                continue
            else:
                test.append({
                    'skipped': line.skip,
                    'passed': line.ok,
                    'test': line.yaml_block
                })

    final["results"]=test
    return json.dumps(final, sort_keys=True, indent=4)


@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
@inject
def testcaseerrors(submission_repository: ASubmissionRepository):
    submissionid = int(request.args.get("id"))
    output_path = ""

    if submissionid != EMPTY and current_user.Role == ADMIN_ROLE:
        output_path = submission_repository.get_json_path_by_submission_id(submissionid)
    else:
        output_path = submission_repository.get_json_path_by_user_id(current_user.Id)
    output = convert_tap_to_json(output_path,current_user.Role)
    return make_response(output, HTTPStatus.OK)

@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
@inject
def pylintoutput(submission_repository: ASubmissionRepository, link_service: LinkService):
    submissionid = int(request.args.get("id"))
    pylint_output = ""
    if submissionid != EMPTY and current_user.Role == ADMIN_ROLE:
        pylint_output = submission_repository.get_pylint_path_by_submission_id(submissionid)
    else:
        pylint_output = submission_repository.get_pylint_path_by_user_id(current_user.Id)
    with open(pylint_output, 'r') as file:
        output = file.read()
        output = link_service.add_link_info_links(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@inject
def codefinder(submission_repository: ASubmissionRepository):
    submissionid = int(request.args.get("id"))
    code_output = ""
    if submissionid != EMPTY and current_user.Role == ADMIN_ROLE:
        code_output = submission_repository.get_code_path_by_submission_id(submissionid)
    else:
        code_output = submission_repository.get_code_path_by_user_id(current_user.Id)
    with open(code_output, 'r') as file:
        output = file.read()
        
    return make_response(output, HTTPStatus.OK)

@submission_api.route('/submissioncounter', methods=['GET'])
@jwt_required()
@inject
def get_submission_information(submission_repository: ASubmissionRepository,project_repository: AProjectRepository):
    project = project_repository.get_current_project()
    if project != None:
        current_project = project.Id
        number = submission_repository.get_submissions_remaining(current_user.Id, current_project)
        return jsonify(submissions_remaining = number, name = project.Name, end = project.End, Id = project.Id, max_submissions = project.MaxNumberOfSubmissions)
    else:
        return jsonify(submissions_remaining = -1, name = "", end = "", Id = -1, MaxSubmission = -1)

@submission_api.route('/recentsubproject', methods=['POST'])
@jwt_required()
@inject
def recentsubproject(submission_repository: ASubmissionRepository, user_repository: AUserRepository):
    input_json = request.get_json()
    projectid = input_json['project_id']
    users = user_repository.get_all_users()
    studentattempts={}
    userids=[]
    for user in users:
        userids.append(user.Id)
    bucket = submission_repository.get_most_recent_submission_by_project(projectid, userids)    
    for user in users:
        holder = user.Firstname + " " + user.Lastname
        number = submission_repository.get_submissions_remaining(user.Id, projectid)
        if user.Id in bucket:
            studentattempts[user.Id]=[holder,number,bucket[user.Id].Time.strftime("%m/%d/%Y"),bucket[user.Id].IsPassing,bucket[user.Id].NumberOfPylintErrors,bucket[user.Id].Id]    
        else:
            studentattempts[user.Id]=[holder, "N/A", "N/A", "N/A",  "N/A", -1]    
    return make_response(json.dumps(studentattempts), HTTPStatus.OK)
