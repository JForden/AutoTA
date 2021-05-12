from flask import Blueprint
from flask import request
from flask import make_response
from http import HTTPStatus
from injector import inject
from src.services.authentication_service import AuthenticationService


auth_api = Blueprint('auth_api', __name__)


@auth_api.route('/login', methods=['POST'])
@inject
def auth(auth_service: AuthenticationService):
    input_json = request.get_json()
    if auth_service.login(input_json['username'], input_json['password']):
        message = {
            'message': 'Success'
        }
        return make_response(message, HTTPStatus.OK)
    else:
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
