from flask import Blueprint
from flask import request
from flask import make_response
from flask import current_app
from http import HTTPStatus
from werkzeug.utils import secure_filename # this is to prevent malicious file names from flask upload
import os
import subprocess

upload_api = Blueprint('upload_api', __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@upload_api.route('/', methods = ['POST'])
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
            'message': 'No sedlected file'
        }
        return make_response(message, HTTPStatus.BAD_REQUEST)

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(path)

        boole = subprocess.run([current_app.config['GRADE_ONDEMAND_SCRIPT_PATH'], path], shell=True)
        if boole.returncode == 0:
            message = {
                'message': 'Success'
            }
            return make_response(message, HTTPStatus.OK) 
        else:
            message = {
                'message': 'Error'
            }  
        return make_response(message, HTTPStatus.INTERNAL_SERVER_ERROR)

    message = {
                'message': 'Unsupported file type'
            }
    return make_response(message, HTTPStatus.UNSUPPORTED_MEDIA_TYPE)
