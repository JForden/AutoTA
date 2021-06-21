from models import Submissions
from flask import Blueprint
from flask import request
from flask import make_response
from flask import current_app
from http import HTTPStatus
from database import Session
from flask.globals import session
from werkzeug.utils import secure_filename # this is to prevent malicious file names from flask upload
import os
import subprocess
import tarfile
import os.path
from datetime import datetime
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user

upload_api = Blueprint('upload_api', __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@upload_api.route('/', methods = ['POST'])
@jwt_required()
def file_upload():

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

        result = subprocess.run([current_app.config['TABOT_PATH'], "outofwater", "--final","--system" ], stdout=subprocess.PIPE)
        outputpath = result.stdout.decode('utf-8')

        path = os.path.join(outputpath + "input/", filename)
        file.save(path)

        # Step 2: Save files into grading folder's input directory.  Tar the files
        with tarfile.open(outputpath + "input/" + current_user.username+".tgz", "w:gz") as tar:
                tar.add(outputpath + "input/" + filename, arcname=os.path.basename(outputpath+"input/"+ filename))
        os.remove(path)

        # Step 3: Run grade.sh
        result = subprocess.run([outputpath +  "grade.sh",current_user.username], cwd=outputpath)

        # Step 4: Save submission in submission table
        session = Session()
        now = datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        c1 = Submissions(OutputFilepath=outputpath+"output/"+current_user.username+".out", PylintFilepath=outputpath+"output/"+current_user.username+".out.pylint", Time=dt_string, User=current_user.idUsers, project=1)
        session.add(c1)
        session.commit() 

        #boole = subprocess.run([current_app.config['TABOT_PATH'], path], shell=True)
        if True:
            message = {
                'message': 'Success'
            }
            return make_response(message, HTTPStatus.OK)

        message = {
            'message': 'Error'
        }
        return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)

    message = {
                'message': 'Unsupported file type'
            }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
