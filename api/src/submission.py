from datetime import timedelta
from src.repositories.config_repository import ConfigRepository
from src.repositories.user_repository import UserRepository
from flask import Blueprint
from flask import make_response
from flask import request
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.submission_repository import SubmissionRepository
from src.repositories.project_repository import ProjectRepository
from src.services.link_service import LinkService
from src.constants import EMPTY, DELAY_CONFIG, REDEEM_BY_CONFIG, ADMIN_ROLE
import json
from tap.parser import Parser
from flask import jsonify
from datetime import datetime
from dependency_injector.wiring import inject, Provide
from container import Container

submission_api = Blueprint('submission_api', __name__)


def convert_tap_to_json(file_path,role,current_level):
    parser = Parser()
    test=[]
    final={}
    for line in parser.parse_file(file_path):
        if line.category == "test":
            if role == ADMIN_ROLE:
                test.append({
                    'skipped': line.skip,
                    'passed': line.ok,
                    'test': line.yaml_block
                })
                continue
            elif line.yaml_block["hidden"] == "True" and role != ADMIN_ROLE:
                continue
            if current_level >= line.yaml_block["suite"]:
                test.append({
                    'skipped': line.skip,
                    'passed': line.ok,
                    'test': line.yaml_block
                })
            else:
                new_yaml = line.yaml_block.copy()
                new_yaml["hidden"] = "True"
                test.append({
                    'skipped': "",
                    'passed': "",
                    'test': new_yaml
                })

    final["results"]=test
    return json.dumps(final, sort_keys=True, indent=4)


@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
@inject
def get_testcase_errors(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    submission_id = int(request.args.get("id"))
    output_path = ""

    if submission_id != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submission_id)):
        output_path = submission_repo.get_json_path_by_submission_id(submission_id)
    else:
        output_path = submission_repo.get_json_path_by_user_id(current_user.Id)
        submission_id = submission_repo.get_submission_by_user_id(current_user.Id).Id

    project_id = submission_repo.get_project_by_submission_id(submission_id)
    current_level=submission_repo.get_current_level(project_id,current_user.Id)
    output = convert_tap_to_json(output_path,current_user.Role,current_level)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
@inject
def pylintoutput(submission_repo: SubmissionRepository = Provide[Container.submission_repo], link_service: LinkService = Provide[Container.link_service]):
    submissionid = int(request.args.get("id"))
    pylint_output = ""
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        pylint_output = submission_repo.get_pylint_path_by_submission_id(submissionid)
    else:
        pylint_output = submission_repo.get_pylint_path_by_user_id(current_user.Id)
    with open(pylint_output, 'r') as file:
        output = file.read()
        output = link_service.add_link_info_links(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@inject
def codefinder(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    submissionid = int(request.args.get("id"))
    code_output = ""
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        code_output = submission_repo.get_code_path_by_submission_id(submissionid)
    else:
        code_output = submission_repo.get_code_path_by_user_id(current_user.Id)
    with open(code_output, 'r') as file:
        output = file.read()
        
    return make_response(output, HTTPStatus.OK)

@submission_api.route('/submissioncounter', methods=['GET'])
@jwt_required()
@inject
def get_submission_information(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], config_repo: ConfigRepository = Provide[Container.config_repo]):
    project = project_repo.get_current_project()
    can_redeem = False
    if project is None:
        return jsonify(submissions_remaining=-1, name="", end="", Id=-1, max_submissions=-1, can_redeem=can_redeem,
                       points=0, time_until_next_submission="")

    current_project = project.Id
    config_value = int(config_repo.get_config_setting(REDEEM_BY_CONFIG))
    cutoff_date = project.Start + timedelta(days=config_value)
    curr_date = datetime.now()

    projects = project_repo.get_all_projects()
    previous_project_id = -1
    for proj in projects:
        if proj.Id == current_project:
            break
        previous_project_id = proj.Id

    redeemable, point = submission_repo.get_can_redeemed(config_repo, current_user.Id, previous_project_id, project.Id)

    if curr_date < cutoff_date and redeemable:
        can_redeem = True

    day_delays_str = config_repo.get_config_setting(DELAY_CONFIG)
    day_delays = [int(x) for x in day_delays_str.split(",")]
    day = curr_date - project.Start

    delay_minutes = day_delays[day.days]

    submissions = submission_repo.get_most_recent_submission_by_project(current_project,[current_user.Id])
    if current_user.Id not in submissions:
        return jsonify(submissions_remaining = 10, name = project.Name, end = project.End, Id = project.Id, max_submissions = 10, can_redeem = can_redeem, points=point, time_until_next_submission = "")

    submission = submissions[current_user.Id]
    time_for_next_submission = submission.Time + timedelta(minutes=delay_minutes)
    if submission_repo.unlock_check(current_user.Id,current_project):
        time_for_next_submission = submission.Time + timedelta(minutes=5)

    return jsonify(submissions_remaining = 10, name = project.Name, end = project.End, Id = project.Id, max_submissions = 10, can_redeem = can_redeem, points=point, time_until_next_submission = time_for_next_submission.isoformat())

@submission_api.route('/recentsubproject', methods=['POST'])
@jwt_required()
@inject
def recentsubproject(submission_repo: SubmissionRepository = Provide[Container.submission_repo], user_repo: UserRepository = Provide[Container.user_repo]):
    input_json = request.get_json()
    projectid = input_json['project_id']
    users = user_repo.get_all_users()
    studentattempts={}
    userids=[]
    for user in users:
        userids.append(user.Id)
    bucket = submission_repo.get_most_recent_submission_by_project(projectid, userids)    
    for user in users:
        holder = user.Firstname + " " + user.Lastname
        if user.Id in bucket:
            studentattempts[user.Id]=[holder,10,bucket[user.Id].Time.strftime("%x %X"),bucket[user.Id].IsPassing,bucket[user.Id].NumberOfPylintErrors,bucket[user.Id].Id]    
        else:
            studentattempts[user.Id]=[holder, "N/A", "N/A", "N/A",  "N/A", -1]
    return make_response(json.dumps(studentattempts), HTTPStatus.OK)


@submission_api.route('/get-score', methods=['GET'])
@jwt_required()
@inject
def get_score(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    submissionid = int(request.args.get("id"))
    score = 0
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        score = submission_repo.get_score(submissionid)
    else:
        score = submission_repo.get_submission_by_user_id(current_user.Id).Points
        
    return make_response(str(score), HTTPStatus.OK)


@submission_api.route('/extraday', methods=['GET'])
@jwt_required()
@inject
def extraday(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    project = project_repo.get_current_project()
    now = datetime.now()
    dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
    result = submission_repo.redeem_score(current_user.Id, project.Id,dt_string)
    if result:
        return make_response("", HTTPStatus.OK)
    return make_response("", HTTPStatus.NOT_ACCEPTABLE)

