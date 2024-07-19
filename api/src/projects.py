import ast
from collections import defaultdict
from io import BytesIO
import json
import os
import re
import shutil
import subprocess
import os.path
from typing import List
import zipfile
import stat
import sys
from subprocess import Popen
from src.repositories.class_repository import ClassRepository
from src.repositories.user_repository import UserRepository
from src.repositories.submission_repository import SubmissionRepository
from flask import Blueprint, Response, send_file
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
from datetime import datetime
from src.services.link_service import LinkService
import itertools

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
        class_name = project_repo.get_className_by_projectId(project.Id)
        if current_user.Id in subs: 
            sub = subs[current_user.Id]
            student_submissions[project.Name]=[sub.Id, sub.Points, sub.Time.strftime("%x %X"), class_name, str(project.ClassId)]
    return make_response(json.dumps(student_submissions), HTTPStatus.OK)

@projects_api.route('/submission-by-user-most-recent-project', methods=['GET'])
@jwt_required()
@inject
def get_submission_by_user_most_recent_project(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    projectId = str(request.args.get("projectId"))
    subs = submission_repo.get_most_recent_submission_by_project(projectId, [current_user.Id])
    temp =[]
    temp.append(subs[current_user.Id].Id)
    return make_response(json.dumps(temp), HTTPStatus.OK)
    


@projects_api.route('/create_project', methods=['POST'])
@jwt_required()
@inject
def create_project(project_repo: ProjectRepository = Provide[Container.project_repo], class_repo: ClassRepository = Provide[Container.class_repo], user_repo: UserRepository = Provide[Container.user_repo]):
    if 'file' not in request.files:
        print("NO FILE")
        message = {
            'message': 'No selected file'
        }
        return make_response(message, HTTPStatus.BAD_REQUEST)  
    if 'assignmentdesc' not in request.files:
        print("NO FILE")
        message = {
            'message': 'No assignment description file'
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
        start_date = request.form['start_date'].replace("T", " ")
    if  'end_date' in request.form:
        end_date = request.form['end_date'].replace("T", " ")
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
    "php": "php",
    "racket": "rkt"
    }

    filename =file.filename
    extension = os.path.splitext(filename)[1]
    classname = class_repo.get_class_name_withId(class_id)
    now = datetime.now()
    filename_datetime = now.strftime("%Y_%m_%d_%H_%M")

    print("Extension in projects: ", extension, flush=True)
    if extension != ".zip":
        name = re.sub(r'[^\w\-_\. ]', '_', name)
        name = name.replace(' ', '_')
        path = os.path.join("/ta-bot/project-files", f"{name}_{classname}_{filename_datetime}{extension}")
        filename = f"{name}_{classname}_{filename_datetime}-out"
        os.mkdir(os.path.join("/ta-bot", filename))
        file.save(path)
        file = request.files['assignmentdesc']
        assignmentdesc_path = os.path.join("/ta-bot/project-files", f"{classname}_{filename_datetime}_{name}.pdf")
        file.save(assignmentdesc_path)
    else:
        name = re.sub(r'[^\w\-_\. ]', '_', name)
        name = name.replace(' ', '_')
        path = os.path.join("/ta-bot/project-files", f"{name}_{classname}_{filename_datetime}")
        if os.path.isdir(path):
            shutil.rmtree(path)
        os.mkdir(path)
        with zipfile.ZipFile(file, "r") as zip_ref:
            zip_ref.extractall(path) 
        file = request.files['assignmentdesc']
        assignmentdesc_path = os.path.join("/ta-bot/project-files", f"{classname}_{filename_datetime}_{name}.pdf")
        filename = f"{name}_{classname}_{filename_datetime}-out"
        os.mkdir(os.path.join("/ta-bot", filename))
        file.save(assignmentdesc_path)
        
    #TODO: This is braindead, fix it
    project_id=project_repo.create_project(name, start_date, end_date, language,class_id,path, assignmentdesc_path)

    project_repo.levels_creator(project_id)

    return make_response(str(project_id), HTTPStatus.OK)

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
        start_date = request.form['start_date'].replace("T", " ")
    if  'end_date' in request.form:
        end_date = request.form['end_date'].replace("T", " ")
    if 'language' in request.form:
        language = request.form['language']
    path = project_repo.get_project_path(pid)
    assignmentdesc_path = project_repo.get_project_desc_path(pid)
    file = request.files.get('file')
    if file is not None:
        filename =file.filename
        extension = os.path.splitext(filename)[1]
        if os.path.isfile(path):
            try:
                file.save(path)
            except OSError as e:
                print("Error deleting file:", e)
                return make_response("Error deleting file", HTTPStatus.INTERNAL_SERVER_ERROR) 
        else: 
            try:
                if os.path.isdir(path):
                    shutil.rmtree(path)
                os.mkdir(path)
                with zipfile.ZipFile(file, "r") as zip_ref:
                    zip_ref.extractall(path)
            except OSError as e:
                print("Error deleting directory:", e)  
                return make_response("Error deleting directory", HTTPStatus.INTERNAL_SERVER_ERROR)      
            
    
    file = request.files.get('assignmentdesc')
    if file is not None:
        file.save(assignmentdesc_path)
    if name == '' or start_date == '' or end_date == '' or language == '':
        return make_response("Error in form", HTTPStatus.BAD_REQUEST)
    
    project_repo.edit_project(name, start_date, end_date, language, pid, path, assignmentdesc_path)
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
            project_repo.add_or_update_testcase(project_id, -1, testcase["levelname"], testcase["name"], testcase["description"], testcase["input"], testcase["output"], bool(testcase["isHidden"]), testcase["additionalfilepath"])
    return make_response("Testcase Added", HTTPStatus.OK)


@projects_api.route('/add_or_update_testcase', methods=['POST'])
@jwt_required()
@inject   
def add_or_update_testcase(project_repo: ProjectRepository = Provide[Container.project_repo]):
    path =""
    path =""
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
    if 'additionalfilepath' in request.form:
        path = request.form['additionalfilepath']
    if 'additionalFile' in request.files:
        additionalFile = request.files['additionalFile']
        counter = 1
        path = os.path.join("/ta-bot/project-files", f"duplicatenum({counter}){additionalFile.filename}")
        while os.path.isfile(path):
            path = os.path.join("/ta-bot/project-files", f"duplicatenum({counter}){additionalFile.filename}")
            counter += 1
        additionalFile.save(path)
    else:
        additionalFile = None
    
    if id_val == '' or name == '' or input_data == '' or project_id == '' or isHidden == '' or description == '':
        return make_response("Error in form", HTTPStatus.BAD_REQUEST)
    

    isHidden = True if isHidden.lower() =="true" else False
    
    project_repo.add_or_update_testcase(project_id, id_val, level_name, name, description, input_data, output, isHidden, path)
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
    data = project_repo.get_projects_by_class_id(request.args.get('id'))
    
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


@projects_api.route('/export_project_submissions', methods=['GET'])
@jwt_required()
@inject
def export_project_submissions(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    project_id = request.args.get('id')
    project = project_repo.get_selected_project(int(project_id))
    submission_path = "/ta-bot/" + project.solutionpath.split("/")[3].split(".")[0] + "-out"
    #For every submission, zip all files and folders in this path.
    zip_path = shutil.make_archive(submission_path, 'zip', submission_path)
    return send_file(zip_path, as_attachment=True)

@projects_api.route('/delete_project', methods=['POST', 'DELETE'])
@jwt_required()
@inject
def delete_project(project_repo: ProjectRepository = Provide[Container.project_repo], submission_repo: SubmissionRepository = Provide[Container.submission_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    project_id = request.args.get('id')
    
    project_repo.wipe_submissions(project_id)
    
    project_repo.delete_project(project_id)
    
    return make_response("Project reset", HTTPStatus.OK)

@projects_api.route('/getAssignmentDescription', methods=['GET'])
@jwt_required()
@inject
def getAssignmentDescription(project_repo: ProjectRepository = Provide[Container.project_repo]):
    
    project_id = request.args.get('project_id')
    assignmentdesc_contents = project_repo.get_project_desc_file(project_id)
    file_stream = BytesIO(assignmentdesc_contents)
    
    
    # Use send_file to send the PDF contents as a response
    return Response(
        file_stream.getvalue(),
        content_type='application/pdf',
        headers={'Content-Disposition': 'inline; filename=assignment_description.pdf'}
    )


#TODO: Complete this call
@projects_api.route('/getSubmissionSummary', methods=['GET'])
@jwt_required()
@inject
def getSubmissionSummary(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], class_repo: ClassRepository = Provide[Container.class_repo], user_repo: UserRepository = Provide[Container.user_repo], link_service: LinkService = Provide[Container.link_service]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    """
    Endpoint to fetch unique submissions for a specific project.
    The returned object is a list where the first element is the number of total unique submissions 
    and the second element is the total number of students in the course.

    :param submission_repo: SubmissionRepository instance provided by Dependency Injector
    :return: JSON response containing the list of unique submissions and HTTPStatus.OK
    """
    # Extract 'project_id' from the request arguments
    project_id = request.args.get('id')


    # Get list of users in the course

    class_Name = project_repo.get_className_by_projectId(project_id)
    class_Id = project_repo.get_class_id_by_name(class_Name)
    users=user_repo.get_all_users_by_cid(class_Id)
    user_ids = []
    for user in users:
        user_ids.append(user.Id)
    # Fetch unique submissions for the project from the repository
    user_submissions = submission_repo.get_most_recent_submission_by_project(project_id, user_ids)



    total_students = class_repo.get_studentcount(class_Id)
    holder = [len(user_submissions), total_students]



    testcase_results = {"Passed": {}, "Failed": {}}
    testcase_links = {}
    linting_results = {}

    # Get the Linting results for each submission, aggregate them, and return them as a dictionary with the key being the linting error and the value being the number of times it occurred
    for user in user_submissions:
        user = user_submissions[user]
        linting_results_user =""
        if user.LintingResults is None:
            continue
        try:
            linting_results_user = ast.literal_eval(user.LintingResults)
        except Exception as e:
            print("Error parsing linting results: ", str(e), flush=True)
            continue
        for key in linting_results_user:
            if key not in linting_results:
                linting_results[key] = linting_results_user[key]
            else:
                linting_results[key] += linting_results_user[key]
    # Get the Testcase Results for each submission, aggregate them, with the key being "passed" or "failed" and the value being a dictionary with the key being the testcase name and the value being the number of times it occurred
        testcase_results_user =""
        if user.TestCaseResults is None:
            continue
        try:
            testcase_results_user = ast.literal_eval(user.TestCaseResults)
        except Exception as e:
            print("Error parsing testcase results: ", str(e), flush=True)
            continue
        for status in ['Passed', 'Failed']:
            if status in testcase_results_user:
                for test_case in testcase_results_user[status]:
                    for test_name, level in test_case.items():
                        if test_name not in testcase_results[status]:
                            testcase_results[status][test_name] = 1
                        else:
                            testcase_results[status][test_name] += 1
    pass_averages = {}

    # Generates pass averages for each test case
    for test_case in set(testcase_results['Passed'].keys()).union(testcase_results['Failed'].keys()):
        pass_count = testcase_results['Passed'].get(test_case, 0)
        fail_count = testcase_results['Failed'].get(test_case, 0)
        total = pass_count + fail_count
        pass_averages[test_case] = (pass_count / total) * 100 if total != 0 else 0

    dates, passed, failed, no_submission = submission_repo.day_to_day_visualizer(project_id, user_ids)
    submission_heatmap, potential_students_list = submission_repo.get_all_submission_times(project_id)

    ## Sort Linting results based on the number of times they occurred, only send top 6 most common linting errors
    linting_results = {k: v for k, v in itertools.islice(sorted(linting_results.items(), key=lambda item: item[1], reverse=True), 6)}

    # Sort Testcase results based on the number of times they occurred, only send the worst 6 averages
    pass_averages = {k: v for k, v in itertools.islice(sorted(pass_averages.items(), key=lambda item: item[1], reverse=False), 6)}
    return make_response(json.dumps({"LintData":linting_results, "UniqueSubmissions": holder, "TestCaseResults": pass_averages, "dates": dates, "passed": passed, "failed": failed, "noSubmission": no_submission, "submissionHeatmap": submission_heatmap, "PotentialAtRisk": potential_students_list }), HTTPStatus.OK)

@projects_api.route('/AtRiskStudents', methods=['GET'])
@jwt_required()
@inject
def AtRiskStudents(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], class_repo: ClassRepository = Provide[Container.class_repo], user_repo: UserRepository = Provide[Container.user_repo], link_service: LinkService = Provide[Container.link_service]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'You do not have permission to do this!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
    project_id = request.args.get('id')
    no_submission_prior_assignment = []
    failing_two_out_of_three = []
    high_failing_rate = []

    class_Name = project_repo.get_className_by_projectId(project_id)
    class_Id = project_repo.get_class_id_by_name(class_Name)
    users=user_repo.get_all_users_by_cid(class_Id)
    user_ids = [user.Id for user in users]

    projects = project_repo.get_projects_by_class_id(class_Id)
    projects = sorted(projects, key=lambda project: project.End)
    
    if len(projects) == 0 or len(projects)==1:
        return make_response(json.dumps({"noSubmission": no_submission_prior_assignment, "TwoOutThree": failing_two_out_of_three, "HighFailRate" : high_failing_rate}), HTTPStatus.OK) 
    no_submission_prior_assignment = list(user_ids)
    
    current_asn_index = 0
    for project in projects:
        if project.Id == int(project_id):
            break
        current_asn_index += 1
    """
    These next two parts of this function identifies students who may be at risk based on two criteria:

    1. Students who did not submit anything for the previous assignment.
    2. Students who submitted more than 10 times for the previous assignment but did not achieve a passing grade.

    This is considered the first level of risk assessment for students.
    """
    # Get students who did not submit anything for the previous assignment
    try:
        holder = submission_repo.get_most_recent_submission_by_project(projects[current_asn_index - 1].Id, user_ids) # TODO: get all submissions for the previous assignment
        for key in holder:
            if key in no_submission_prior_assignment:
                no_submission_prior_assignment.remove(key)
    except Exception as e:
        no_submission_prior_assignment = []
        print("An error occurred or no prior submissions: ", str(e), flush=True)

    # Get students who submitted more than 10 times for the previous assignment but did not achieve a passing result
    try:
        high_subs_failing={}
        holder = submission_repo.get_all_submissions_for_project(projects[current_asn_index - 1].Id) #TODO: get all submissions for the previous assignment
        temp = {}
        for submission in holder:
            if submission.User not in temp:
                temp[submission.User] = [1, submission.IsPassing]
            else:
                if submission.IsPassing==1:
                    temp[submission.User][0] += 1
                    temp[submission.User][1] = submission.IsPassing
                else:
                    temp[submission.User][0] += 1
                    if temp[submission.User][1] == 0:
                        temp[submission.User][1] = submission.IsPassing
        for key in temp:
            if temp[key][1] == 0 and temp[key][0] >= 10:
                high_subs_failing[key] = [temp[key][0], project.Id]
    except Exception as e:
        high_subs_failing = {}
        print("An error occurred or no prior asn High_subs_failing: ", str(e), flush=True)

    # Go through the prior assignments and get users who have failed two out of three most recent assignments
    failing_two_out_of_three = {}

    if current_asn_index >=3 and projects[current_asn_index-1] is not None and projects[current_asn_index-2] is not None and projects[current_asn_index-3] is not None:
        temp = [projects[current_asn_index-1].Id, projects[current_asn_index-2].Id, projects[current_asn_index-3].Id]
        for project_id in temp:
            submissions  = submission_repo.get_most_recent_submission_by_project(project_id, user_ids)
            for user_id in user_ids:
                passed_flag = False
                made_submission = False
                for submission in submissions:
                    if submissions[submission].User == user_id:
                        made_submission = True
                        if submissions[submission].IsPassing == 1:
                            passed_flag = True
                if not passed_flag or not made_submission:
                    if user_id not in failing_two_out_of_three:
                        failing_two_out_of_three[user_id] = 1
                    else:
                        failing_two_out_of_three[user_id] += 1
    """
    The next portion of this function identifies the severity of a student's risk based on the following criteria:
    1. Students who have failed two out of three most recent assignments.
    2. Students who have not made a submission for the previous assignment.
    3. Students who have submitted more than 10 times for the previous assignment but did not achieve a passing grade.
    
    No prior submission = 1
    More than 10 submissions without passing = 2
    failing two out of three = 3
    No prior submission + failing two out of three = 4
    More than 10 submissions without passing + failing two out of three = 5    
    
    """
    NO_PRIOR_ONLY = 1
    HIGH_SUBS_FAIL_ONLY = 2
    FAIL_TWO_OUT_OF_THREE_ONLY = 3
    NO_PRIOR_PLUS_FAIL_TWO_OUT_OF_THREE = 4
    HIGH_SUBS_FAIL_PLUS_FAIL_TWO_OUT_OF_THREE = 5

    at_riskstudents ={}

    for value in no_submission_prior_assignment:
        if value not in failing_two_out_of_three:
            at_riskstudents[value] = NO_PRIOR_ONLY
        if value in failing_two_out_of_three:
            at_riskstudents[value] = NO_PRIOR_PLUS_FAIL_TWO_OUT_OF_THREE
    for value in high_subs_failing:
        if value not in failing_two_out_of_three:
            at_riskstudents[value] = HIGH_SUBS_FAIL_ONLY 
        if value in failing_two_out_of_three:
            at_riskstudents[value] = HIGH_SUBS_FAIL_PLUS_FAIL_TWO_OUT_OF_THREE
    for value in failing_two_out_of_three:
        if value not in at_riskstudents:
            at_riskstudents[value] = FAIL_TWO_OUT_OF_THREE_ONLY
    
    for key in at_riskstudents:
        user = user_repo.get_user(key)
        counter = 0
        for project in projects:
            counter += submission_repo.get_number_of_questions_asked(project.Id, key)
        at_riskstudents[key] = [at_riskstudents[key], user.Firstname + " " + user.Lastname, counter, user.Email]
    
    message = {
        'message': 'Success'
    }
    return make_response(json.dumps({"AtRiskStudents": at_riskstudents}), HTTPStatus.OK)



@projects_api.route('/ProjectGrading', methods=['POST'])
@jwt_required()
@inject
def ProjectGrading(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], class_repo: ClassRepository = Provide[Container.class_repo], user_repo: UserRepository = Provide[Container.user_repo], link_service: LinkService = Provide[Container.link_service]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'You do not have permission to do this!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
    input_json = request.get_json()
    project_id = input_json['ProjectId']
    user_id = input_json['userID']
    submissions = submission_repo.get_most_recent_submission_by_project(project_id, [user_id])
    test_info = []
    grading_data ={}
    student_code = ""
    project_language = project_repo.get_selected_project(project_id).Language
    student_pylint = None
    if user_id in submissions:
        student_code = submission_repo.read_code_file(submissions[user_id].CodeFilepath)
        student_output = submission_repo.read_output_file(submissions[user_id].OutputFilepath)
        current_test = {}
        current_test = {'name': None, 'level': None, 'output': None}
        in_test = False
        in_output = False
        Passed=False
        for line in student_output.split('\n'):
            if line.startswith(('not ok', 'ok')):
                Passed = line.startswith('ok')
                in_test = True
                current_test = {'name': None, 'level': None, "State": Passed, 'output': None}
            elif "name:" in line and in_test and not in_output:
                current_test['name'] = line.split('\'')[1] 
            elif "suite:" in line and in_test and not in_output:
                current_test['level'] = line.split('\'')[1]
            elif "output" in line and in_test and not in_output:
                in_output = True
                output = ""
            elif "..." in line and in_test and in_output:
                current_test['output'] = output                    
                test_info.append(current_test)
                in_test = False
                in_output = False
            elif in_output and in_test:
                    output += line
        grading_data[user_id] = [student_code, test_info]
    else:
        grading_data[user_id] = ["", ""]
    message = {
        'message': 'Success'
    }
    return make_response(json.dumps({ "Code": student_code, "TestResults": test_info, "Language": project_language}), HTTPStatus.OK)








@projects_api.route('/AtRiskStudentDetail', methods=['GET'])
@jwt_required()
@inject
def AtRiskStudentDetail(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], class_repo: ClassRepository = Provide[Container.class_repo], user_repo: UserRepository = Provide[Container.user_repo], link_service: LinkService = Provide[Container.link_service]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'You do not have permission to do this!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
    user_id = request.args.get('id')
    project_id = request.args.get('project_id')
    class_Name = project_repo.get_className_by_projectId(project_id)
    class_Id = project_repo.get_class_id_by_name(class_Name)
    projects = project_repo.get_projects_by_class_id(class_Id)
    projects = sorted(projects, key=lambda project: project.End, reverse=False)

    submissions = submission_repo.get_all_submissions_for_user(user_id)
    count = {}
    for submission in submissions:
        if submission.Project not in count:
            count[submission.Project] = 1
        else:
            count[submission.Project] += 1
    
    data = {}
    total_OH_questions = 0
    current_OH_questions = 0
    student_questions =[]
    for project in projects:
        questions = submission_repo.get_student_questions_asked(user_id, project.Id)
        if len(questions) > 0:
            questions = [question.StudentQuestionscol for question in questions]
            for question in questions:
                if project.Id == int(project_id):
                    total_OH_questions += 1
                    current_OH_questions += 1
                else:
                    total_OH_questions += 1
                student_questions.append([project.Name, question])
    for project in projects:
        if project.Id in count:
            data[project.Name] = count[project.Id]
        else:
            data[project.Name] = 0

    return make_response(json.dumps({"StudentData": data, "currentOHQCount": current_OH_questions, "AllOHQCount": total_OH_questions, "OHQuestionsDetails": student_questions}), HTTPStatus.OK)



@projects_api.route('/unlockStudentAccount', methods=['POST'])
@jwt_required()
@inject
def unlockStudentAccount(user_repo: UserRepository = Provide[Container.user_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'You do not have permission to do this!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
    input_json = request.get_json()
    user_Id = input_json['UserId']
    user_repo.unlock_student_account(user_Id)
    message = {
        'message': 'Success'
    }
    return make_response(message, HTTPStatus.OK)






