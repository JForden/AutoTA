from models import Submissions
from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from database import Session
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from sqlalchemy import desc

submission_api = Blueprint('submission_api', __name__)

@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
def testcaseerrors():
    session = Session()
    submission = session.query(Submissions).filter(Submissions.User==current_user.idUsers).order_by(desc("Time")).first()

    with open(submission.OutputFilepath,'r') as file:
        output=file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
def pylintoutput():
    session = Session()
    submission = session.query(Submissions).filter(Submissions.User==current_user.idUsers).order_by(desc("Time")).first()

    with open(submission.PylintFilepath,'r') as file:
        output=file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
def codefinder():
    session = Session()
    submission = session.query(Submissions).filter(Submissions.User==current_user.idUsers).order_by(desc("Time")).first()

    with open(submission.CodeFilepath,'r') as file:
        output=file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)
