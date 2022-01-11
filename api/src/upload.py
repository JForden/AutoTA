from flask.json import jsonify
from src.repositories.config_repository import ConfigRepository
import json
import os
import subprocess
import os.path
from typing import List
import zipfile

from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from flask import Blueprint
from flask import request
from flask import make_response
from flask import current_app
from http import HTTPStatus
from datetime import datetime
from flask_cors import cross_origin

from src.repositories.models import Levels
from src.repositories.submission_repository import SubmissionRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.repositories.class_repository import ClassRepository
from src.repositories.config_repository import ConfigRepository
from src.services.timeout_service import on_timeout
from tap.parser import Parser
from dependency_injector.wiring import inject, Provide
from container import Container
from src.constants import ADMIN_ROLE


upload_api = Blueprint('upload_api', __name__)

ext={"python": [".py","py"],"java": [".java","java"],"zip":[".zip","zip"]}

def allowed_file(filename):
    """[function for checking to see if the file is an allowed file type]

    Args:
        filename ([string]): [a string version of the filename]

    Returns:
        [Boolean]: [returns a bool if the file is allowed or not]
    """
    filetype=filename.rsplit('.', 1)[1].lower()
    print(filetype)
    for key in ext:
        if filetype in ext[key]:
            return True


def python_error_count(filepath):
    """[A function that finds the ammount of errors from the pylint.out file that was generated]

    Args:
        filepath ([string]): [path to the .out file]

    Returns:
        [int]: [The number of errors that the student had in their pylint output]
    """
    with open(filepath+".out.pylint", "r") as file:
        parsed_json = json.load(file)
        error_count = 0
        for line in parsed_json:
            if("UPPER_CASE" in line["message"]):
                continue
            else:
                error_count = error_count + 1
        return error_count

def output_pass_or_fail(filepath):
    """[a function that looks at all results from a students test run]

    Args:
        filepath ([string]): [path to students submission]

    Returns:
        [Bool]: [If there is even an instance of a student failing a single test case the return type is false ]
    """
    with open(filepath, "r") as file:
        for line in file:
            if "not ok" in line:
                return False
    return True

def level_counter(filepath):
    # TODO: Verify YAML is not Python specific 
    parser = Parser()
    passed_levels={}
    total_tests={}
    for test in parser.parse_file(filepath):
        if test.category == "test":
            if test.yaml_block["suite"] in total_tests:
                total_tests[test.yaml_block["suite"]]=total_tests[test.yaml_block["suite"]]+1
            else:
                total_tests[test.yaml_block["suite"]]=1
            if test.ok:
                if test.yaml_block["suite"] in passed_levels:
                    passed_levels[test.yaml_block["suite"]]=passed_levels[test.yaml_block["suite"]]+1
                else:
                    passed_levels[test.yaml_block["suite"]]=1
    
    return passed_levels, total_tests


def score_finder(project_repository: ProjectRepository, passed_levels,total_tests,project_id) -> str:

    # TODO: Needs to be per class
    levels=project_repository.get_levels(project_id)
    print(levels)
    score_total=0
    for item in levels:
        individual_score=levels[item]/total_tests[item]
        if item in passed_levels:
            score_total=score_total+(individual_score*passed_levels[item])

    
    return score_total


def parse_tap_file_for_levels(file_path: str, levels: List[Levels]) -> str:
    parser = Parser()
    failed_levels=[]
    passed_levels=[]
    for test in parser.parse_file(file_path):
        if test.category == "test":
            if test.ok:
                passed_levels.append(test.yaml_block["suite"])
            else:
                failed_levels.append(test.yaml_block["suite"])
    failed_levels.sort()
    passed_levels.sort()

    return find_level(passed_levels, failed_levels, levels)


def find_level(pass_levels: List[str], failed_levels: List[str], levels: List[Levels]) -> str:
    # If no tests are failing, return the highest level.  Assumes levels are sorted by order
    if len(failed_levels) == 0:
        return levels[-1].Name

    for level in levels:
        if pass_levels.count(level.Name) < failed_levels.count(level.Name):
            return level.Name

    # If it gets here it means every level had more passing tests than failing tests.  Return the max level
    return levels[-1].Name


def pylint_score_finder(error_count):
    if error_count <= 10 and error_count > 7:
        return 25
    if error_count <= 7 and error_count > 5:
        return 30
    if error_count <= 5:
        return 40
    else:
        return 10


@upload_api.route('/', methods = ['POST'])
@jwt_required()
@cross_origin()
@inject
def file_upload(user_repository: UserRepository =Provide[Container.user_repo],submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], config_repo: ConfigRepository = Provide[Container.config_repo],config_repos: ConfigRepository = Provide[Container.config_repo],class_repo: ClassRepository = Provide[Container.class_repo]):
    """[summary]

    Args:
        submission_repository (ASubmissionRepository): [the existing submissions directory and all the functions in it]
        project_repository (AProjectRepository): [the existing projects directory and all the functions in it]

    Returns:
        [HTTP]: [a pass or fail HTTP message]
    """
    
    # TODO: Get the class the user is uploading for
    username = current_user.Username
    user_id = current_user.Id
    if "student_id" in request.form:
        username= user_repository.get_user_by_id(int(request.form["student_id"])) 
        user_id = user_repository.getUserByName(username).Id
    project = project_repo.get_current_project()
    if "project_id" in request.form:
        project = project_repo.get_selected_project(int(request.form["project_id"]))
    if project == None:
        message = {
                'message': 'No active project'
            }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    #Check to see if student is able to upload or still on timeout
    if(current_user.Role != ADMIN_ROLE):
        class_id = request.form['class_id']
        lecture_ids= class_repo.get_lecture_sections_ID(current_user.Id, class_id)
        print(lecture_ids)
        LectureConfigDict=config_repos.get_lecture_section_settings(lecture_ids[0])
        print(LectureConfigDict)
        
        if(LectureConfigDict['HasTBSEnabled'] == True):
            print("here")
            if on_timeout(project.Id, current_user.Id):
                message = {
                    'message': 'Please wait until timeout expires'
                }
                return make_response(message, HTTPStatus.BAD_REQUEST)

    # check if the post request has the file part
    if 'file' not in request.files:
        message = {
            'message': 'No selected file'
        }
        return make_response(message, HTTPStatus.BAD_REQUEST)

    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        message = {
            'message': 'No selected file'
        }
        return make_response(message, HTTPStatus.BAD_REQUEST)

    
    if file and allowed_file(file.filename):
        print(file)
        # Step 1: Run TA-Bot to generate grading folder
        
        #check to see if file is a zip file, if so extract the files
        if file.filename.endswith(".zip"):
            with zipfile.ZipFile(file, 'r') as zip_ref:
                result = subprocess.run([current_app.config['TABOT_PATH'], project.Name, "--final","--system" ], stdout=subprocess.PIPE)
                if result.returncode != 0:
                    message = {
                        'message': 'Error in creating output directory!'
                    }
                    return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
                outputpath = result.stdout.decode('utf-8')
                file_path = os.path.join(outputpath, "input")
                zip_ref.extractall(file_path)                
        else:
            result = subprocess.run([current_app.config['TABOT_PATH'], project.Name, "--final","--system" ], stdout=subprocess.PIPE)
            print("Result ", result)
            if result.returncode != 0:
                message = {
                    'message': 'Error in creating output directory!'
                }
                return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
            outputpath = result.stdout.decode('utf-8')
            print("Outputpath ", outputpath)
            path = os.path.join(outputpath, "input", f"{username}{ext[project.Language][0]}")
            file.save(path)

        # Step 2: Run grade.sh
        result = subprocess.run([outputpath +  "execute.py", username, project.Language], cwd=outputpath) 
        if result.returncode != 0:
            message = {
                'message': 'Error in running grading script!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
        
        # Step 3: Save submission in submission table
        now = datetime.now()
        tap_path = outputpath+"output/"+username+".out"
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        status=output_pass_or_fail(tap_path)

        # TODO: Make this conditional based on language
        error_count=python_error_count(outputpath+"output/"+username)

        levels = project_repo.get_levels_by_project(project.Id)
        submission_level = parse_tap_file_for_levels(tap_path, levels)

        passed_levels, total_tests = level_counter(tap_path)
        student_submission_score=score_finder(project_repo, passed_levels, total_tests, project.Id)
        # TODO: Make this conditional based on language
        pylint_score = pylint_score_finder(error_count)
        total_submission_score = student_submission_score+pylint_score
        # TODO: Make this conditional based on language
        submission_repo.create_submission(current_user.Id, tap_path, path, outputpath+"output/"+username+".out.pylint", dt_string, project.Id,status, error_count, submission_level,total_submission_score)
        
        # Step 4 assign point totals for the submission 
        current_level = submission_repo.get_current_level(project.Id,user_id)
        if current_level != "":
            if submission_level > current_level:
                submission_data=submission_repo.get_most_recent_submission_by_project(project.Id,[user_id])
                submission_repo.modifying_level(project.Id,user_id,submission_data[user_id].Id,submission_level)
        else:
            submission_data=submission_repo.get_most_recent_submission_by_project(project.Id,[user_id])
            submission_repo.modifying_level(project.Id,user_id,submission_data[user_id].Id, submission_level)

        message = {
            'message': 'Success',
            'remainder': 10
        }
        return make_response(message, HTTPStatus.OK)
    message = {
        'message': 'Unsupported file type'
    }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)


@upload_api.route('/total_students', methods=['GET'])
@jwt_required()
@inject
def total_students(user_repo: UserRepository = Provide[Container.user_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)

    list_of_users=user_repo.get_all_users()
    list_of_user_info=[]
    print(list_of_user_info)
    for user in list_of_users:
        if(user.Role != ADMIN_ROLE):
            list_of_user_info.append({"name":user.Firstname +" "+ user.Lastname,"mscsnet":user.Username,"id":user.Id})
    return jsonify(list_of_user_info)

