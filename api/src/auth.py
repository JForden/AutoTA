from flask import Blueprint
from flask import request
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import create_access_token
from services.authentication_service import AuthenticationService
from database import Session
from models import Users


auth_api = Blueprint('auth_api', __name__)


@auth_api.route('/login', methods=['POST'])
@inject
def auth(auth_service: AuthenticationService):
    input_json = request.get_json()
    username = input_json['username']
    password = input_json['password']
    if auth_service.login(username, password):
        
        session = Session()
        q=session.query(Users).filter(Users.username==username)   
        exist = session.query(q.exists())
        result = session.execute(exist).scalar_one()
        print(result)

        if not result:
            c1 = Users(username=username)
            #TODO
            #make a call to a popup to collect more user information
            session.add(c1)
            session.commit()    

        access_token = create_access_token(identity=username)
        message = {
            'message': 'Success',
            'access_token': access_token
        }
        return make_response(message, HTTPStatus.OK)
    else:
        message = {
            'message': 'Invalid username and/or password!  Please try again!'
        }
        return make_response(message, HTTPStatus.FORBIDDEN)
