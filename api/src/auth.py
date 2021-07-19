from http import HTTPStatus
from flask import Blueprint
from flask import request
from flask import make_response
from injector import inject
from src.services.authentication_service import AuthenticationService
from src.repositories.database import Session
from src.repositories.models import Users
from flask_jwt_extended import create_access_token
from src.jwt_manager import jwt
from src.repositories.user_repository import AUserRepository
from flask_jwt_extended import jwt_required
from flask import current_app
from src.api_utils import get_value_or_empty
from datetime import datetime

auth_api = Blueprint('auth_api', __name__)

# Register a callback function that takes whatever object is passed in as the
# identity when creating JWTs and converts it to a JSON serializable format.
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.Id

@auth_api.route('/get-role', methods=['GET'])
@jwt_required()
@inject
def get_user_role(user_repository: AUserRepository):
    return user_repository.get_user_status()


# Register a callback function that loades a user from your database whenever
# a protected route is accessed. This should return any python object on a
# successful lookup, or None if the lookup failed for any reason (for example
# if the user has been deleted from the database).
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    session = Session()
    identity = jwt_data["sub"]
    user = session.query(Users).filter_by(Id=identity).one_or_none()
    session.close()
    return user


@auth_api.route('/login', methods=['POST'])
@inject
def auth(auth_service: AuthenticationService, user_repository: AUserRepository):
    input_json = request.get_json()
    username = get_value_or_empty(input_json, 'username')
    password = get_value_or_empty(input_json, 'password')

    if(user_repository.can_user_login(username) >= current_app.config['MAX_FAILED_LOGINS']):
        user_repository.lock_user_account(username)
        message = {
            'message': 'Your account has been locked! Please contact an administrator!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)

    exist = user_repository.doesUserExist(username)

    if not auth_service.login(username, password):
        ipadr = request.remote_addr
        now = datetime.now()
        dt_string = now.strftime("%Y/%m/%d %H:%M:%S")
        if(exist):
            user_repository.send_attempt_data(username, ipadr, dt_string)
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)

    if not exist:
        message = {
            'message': 'New User'
        }
        return make_response(message, HTTPStatus.OK)

    user = user_repository.getUserByName(username)
    role = user.Role

    user_repository.clear_failed_attempts(username)
    access_token = create_access_token(identity=user)
    message = {
        'message': 'Success',
        'access_token': access_token,
        'role': role
    }
    return make_response(message, HTTPStatus.OK)

@auth_api.route('/create', methods=['POST'])
@inject
def create_user(auth_service: AuthenticationService, user_repository: AUserRepository):
    input_json = request.get_json()
    username = get_value_or_empty(input_json, 'username')
    password = get_value_or_empty(input_json, 'password')

    if not auth_service.login(username, password):
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)

    if user_repository.doesUserExist(username):
        message = {
            'message': 'User already exists'
        }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    first_name = get_value_or_empty(input_json, 'fname')
    last_name = get_value_or_empty(input_json, 'lname')
    student_number = get_value_or_empty(input_json, 'id')
    email = get_value_or_empty(input_json, 'email')
    class_name = get_value_or_empty(input_json, 'class_name')
    lab_number= get_value_or_empty(input_json, 'lab_number')

    if not (first_name and last_name and student_number and email and class_name and lab_number):
        message = {
            'message': 'Missing required data'
        }
        return make_response(message, HTTPStatus.NOT_ACCEPTABLE)

    user_repository.create_user(username,first_name,last_name,email,student_number,class_name,lab_number)

    user = user_repository.getUserByName(username)
    access_token = create_access_token(identity=user)

    message = {
        'message': 'Success',
        'access_token': access_token,
        'role': 0
    }
    return make_response(message, HTTPStatus.OK)