from datetime import timedelta
import threading
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
from src.repositories.config_repository import ConfigRepository
from src.services.link_service import LinkService
from src.constants import EMPTY, DELAY_CONFIG, REDEEM_BY_CONFIG, ADMIN_ROLE
import json
from tap.parser import Parser
from flask import jsonify
from datetime import datetime
from dependency_injector.wiring import inject, Provide
from container import Container

submission_api = Blueprint('submission_api', __name__)


def convert_tap_to_json(file_path, role, current_level, hasLVLSYSEnabled):
    parser = Parser()
    test=[]
    final={}
    print(hasLVLSYSEnabled)
    for line in parser.parse_file(file_path):
        if line.category == "test":
            if role == ADMIN_ROLE or not hasLVLSYSEnabled:
                new_yaml = line.yaml_block.copy()
                new_yaml["hidden"] = "False"
                test.append({
                    'skipped': line.skip,
                    'passed': line.ok,
                    'test': new_yaml
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
def get_testcase_errors(submission_repo: SubmissionRepository = Provide[Container.submission_repo], config_repo: ConfigRepository = Provide[Container.config_repo]):
    submission_id = int(request.args.get("id"))
    class_id = int(request.args.get("class_id"))
    output_path = ""

    if submission_id != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submission_id)):
        output_path = submission_repo.get_json_path_by_submission_id(submission_id)
    else:
        output_path = submission_repo.get_json_path_by_user_id(current_user.Id)
        submission_id = submission_repo.get_submission_by_user_id(current_user.Id).Id

    project_id = submission_repo.get_project_by_submission_id(submission_id)
    current_level=submission_repo.get_current_level(project_id,current_user.Id)
    
    output = convert_tap_to_json(output_path,current_user.Role,current_level, False)

    return make_response(output, HTTPStatus.OK)

# TODO: Create new function to handle Java
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

    #delay_minutes = day_delays[day.days]
    delay_minutes =0
    submissions = submission_repo.get_most_recent_submission_by_project(current_project,[current_user.Id])
    if current_user.Id not in submissions:
        return jsonify(submissions_remaining = 10, name = project.Name, end = project.End, Id = project.Id, max_submissions = 10, can_redeem = can_redeem, points=point, time_until_next_submission = "01 Jan 1970 00:00:00 GMT")

    submission = submissions[current_user.Id]
    time_for_next_submission = submission.Time + timedelta(minutes=delay_minutes)
    if submission_repo.unlock_check(current_user.Id,current_project):
        time_for_next_submission = submission.Time + timedelta(minutes=5)
    if(current_user.Role == ADMIN_ROLE):
        time_for_next_submission = submission.Time + timedelta(minutes=0)
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
    submission_counter_dict = submission_repo.submission_counter(projectid, userids)
    user_lectures_dict =user_repo.get_user_lectures(userids)  
    for user in users:
        if user.Id in bucket:
            studentattempts[user.Id]=[user.Lastname,user.Firstname,user_lectures_dict[user.Id],submission_counter_dict[user.Id],bucket[user.Id].Time.strftime("%x %X"),bucket[user.Id].IsPassing,bucket[user.Id].NumberOfPylintErrors,bucket[user.Id].Id]    
        else:
            studentattempts[user.Id]=[user.Lastname,user.Firstname,user_lectures_dict[user.Id], "N/A", "N/A", "N/A",  "N/A", -1]
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
def extraday(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], config_repo: ConfigRepository = Provide[Container.config_repo]):
    #get current project
    current_project= project_repo.get_current_project().Id
    projects = project_repo.get_all_projects()
    previous_project_id = -1
    for proj in projects:
        if proj.Id == current_project:
            break
        previous_project_id = proj.Id    
    redeemable, _ = submission_repo.get_can_redeemed(config_repo, current_user.Id, previous_project_id, current_project)

    if redeemable:
        now = datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        result = submission_repo.redeem_score(current_user.Id, current_project, dt_string)
        if result:
            return make_response("", HTTPStatus.OK)
    return make_response("", HTTPStatus.NOT_ACCEPTABLE)





@submission_api.route('/ResearchGroup', methods=['GET'])
@jwt_required()
@inject
def Researchgroup(user_repo: UserRepository = Provide[Container.user_repo]):
    return make_response(user_repo.get_user_researchgroup(current_user.Id), HTTPStatus.OK)


@submission_api.route('/chatupload', methods=['GET'])
@jwt_required()
@inject
def chatupload(submission_repo: SubmissionRepository = Provide[Container.submission_repo],user_repo: UserRepository = Provide[Container.user_repo]):
    passFlag= 0
    student_code = (request.args.get("code"))
    student_question = (request.args.get("question"))
    mostRecentQTime=user_repo.get_user_chatSubTime(current_user.Id)
    datetime_object = datetime.strptime(mostRecentQTime, '%Y-%m-%d %H:%M:%S')

    api_key = user_repo.chatGPT_key()

    if datetime_object > datetime.now():
            message ="You are not able to ask TA-BOT another question yet, you will be able to resubmit at: "+ str( str(datetime_object.hour) +":"+str(datetime_object.minute))
    else:
        message=submission_repo.chatGPT_caller(student_code,student_question,api_key)
        if "TA-BOT" not in message:
            user_repo.set_user_chatSubTime(current_user.Id)
            passFlag=1
    user_repo.chat_question_logger(current_user.Id ,student_question,message,passFlag)
    
    return make_response(message, HTTPStatus.OK)
    #return make_response(NULL, HTTPStatus.OK)

@submission_api.route('/chatform', methods=['GET'])
@jwt_required()
@inject
def formUplod(user_repo: UserRepository = Provide[Container.user_repo]):
    q1 = int((request.args.get("q1")))
    q2 = int((request.args.get("q2")))
    q3 = (request.args.get("q3"))

    user_repo.chat_form_logger(current_user.Id,q1,q2,q3)
    return make_response("okay",HTTPStatus.OK)

@submission_api.route('/formcheck', methods=['GET'])
@jwt_required()
@inject
def formcheck(user_repo: UserRepository = Provide[Container.user_repo]):
    form_count =  user_repo.form_count(current_user.Id)
    submit_count = user_repo.gpt_submit_count(current_user.Id)
    print(form_count,flush=True)
    print(submit_count,flush=True)
    info={}
    info[current_user.Id] = form_count
    info[current_user.Id] = submit_count
    if form_count != submit_count:
        data = user_repo.get_missed_GPT_form(current_user.Id)
        question = str(data[0])
        response = str(data[1])
        return ([form_count,submit_count,question,response],HTTPStatus.OK)
    return ([form_count,submit_count],HTTPStatus.OK)



