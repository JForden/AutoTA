from flask import Blueprint
from flask import request
from flask import make_response
from http import HTTPStatus

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/login', methods = ['POST'])
def auth():
    input_json = request.get_json()
    if input_json['username'] == 'test' and input_json['password'] == 'test':
        message = {
            'message': 'Success'
        }
        return make_response(message, HTTPStatus.OK)
    else:
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)