import shutil
from flask.json import jsonify
from src.repositories.config_repository import ConfigRepository
import json
import os
import subprocess
import os.path
from typing import List
import zipfile
from subprocess import Popen

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

ext={"python": [".py","py"],"java": [".java","java"],"c": [".c", "c"],"zip":[".zip","zip"]}


def allowed_file(filename):
    """[function for checking to see if the file is an allowed file type]

    Args:
        filename ([string]): [a string version of the filename]

    Returns:
        [Boolean]: [returns a bool if the file is allowed or not]
    """
    filetype=filename.rsplit('.', 1)[1].lower()
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
    with open(filepath+".out.lint", "r") as file:
        parsed_json = json.load(file)
        error_count = 0
        for line in parsed_json:
            if("UPPER_CASE" in line["message"]):
                continue
            else:
                error_count = error_count + 1
        return error_count
    
def LintErrorLogger(filepath, language):
    if language == "python":
        """A function that saves all the Linting errors into a dictionary"""
        with open(filepath+".out.lint", "r") as file:
            parsed_json = json.load(file)
            error_dict = {}
            for line in parsed_json:
                message = line["symbol"]
                if message in error_dict:
                    error_dict[message] += 1
                else:
                    error_dict[message] = 1
            return error_dict
    else:
        return {}

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
    """
    This function takes a filepath as input and returns the number of passed levels and total tests for each suite in the file.
    
    Args:
    - filepath (str): The path of the file to be parsed.
    
    Returns:
    - passed_levels (dict): A dictionary containing the number of passed tests for each suite.
    - total_tests (dict): A dictionary containing the total number of tests for each suite.
    """
    parser = Parser()
    passed_levels={}
    total_tests={}
    for test in parser.parse_file(filepath):
        if test.category == "test":
            if test.yaml_block is not None and test.yaml_block["suite"] == None:
                continue
            if test.yaml_block is not None and test.yaml_block["suite"] in total_tests:
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

    levels=project_repository.get_levels(project_id)
    score_total=0
    for item in levels:
        #individual_score=levels[item]/total_tests[item]
        individual_score=0
        if item in passed_levels:
            score_total=score_total+(individual_score*passed_levels[item])    
    return score_total

def test_case_result_finder(filepath):
    results = {'Passed': [], 'Failed': []}
    current_test = {'name': None, 'level': None}

    with open(filepath, "r") as file:
        for line in file:
            line = line.strip()
            if line.startswith('not ok'):
                current_test = {'name': None, 'level': None}
                is_passing = False
            elif line.startswith('ok'):
                current_test = {'name': None, 'level': None}
                is_passing = True
            elif line.startswith('name:'):
                current_test['name'] = line.split('\'')[1]
            elif line.startswith('suite:'):
                current_test['level'] = line.split('\'')[1]
            elif line.startswith('...') and current_test['name']:
                if is_passing:
                    results['Passed'].append({current_test['name']: current_test['level']})
                else:
                    results['Failed'].append({current_test['name']: current_test['level']})

    return results


def parse_tap_file_for_levels(file_path: str, levels: List[Levels]) -> str:
    """
    Parses a TAP file and returns the level(s) that were passed or failed.

    Args:
        file_path (str): The path to the TAP file to parse.
        levels (List[Levels]): A list of levels to check for pass/fail.

    Returns:
        str: The highest level a student reaches (max 3)
    """
    parser = Parser()
    failed_levels=[]
    passed_levels=[]
    for test in parser.parse_file(file_path):
        if test.category == "test":
            if test.ok and test.yaml_block is not None and test.yaml_block["suite"] is not None:
                passed_levels.append(test.yaml_block["suite"])
            else:
                if test.yaml_block is not None and test.yaml_block["suite"] is not None:
                    failed_levels.append(test.yaml_block["suite"])
                else:
                    print("No suite", flush=True)
    failed_levels.sort()
    passed_levels.sort()

    return find_level(passed_levels, failed_levels, levels)


def find_level(pass_levels: List[str], failed_levels: List[str], levels: List[Levels]) -> str:
    """
    Finds the level of a submission based on the passed and failed tests.

    Args:
        pass_levels (List[str]): A list of levels that passed the tests.
        failed_levels (List[str]): A list of levels that failed the tests.
        levels (List[Levels]): A list of all the levels.

    Returns:
        str: The name of the max level a student has reached.
    """
    # If no tests are failing, return the highest level.  Assumes levels are sorted by order
    if len(failed_levels) == 0:
        return levels[-1].Name

    for level in levels:
        if pass_levels.count(level.Name) < failed_levels.count(level.Name):
            return level.Name

    # If it gets here it means every level had more passing tests than failing tests.  Return the max level
    return levels[-1].Name


def pylint_score_finder(error_count):
    """
    Calculates a pylint score based on the number of errors found in the code.

    Args:
        error_count (int): The number of errors found in the code.

    Returns:
        int: The pylint score calculated based on the number of errors found.
    """
    if error_count <= 10 and error_count > 7:
        return 25
    if error_count <= 7 and error_count > 5:
        return 30
    if error_count <= 5:
        return 40
    else:
        return 10

@upload_api.route('/total_students_by_cid', methods=['GET'])
@jwt_required()
@inject
def total_students(user_repo: UserRepository = Provide[Container.user_repo]):
    if current_user.Role != ADMIN_ROLE:
        message = {
            'message': 'Access Denied'
        }
        return make_response(message, HTTPStatus.UNAUTHORIZED)
    class_id = request.args.get('class_id')
    users=user_repo.get_all_users_by_cid(class_id)
    list_of_user_info=[]
    for user in users:
        list_of_user_info.append({"name":user.Firstname +" "+ user.Lastname,"mscsnet":user.Username,"id":user.Id})
    return jsonify(list_of_user_info)

# figure out a way to access this from tabot.py - it doesn't like it because of this error
# ImportError: cannot import name 'StaticDiffTest' from 'tests' (/app/tests/__init__.py)

def find_line_by_char(c_file: str, target_char_count: int) -> int:
    line_count = 1
    char_count = 0
    with open(c_file, "r") as file:
        lines = file.read()
    # 0 based fileoffset indexing in .yaml file
    for c in lines:
        if c == '\n':
            line_count += 1
        if c == lines[target_char_count] and char_count == target_char_count:
            return line_count
        char_count += 1
    return -1


@upload_api.route('/', methods=['POST'])
@jwt_required()
@inject
def file_upload(user_repository: UserRepository =Provide[Container.user_repo],submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo], config_repo: ConfigRepository = Provide[Container.config_repo],config_repos: ConfigRepository = Provide[Container.config_repo],class_repo: ClassRepository = Provide[Container.class_repo]):
    """[summary]

    Args:
        submission_repository (ASubmissionRepository): [the existing submissions directory and all the functions in it]
        project_repository (AProjectRepository): [the existing projects directory and all the functions in it]

    Returns:
        [HTTP]: [a pass or fail HTTP message]
    """

    class_id = request.form['class_id']
    username = current_user.Username
    user_id = current_user.Id
    if "student_id" in request.form:
        username= user_repository.get_user_by_id(int(request.form["student_id"])) 
        user_id = user_repository.getUserByName(username).Id

    project_id = project_repo.get_current_project_by_class(class_id)
    project = None
    if "project_id" in request.form:
        project = project_repo.get_selected_project(int(request.form["project_id"]))
    else:
        project = project_repo.get_current_project_by_class(class_id)
        
    if project == None:
        message = {
                'message': 'No active project'
            }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    #Check to see if student is able to upload or still on timeout
    if(current_user.Role != ADMIN_ROLE):
        class_id = request.form['class_id']

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
    filedata=file.read()
    classname = class_repo.get_class_name_withId(class_id)
    submission_path = "/ta-bot/" + project.solutionpath.split("/")[3].split(".")[0] + "-out"
    print(project.solutionpath.split("/")[3], flush=True)
    print(submission_path, flush=True)


    if file and allowed_file(file.filename):
        zipfile_bool = False  #Horrible, redesign this TODO
        language = file.filename.rsplit('.', 1)[1].lower()

        # Step 1: Run TA-Bot to generate grading folder
        
        #check to see if file is a zip file, if so extract the files
        if file.filename.endswith(".zip"):
            with zipfile.ZipFile(file, 'r') as zip_ref:
                zipfile_bool = True
                outputpath = os.path.join(submission_path)
                path = os.path.join(submission_path, f"{username}") 
                if os.path.isdir(path):
                    shutil.rmtree(path)
                os.mkdir(path)
                if project.Language.lower() == "python":
                    message = {
                        'message': 'Python projects do not support zip files!'
                    }
                    return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
                if project.Language.lower() == "java":
                    for file_info in zip_ref.infolist():
                        if file_info.filename.endswith('.java'):
                            with zip_ref.open(file_info) as f:
                                file_content = f.read()
                            save_path = os.path.join(path, os.path.basename(file_info.filename))
                            with open(save_path, 'wb') as f:
                                f.write(file_content)           
        else:
            file.seek(0)
            path = os.path.join(submission_path)
            outputpath = path
            language = project.Language.lower()
            path = os.path.join(path, f"{username}{ext[language][0]}") 
            print(path, flush=True)
            file.save(path)

        # Step 2: Run grade.sh
        research_group = user_repository.get_user_researchgroup(user_id)
       
        testcase_info_json =project_repo.testcases_to_json(project.Id)
        result = subprocess.run(["python","../tabot.py", username, str(research_group), project.Language, str(testcase_info_json), path, ""], cwd=outputpath) 


        if result.returncode != 0:
            message = {
                'message': 'Error in running grading script!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
        
        # Step 3: Save submission in submission table
        now = datetime.now()
        if zipfile_bool:
            outputpath = path = os.path.join(submission_path, f"{username}") 

        tap_path = outputpath+"/"+username+".out"
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        status=output_pass_or_fail(tap_path)
        TestCaseResults=test_case_result_finder(tap_path)
        if project.Language == "python":
            error_count=python_error_count(outputpath+"/"+username)
        else:
            error_count=0    
        levels = project_repo.get_levels_by_project(project.Id)

        submission_level = parse_tap_file_for_levels(tap_path, levels)

        passed_levels, total_tests = level_counter(tap_path)
        student_submission_score=score_finder(project_repo, passed_levels, total_tests, project.Id)
        if project.Language == "python":
            pylint_score=python_error_count(outputpath+"/"+username)
        else:
            pylint_score = 40
        total_submission_score = student_submission_score+pylint_score

        Linting_results=LintErrorLogger(outputpath+"/"+username, project.Language)

        submissionId = submission_repo.create_submission(user_id, tap_path, path, outputpath+"/"+username+".out.lint", dt_string, project.Id,status, error_count, submission_level,total_submission_score, 0, TestCaseResults, Linting_results)
        
        submission_repo.consume_charge(user_id, class_id,  project.Id, submissionId)

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
            'remainder': 10,
            "sid": submissionId,
        }
        return make_response(message, HTTPStatus.OK)
    message = {
        'message': 'Unsupported file type'
    }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)










    