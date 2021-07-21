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
from src.repositories.submission_repository import ASubmissionRepository
from src.repositories.project_repository import AProjectRepository

MAXSUBMISSIONS=15

upload_api = Blueprint('upload_api', __name__)

ext={"python": [".py","py"],"java": [".java","java"]}

def allowed_file(filename, extensions):
    """[function for checking to see if the file is an allowed file type]

    Args:
        filename ([string]): [a string version of the filename]

    Returns:
        [Boolean]: [returns a bool if the file is allowed or not]
    """
    print(extensions)
    print(filename.rsplit('.', 1)[1].lower())
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
    with open(filepath+".out", "r") as file:
        for line in file:
            if "not ok" in line:
                return False
    return True
    
@upload_api.route('/', methods = ['POST'])
@jwt_required()
@cross_origin()
@inject
def file_upload(submission_repository: ASubmissionRepository, project_repository: AProjectRepository):
    """[summary]

    Args:
        submission_repository (ASubmissionRepository): [the existing submissions directory and all the functions in it]
        project_repository (AProjectRepository): [the existing projects directory and all the functions in it]

    Returns:
        [HTTP]: [a pass or fail HTTP message]
    """
    project = project_repository.get_current_project()
    if project == None:
        message = {
                'message': 'No active project'
            }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    totalsubmissions = submission_repository.get_submissions_remaining(current_user.Id, project.Id)
    if(totalsubmissions+1>MAXSUBMISSIONS):
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
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        status=output_pass_or_fail(outputpath+"output/"+current_user.Username)
        error_count=python_error_count(outputpath+"output/"+current_user.Username)
        submission_repository.create_submission(current_user.Id, outputpath+"output/"+current_user.Username+".out", path, outputpath+"output/"+current_user.Username+".out.pylint", dt_string, project.Id,status,error_count)
        message = {
            'message': 'Success',
            'remainder': (MAXSUBMISSIONS-totalsubmissions+1)
        }
        return make_response(message, HTTPStatus.OK)
    message = {
        'message': 'Unsupported file type'
    }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
