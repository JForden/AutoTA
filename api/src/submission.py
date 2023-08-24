from datetime import timedelta
import os
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
    for line in parser.parse_file(file_path):
        if line.category == "test":
            if role == ADMIN_ROLE or not hasLVLSYSEnabled:
                if line.yaml_block is not None:
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
def get_testcase_errors(submission_repo: SubmissionRepository = Provide[Container.submission_repo], config_repo: ConfigRepository = Provide[Container.config_repo],project_repo:  ProjectRepository = Provide[Container.project_repo]):
    class_id = int(request.args.get("class_id"))
    submission_id = int(request.args.get("id"))
    if submission_id != -1:
        projectid = submission_repo.get_project_by_submission_id(submission_id)
        submission = submission_repo.get_submission_by_submission_id(submission_id)
        current_level = submission_repo.get_current_level(submission_id, submission.User)
    else:
        projectid = project_repo.get_current_project_by_class(class_id).Id
        submission = submission_repo.get_submission_by_user_and_projectid(current_user.Id,projectid)
        current_level=submission_repo.get_current_level(submission.Id,current_user.Id)
    
    print("Submission ID: ", submission.Id, "outfile", submission.OutputFilepath, "cur levl", current_level, flush=True)
    output = convert_tap_to_json(submission.OutputFilepath,current_user.Role,current_level, False)

    return make_response(output, HTTPStatus.OK)

# TODO: Create new function to handle Java and C
@submission_api.route('/lint_output', methods=['GET'])
@jwt_required()
@inject
def lint_output(submission_repo: SubmissionRepository = Provide[Container.submission_repo], link_service: LinkService = Provide[Container.link_service],project_repo:  ProjectRepository = Provide[Container.project_repo]):
    submissionid = int(request.args.get("id"))
    class_id = int(request.args.get("class_id"))
    #TODO: Review if this {if statement} logic makes sense
    project = project_repo.get_current_project_by_class(class_id)
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        lint_file = submission_repo.get_pylint_path_by_submission_id(submissionid)
    else:
        lint_file = submission_repo.get_pylint_path_by_user_and_project_id(current_user.Id,project.Id)

    lint_dir = lint_file.replace(f"{current_user.Username}.out.lint", '')
    lint_files = [lint_dir+filename for filename in os.listdir(lint_dir) if filename.endswith(".out.lint")]
    print("Lint dir ", lint_dir, flush=True)
    print("Lint dir list ", lint_files, flush=True)

    outputs = []    
    for lf in lint_files:
        with open(lf, 'r') as file: # lint_file
            output=""
            output = file.read()
            #TODO: Move this link service elsewhere
            if output != "":
                try:
                    # Check if output is in JSON format
                    json.loads(output)
                except json.JSONDecodeError:
                    # If output is not in JSON format, skip running link_service
                    #json.loads(output)
                    print("Output is not in JSON format, skipping link_service.")
                else:
                    # If output is in JSON format, run link_service
                    if project.Language == "python":
                        output = link_service.add_link_info_links(output)
                outputs.append(output)
    return make_response(outputs[0], HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@inject
def codefinder(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    submissionid = int(request.args.get("id"))
    class_id = int(request.args.get("class_id"))
    code_output = ""
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        code_output = submission_repo.get_code_path_by_submission_id(submissionid)
    else:
        projectid = project_repo.get_current_project_by_class(class_id).Id
        code_output = submission_repo.get_submission_by_user_and_projectid(current_user.Id,projectid).CodeFilepath
    output = ""
    outputs = []
    if not os.path.isdir(code_output):
        with open(code_output, 'r') as file:
            output = file.read()
            outputs.append(output)
    else:
        # these files are all files in submission directory
        #files = [filename for filename in os.listdir(code_output)] #  if filename.endswith('.java') <-- why java?
        files = [filename for filename in os.listdir(code_output) if filename.endswith(".java") or filename.endswith(".c")]
        for f in files:
            if "Main.java" in files:
                with open(code_output + "/" + "Main.java") as file:
                    output = file.read()
            else:
                with open(code_output + "/" + f) as file: # files[0]
                    output = file.read()
            outputs.append(output)

    return make_response(outputs[0], HTTPStatus.OK)

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
def recentsubproject(submission_repo: SubmissionRepository = Provide[Container.submission_repo], user_repo: UserRepository = Provide[Container.user_repo],project_repo: ProjectRepository = Provide[Container.project_repo] ):
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
    class_name = project_repo.get_className_by_projectId(projectid)
    class_id = project_repo.get_class_id_by_name(class_name)
    for user in users:
        if user.Id in bucket:
            studentattempts[user.Id]=[user.Lastname,user.Firstname,user_lectures_dict[user.Id],submission_counter_dict[user.Id],bucket[user.Id].Time.strftime("%x %X"),bucket[user.Id].IsPassing,bucket[user.Id].NumberOfPylintErrors,bucket[user.Id].Id, str(class_id)]    
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


@submission_api.route('/gptData', methods=['GET'])
@jwt_required()
@inject
def gptData(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    print("In GPT call", flush=True)
    question_description = str(request.args.get("description"))
    output = str(request.args.get("output"))
    code_data = str(request.args.get("code"))
    submissionid = submission_repo.get_submission_by_user_id(current_user.Id).Id
    return make_response(submission_repo.chatGPT_caller(submissionid,question_description, output, code_data), HTTPStatus.OK)



@submission_api.route('/gptexplainer', methods=['GET'])
@jwt_required()
@inject
def gptexplainer(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    question_description = str(request.args.get("description"))
    output = str(request.args.get("output"))
    submissionid = submission_repo.get_submission_by_user_id(current_user.Id).Id
    return make_response(submission_repo.chatGPT_explainer(submissionid,question_description, output), HTTPStatus.OK)

@submission_api.route('/ResearchGroup', methods=['GET'])
@jwt_required()
@inject
def Researchgroup(user_repo: UserRepository = Provide[Container.user_repo]):
    return make_response(user_repo.get_user_researchgroup(current_user.Id), HTTPStatus.OK)

@submission_api.route('/updateGPTStudentFeedback', methods=['GET'])
@jwt_required()
@inject
def update_GPT_Student_feedback(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    qid = str(request.args.get("questionId"))
    student_feedback = str(request.args.get("student_feedback"))
    return make_response(submission_repo.Update_GPT_Student_Feedback(qid,student_feedback), HTTPStatus.OK)


@submission_api.route('/submitOHquestion', methods=['GET'])
@jwt_required()
@inject
def Submit_OH_Question(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    question = str(request.args.get("question"))
    project_id = str(request.args.get("projectId"))
    return make_response(submission_repo.Submit_Student_OH_question(question,current_user.Id, project_id), HTTPStatus.OK)

@submission_api.route('/getOHquestions', methods=['GET'])
@jwt_required()
@inject
def Get_OH_Questions(submission_repo: SubmissionRepository = Provide[Container.submission_repo], user_repo: UserRepository = Provide[Container.user_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    questions = submission_repo.Get_all_OH_questions()
    question_list = []
    #Need class ID and submission ID
    for question in questions:
        user = user_repo.get_user(question.StudentId)
        Student_name = user.Firstname + " " + user.Lastname
        class_name = project_repo.get_className_by_projectId(question.projectId)
        class_id = project_repo.get_class_id_by_name(class_name)
        subs = submission_repo.get_most_recent_submission_by_project(question.projectId, [question.StudentId])
        try:
            question_list.append([question.Sqid,question.StudentQuestionscol, question.TimeSubmitted.strftime("%x %X"), Student_name, question.ruling, question.projectId, class_id, subs[question.StudentId].Id])
            question_list.append([question.Sqid,question.StudentQuestionscol, question.TimeSubmitted.strftime("%x %X"), Student_name, question.ruling, question.projectId, class_id, -1])
        except:
            question_list.append([question.Sqid,question.StudentQuestionscol, question.TimeSubmitted.strftime("%x %X"), Student_name, question.ruling, question.projectId, class_id, -1])
    return make_response(json.dumps(question_list), HTTPStatus.OK)


@submission_api.route('/submitOHQuestionRuling', methods=['GET'])
@jwt_required()
@inject
def Submit_OH_Question_Ruling(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    question_id = str(request.args.get("question_id"))
    ruling = str(request.args.get("ruling"))
    return make_response(submission_repo.Submit_OH_ruling(question_id,ruling), HTTPStatus.OK)

#dismiss question
@submission_api.route('/dismissOHQuestion', methods=['GET'])
@jwt_required()
@inject
def Dismiss_OH_Question(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    question_id = str(request.args.get("question_id"))
    return make_response(submission_repo.Submit_OH_dismiss(question_id), HTTPStatus.OK)

@submission_api.route('/getactivequestion', methods=['GET'])
@jwt_required()
@inject
def get_active_Question(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    return make_response(str(submission_repo.get_active_question(current_user.Id)), HTTPStatus.OK)

