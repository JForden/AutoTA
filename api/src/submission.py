from datetime import timedelta
import os
import threading

import requests
import urllib3
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
from src.constants import EMPTY, DELAY_CONFIG, REDEEM_BY_CONFIG, ADMIN_ROLE, TA_ROLE
import json
from tap.parser import Parser
from flask import jsonify
from datetime import datetime
from dependency_injector.wiring import inject, Provide
from container import Container
from urllib.parse import unquote

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
    projectid = -1
    submission = None
    if submission_id != -1:
        projectid = submission_repo.get_project_by_submission_id(submission_id)
        submission = submission_repo.get_submission_by_submission_id(submission_id)
        current_level = submission_repo.get_current_level(submission_id, submission.User)
    else:
        projectid = project_repo.get_current_project_by_class(class_id).Id
        submission = submission_repo.get_submission_by_user_and_projectid(current_user.Id,projectid)
        current_level=submission_repo.get_current_level(submission.Id,current_user.Id)
    output = convert_tap_to_json(submission.OutputFilepath,current_user.Role,current_level, False)
    if(current_user.Role == ADMIN_ROLE or current_user.Role == TA_ROLE):
        return make_response(output, HTTPStatus.OK)
    else:
        #call get-timout to see if user is in timeout
        timeout = submission_repo.check_visibility(current_user.Id, projectid)
        if timeout == True:
            return make_response(output, HTTPStatus.OK)
        else:
            output_dict = json.loads(output)    
            for test_item in output_dict["results"]:
                test_item["test"]["hidden"] = "True"
            # Convert the modified dictionary back to a JSON string
            output = json.dumps(output_dict, sort_keys=True, indent=4)
        # If user is in timeout, go through output and   
    return make_response(output, HTTPStatus.OK)

# TODO: Create new function to handle Java and C
@submission_api.route('/lint_output', methods=['GET'])
@jwt_required()
@inject
def lint_output(submission_repo: SubmissionRepository = Provide[Container.submission_repo], link_service: LinkService = Provide[Container.link_service],project_repo:  ProjectRepository = Provide[Container.project_repo]):
    submissionid = int(request.args.get("id"))
    class_id = int(request.args.get("class_id"))
    project = project_repo.get_current_project_by_class(class_id)
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
        lint_file = submission_repo.get_pylint_path_by_submission_id(submissionid)
    else:
        lint_file = submission_repo.get_pylint_path_by_user_and_project_id(current_user.Id,project.Id)
    
    lint_files=[lint_file]
    #lint_dir = lint_file.replace(f"{current_user.Username}.out.lint", '')
    #lint_files = [lint_dir+filename for filename in os.listdir(lint_dir) if filename.endswith(".out.lint")]
    outputs = []    
    for lf in lint_files:
        with open(lf, 'r') as file: # lint_file
            output=""
            output = file.read()
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
                    output = link_service.add_link_info_links(output)
                outputs.append(output)
    try:
        outputs = outputs[0]
    except IndexError:
        outputs = ""
    return make_response(outputs, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@inject
def codefinder(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    submissionid = int(request.args.get("id"))
    class_id = int(request.args.get("class_id"))
    code_output = ""
    if submissionid != EMPTY and (current_user.Role == ADMIN_ROLE or current_user.Role == TA_ROLE or submission_repo.submission_view_verification(current_user.Id,submissionid)):
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

#TODO: This entire API call can probably be removed
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
    if(current_user.Role != ADMIN_ROLE):
        return make_response("Not Authorized", HTTPStatus.UNAUTHORIZED)
    input_json = request.get_json()
    projectid = input_json['project_id']
    class_name = project_repo.get_className_by_projectId(projectid)
    class_id = project_repo.get_class_id_by_name(class_name)
    users = user_repo.get_all_users_by_cid(class_id)
    studentattempts={}
    userids=[]
    for user in users:
        userids.append(user.Id)
    bucket = submission_repo.get_most_recent_submission_by_project(projectid, userids)    
    submission_counter_dict = submission_repo.submission_counter(projectid, userids)
    user_lectures_dict =user_repo.get_user_lectures(userids, class_id)
    for user in users:
        if int(user.Role) == 0:
            if user.Id in bucket:
                student_grade = project_repo.get_student_grade(projectid, user.Id)
                student_id = user_repo.get_StudentNumber(user.Id)
                studentattempts[user.Id]=[user.Lastname,user.Firstname,user_lectures_dict[user.Id],submission_counter_dict[user.Id],bucket[user.Id].Time.strftime("%x %X"),bucket[user.Id].IsPassing,bucket[user.Id].NumberOfPylintErrors,bucket[user.Id].Id, str(class_id), student_grade, student_id, user.IsLocked]    
            else:
                student_grade = "0"
                student_id = user_repo.get_StudentNumber(user.Id)
                studentattempts[user.Id]=[user.Lastname,user.Firstname,user_lectures_dict[user.Id], "N/A", "N/A", "N/A",  "N/A", -1, "N/A", student_grade, student_id, user.IsLocked]
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


#TODO: This API call can probably be removed
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
    question_description = str(request.args.get("description"))
    output = str(request.args.get("output"))
    code_data = str(request.args.get("code"))
    submissionid = int(request.args.get("submissionId"))
    return make_response(submission_repo.chatGPT_caller(submissionid,question_description, output, code_data), HTTPStatus.OK)

@submission_api.route('/gptexplainer', methods=['GET'])
@jwt_required()
@inject
def gptexplainer(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    question_description = str(request.args.get("description"))
    output = str(request.args.get("output"))
    submissionid = int(request.args.get("submissionId"))
    if submissionid == -1 and current_user.Role != ADMIN_ROLE:
        submissionid = submission_repo.get_submission_by_user_id(current_user.Id).Id
    return make_response(submission_repo.chatGPT_explainer(submissionid,question_description, output), HTTPStatus.OK)

@submission_api.route('/gptDescription', methods=['GET'])
@jwt_required()
@inject
def gptDescription(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    input = str(request.args.get("input"))
    project_id = int(request.args.get("projectId"))
    project = project_repo.get_selected_project(project_id)
    return make_response(json.dumps({ "description": submission_repo.descriptionGPT_caller(project.solutionpath,input, project_id)}), HTTPStatus.OK)


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
    user_id, class_id = submission_repo.Submit_OH_dismiss(question_id)
    reward_amount = 2
    submission_repo.add_reward_charge(user_id, class_id, reward_amount)
    return make_response("ok", HTTPStatus.OK)

@submission_api.route('/getactivequestion', methods=['GET'])
@jwt_required()
@inject
def get_active_Question(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    return make_response(str(submission_repo.get_active_question(current_user.Id)), HTTPStatus.OK)

@submission_api.route('/GetSubmissionDetails', methods=['GET'])
@jwt_required()
@inject
def get_remaining_OH_Time(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    classId = str(request.args.get("class_id"))
    submission_details = []
    try:
        projectId = project_repo.get_current_project_by_class(classId).Id
    except Exception as e:
        return make_response({"error": str(e)}, 500)
    submission_details.append(str(submission_repo.get_remaining_OH_Time(current_user.Id, projectId)))
    project = project_repo.get_project(projectId)
    start_time = project.get(projectId)[1]
    start_date = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S")
    current_time = datetime.now()
    #get days passed 
    days_passed = (current_time - start_date).days
    submission_details.append(str(days_passed))
    time_until_next_submission = submission_repo.check_timeout(current_user.Id, projectId)[1]
    if time_until_next_submission != "None":
        hours = time_until_next_submission.seconds // 3600
        minutes = (time_until_next_submission.seconds % 3600) // 60
        seconds = time_until_next_submission.seconds % 60
        time_until_next_submission_str = f"{hours} hours, {minutes} minutes, {seconds} seconds"
        submission_details.append(time_until_next_submission_str)
    else:
        submission_details.append("None")
    return make_response(submission_details, HTTPStatus.OK)

@submission_api.route('/submitgrades', methods=['POST'])
@jwt_required()
@inject
def submit_grades(project_repo: ProjectRepository = Provide[Container.project_repo]):
    if(current_user.Role != ADMIN_ROLE):
        return make_response("Not Authorized", HTTPStatus.UNAUTHORIZED)
    #spacing issue
    data = request.get_json()
    project_id = data['projectID']
    userId = data['userId']
    grade = data['grade']
    project_repo.set_student_grade(int(project_id), int(userId), int(grade))
    return make_response("StudentGrades Submitted", HTTPStatus.OK)



@submission_api.route('/getprojectscores', methods=['GET'])
@jwt_required()
@inject
def getprojectscores(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo], user_repo: UserRepository = Provide[Container.user_repo]):
    project_id = str(request.args.get("projectID"))
    data = []
    student_scores = submission_repo.get_project_scores(project_id)
    projectname = project_repo.get_selected_project(project_id).Name
    for score in student_scores:
        user_info = user_repo.get_user(score[0])
        data.append([user_info.StudentNumber, score[1], user_info.Id])
    return make_response(json.dumps({"studentData": data, "projectName": projectname}), HTTPStatus.OK)

@submission_api.route('/getprojectname', methods=['GET'])
@jwt_required()
@inject
def get_project_name(project_repo: ProjectRepository = Provide[Container.project_repo]):
    project_id = str(request.args.get("projectID"))
    print("project id", project_id, flush=True)
    return make_response(project_repo.get_selected_project(project_id).Name, HTTPStatus.OK)

@submission_api.route('/submit_suggestion', methods=['POST'])
@jwt_required()
@inject
def submit_Suggestion(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    data = request.get_json()
    suggestion = data['suggestion']
    submission_repo.submitSuggestion(current_user.Id ,suggestion)
    return make_response("Suggestion Submitted", HTTPStatus.OK)



@submission_api.route('/run_code_snippet', methods=['GET'])
@jwt_required()
@inject
def run_code_snippet(submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    student_code = unquote(request.args.get("code"))
    test_case_input = unquote(request.args.get("input"))
    language = str(request.args.get("language"))


    BASE_URL ="https://piston.tabot.sh/api/v2/execute"

    results = {}
    files = []
    files.append({ "name": "CodeSnippit", "content": student_code })
    results["language"] = language
    results["version"] = "*"
    results["files"] = files
    results["stdin"] = test_case_input + "\n"

    try:
        response = requests.post(BASE_URL, data=json.dumps(results), headers={ "Content-Type": "application/json" })
        snippit_output = ""
        if(response.ok):
            output_obj = response.json()
            for key, value in output_obj.items():
                if key == 'run':
                    syntax_error = value.get('stderr', '')
                    if syntax_error != '':
                        snippit_output = syntax_error.split(",")[1]
                    else:
                        snippit_output = value.get('stdout', '')
            print(output_obj, flush=True)
    except Exception as e:
        print("Error: ", e, flush=True)
        snippit_output = "Error: " + str(e)
    try:
        submission_repo.log_code_snippet(current_user.Id, student_code, language, snippit_output, language)
    except Exception as e:
        print("Unable to log code snippet", e, flush=True)
    return make_response(snippit_output, HTTPStatus.OK)



@submission_api.route('/GetCharges', methods=['GET'])
@jwt_required()
@inject
def GetCharges(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    class_id = int(request.args.get("class_id"))
    projectId = project_repo.get_current_project_by_class(class_id).Id
    base_charge, reward_charge = submission_repo.get_charges(current_user.Id, class_id, projectId)
    
    hours_until_recharge = 0
    minutes_until_recharge = 0
    seconds_until_recharge = 0
    if base_charge != 3:
        time_until_recharge = submission_repo.get_time_until_recharge(current_user.Id, class_id, projectId)
        # Convert time_until_recharge to hours, minutes, and seconds
        hours_until_recharge, remainder = divmod(time_until_recharge.total_seconds(), 3600)
        minutes_until_recharge, seconds_until_recharge = divmod(remainder, 60)

    return make_response(json.dumps({"baseCharge": base_charge, "rewardCharge": reward_charge, "HoursUntilRecharge": str(hours_until_recharge), "MinutesUntilRecharge": str(minutes_until_recharge), "SecondsUntilRecharge": str(seconds_until_recharge)}) , HTTPStatus.OK)
    

@submission_api.route('/ConsumeCharge', methods=['GET'])
@jwt_required()
@inject
def ConsumeCharge(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    try:
        class_id = int(request.args.get("class_id"))
        projectId = project_repo.get_current_project_by_class(class_id).Id
        submission_repo.consume_reward_charge(current_user.Id, class_id, projectId)
    except Exception as e:   
        print("Error: ", e, flush=True)
        return make_response("Error: " + str(e), HTTPStatus.INTERNAL_SERVER_ERROR)
    return make_response("Charge Consumed", HTTPStatus.OK)

@submission_api.route('/submitChat', methods=['GET'])
@jwt_required()
@inject
def submitChat(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    try:
        project_id = int(request.args.get("project_id"))
        class_Name = project_repo.get_className_by_projectId(project_id)
        class_Id = project_repo.get_class_id_by_name(class_Name)
        language = str(request.args.get("language"))
        student_code = unquote(request.args.get("code"))
        message = str(request.args.get("message"))
        #TODO: Response to
        #response_to = int(request.args.get("response_to"))
        response_to = 0
        project_repo.submit_student_chat(current_user.Id, class_Id, project_id, message, student_code, language, response_to)
    except Exception as e:   
        print("Error: ", e, flush=True)
        return make_response("Error: " + str(e), HTTPStatus.INTERNAL_SERVER_ERROR)
    return make_response("Charge Consumed", HTTPStatus.OK)