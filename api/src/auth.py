from flask import Blueprint
from flask import request
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import create_access_token
from services.authentication_service import AuthenticationService
from repositories.database import Session
from repositories.models import Users
from flask_jwt_extended import create_access_token
from jwtF import jwt
from repositories.user_repository import AUserRepository

auth_api = Blueprint('auth_api', __name__)

# Register a callback function that takes whatever object is passed in as the
# identity when creating JWTs and converts it to a JSON serializable format.
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.Id


# Register a callback function that loades a user from your database whenever
# a protected route is accessed. This should return any python object on a
# successful lookup, or None if the lookup failed for any reason (for example
# if the user has been deleted from the database).
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    session = Session()
    identity = jwt_data["sub"]
    return session.query(Users).filter_by(Id=identity).one_or_none()


@auth_api.route('/login', methods=['POST'])
@inject
def auth(auth_service: AuthenticationService, user_repository: AUserRepository):
    input_json = request.get_json()
    username = input_json['username']
    password = input_json['password']
    if not auth_service.login(username, password):
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)

    result = user_repository.doesUserExist(username)

    if not result:
        user_repository.create_user(username)   

    user = user_repository.getUserByName(username)
    Role = user.Role
    if not user:
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)

    access_token = create_access_token(identity=user)
    message = {
        'message': 'Success',
        'access_token': access_token,
        'role': Role
    }
    return make_response(message, HTTPStatus.OK)        
