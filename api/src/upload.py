import json
import os
import subprocess
import os.path
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from flask import Blueprint
from flask import request
from flask import make_response
from flask import current_app
from http import HTTPStatus
from injector import inject
from datetime import datetime
from flask_cors import cross_origin
from src.repositories.submission_repository import SubmissionRepository
from src.repositories.project_repository import AProjectRepository, ProjectRepository
from tap.parser import Parser
from dependency_injector.wiring import inject, Provide
from container import Container


upload_api = Blueprint('upload_api', __name__)

ext={"python": [".py","py"],"java": [".java","java"]}

def allowed_file(filename, extensions):
    """[function for checking to see if the file is an allowed file type]

    Args:
        filename ([string]): [a string version of the filename]

    Returns:
        [Boolean]: [returns a bool if the file is allowed or not]
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in extensions

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
        for _ in parsed_json:
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
    parser = Parser()
    failed_levels={}
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
            else:
                if test.yaml_block["suite"] in failed_levels:
                    failed_levels[test.yaml_block["suite"]]=failed_levels[test.yaml_block["suite"]]+1
                else:
                    failed_levels[test.yaml_block["suite"]]=1
    
    return (passed_levels, total_tests)

def score_finder(project_repository: AProjectRepository, passed_levels,total_tests,project_id):

    #[level 1, 10. level 2, 30]
    levels=project_repository.get_levels(project_id)
    score_total=0
    for item in levels:
        individual_score=levels[item]/total_tests[item]
        if item in passed_levels:
            score_total=score_total+(individual_score*passed_levels[item])

    
    return score_total

def Level_Finder(file_path):
    parser = Parser()
    failed_levels=[]
    for test in parser.parse_file(file_path):
        if test.category == "test":
            if test.ok:
                continue
            else:
                failed_levels.append(test.yaml_block["suite"])
    failed_levels.sort()
    
    level = failed_levels[0]
    
    failed_tests=[0]
    passed_tests=[0]
    
    for test in parser.parse_file(file_path):
        if test.category == "test":
            if test.yaml_block["suite"] == level:
                if test.ok:
                    passed_tests[0]=passed_tests[0]+1
                else:
                    failed_tests[0]=failed_tests[0]+1
    if passed_tests[0] >= failed_tests[0]:
        if failed_levels[1] != None:
            return failed_levels[1]
    return level
    
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
def file_upload(submission_repo: SubmissionRepository = Provide[Container.submission_repo], project_repo: ProjectRepository = Provide[Container.project_repo]):
    """[summary]

    Args:
        submission_repository (ASubmissionRepository): [the existing submissions directory and all the functions in it]
        project_repository (AProjectRepository): [the existing projects directory and all the functions in it]

    Returns:
        [HTTP]: [a pass or fail HTTP message]
    """
    project = project_repo.get_current_project()
    if project == None:
        message = {
                'message': 'No active project'
            }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    totalsubmissions = submission_repo.get_submissions_remaining(current_user.Id, project.Id)
    if(totalsubmissions+1>project.MaxNumberOfSubmissions):
        message = {
                'message': 'Too many submissions!'
            }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)


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

    if file and allowed_file(file.filename, ext[project.Language]):
        # Step 1: Run TA-Bot to generate grading folder
        #TODO: Do we always want to run final?
        result = subprocess.run([current_app.config['TABOT_PATH'], project.Name, "--final","--system" ], stdout=subprocess.PIPE)
        if result.returncode != 0:
            message = {
                'message': 'Error in creating output directory!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
        outputpath = result.stdout.decode('utf-8')

        path = os.path.join(outputpath, "input", f"{current_user.Username}{ext[project.Language][0]}")
        file.save(path)

        # Step 2: Run grade.sh
        result = subprocess.run([outputpath +  "execute.py", current_user.Username, project.Language], cwd=outputpath) 
        if result.returncode != 0:
            message = {
                'message': 'Error in running grading script!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
        
        # Step 3: Save submission in submission table
        now = datetime.now()
        tap_path = outputpath+"output/"+current_user.Username+".out"
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        status=output_pass_or_fail(tap_path)
        error_count=python_error_count(outputpath+"output/"+current_user.Username)
        submission_level = Level_Finder(tap_path)

        passed_levels, total_tests = level_counter(tap_path)
        student_submission_score=score_finder(project_repo, passed_levels, total_tests, project.Id)
        pylint_score = pylint_score_finder(error_count)
        
        total_submission_score = student_submission_score+pylint_score
        
        submission_repo.create_submission(current_user.Id, tap_path, path, outputpath+"output/"+current_user.Username+".out.pylint", dt_string, project.Id,status, error_count, submission_level,total_submission_score)
        
        # Step 4 assign point totals for the submission 
        current_level = submission_repo.get_current_level(project.Id,current_user.Id)
        if not current_level == "" and submission_level > current_level:
            submission_data=submission_repo.get_most_recent_submission_by_project(project.Id,[current_user.Id])
            submission_repo.modifying_level(project.Id,current_user.Id,submission_data[current_user.Id].Id,submission_level)
        else:
            submission_data=submission_repo.get_most_recent_submission_by_project(project.Id,[current_user.Id])
            submission_repo.modifying_level(project.Id,current_user.Id,submission_data[current_user.Id].Id,current_level)
        message = {
            'message': 'Success',
            'remainder': (project.MaxNumberOfSubmissions-totalsubmissions+1)
        }
        return make_response(message, HTTPStatus.OK)
    message = {
        'message': 'Unsupported file type'
    }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
