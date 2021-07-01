from repositories.submission_repository import ASubmissionRepository
from repositories.project_repository import AProjectRepository
from flask import Blueprint
from flask import request
from flask import make_response
from flask import current_app
from http import HTTPStatus
from werkzeug.utils import secure_filename # this is to prevent malicious file names from flask upload
import os
import subprocess
import os.path
from injector import inject
from datetime import datetime
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from flask_cors import CORS, cross_origin
import json
MAXSUBMISSIONS=15

upload_api = Blueprint('upload_api', __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def PyErrorCount(filepath):
    f = open(filepath+".out.pylint", "r")
    y = json.load(f)
    ErrorCount=0
    for item in y:
        ErrorCount=ErrorCount+1
    return ErrorCount

def OutputPassOrFail(filepath):
    f = open(filepath+".out", "r")
    print(filepath+".out")
    data = json.load(f)
    suites = data["result"]
    for suite in suites:
        tests = suite["Tests"]
        for test in tests:
            if test["Status"]=="FAILED":
                return False
    return True




    
@upload_api.route('/', methods = ['POST'])
@jwt_required()
@cross_origin()
@inject
def file_upload(submission_repository: ASubmissionRepository, ProjectRepository: AProjectRepository):
    totalsubmissions= submission_repository.getSubmissionsRemaining(current_user.Id,1)
    project=ProjectRepository.get_current_project()
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

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        # Step 1: Run TA-Bot to generate grading folder
        result = subprocess.run([current_app.config['TABOT_PATH'], project.Name, "--final","--system" ], stdout=subprocess.PIPE)
        if result.returncode != 0:
            message = {
                'message': 'Error in creating output directory!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)
        outputpath = result.stdout.decode('utf-8')

        # TODO: Do we want to always the username as the filename?
        path = os.path.join(outputpath + "input/", current_user.Username + ".py")
        file.save(path)

        # Step 2: Run grade.sh
        result = subprocess.run([outputpath +  "grade.sh", current_user.Username], cwd=outputpath) 
        if result.returncode != 0:
            message = {
                'message': 'Error in running grading script!'
            }
            return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)

        # Step 3: Save submission in submission table
        now = datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        status=OutputPassOrFail(outputpath+"output/"+current_user.Username)
        ErrorCount=PyErrorCount(outputpath+"output/"+current_user.Username)
        submission_repository.create_submission(current_user.Id, outputpath+"output/"+current_user.Username+".out", path, outputpath+"output/"+current_user.Username+".out.pylint", dt_string, project.Id,status,ErrorCount)
        message = {
            'message': 'Success',
            'remainder': (MAXSUBMISSIONS-totalsubmissions+1)
        }
        return make_response(message, HTTPStatus.OK)
    message = {
        'message': 'Unsupported file type'
    }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
