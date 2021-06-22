from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from repositories.submission_repository import ASubmissionRepository

submission_api = Blueprint('submission_api', __name__)


@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
def testcaseerrors(submission_repository: ASubmissionRepository):
    output_path = submission_repository.getJsonPathByUserId(current_user.idUsers)

    with open(output_path, 'r') as file:
        output = file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
def pylintoutput(submission_repository: ASubmissionRepository):
    pylint_output = submission_repository.getPylintPathByUserId(current_user.idUsers)

    with open(pylint_output, 'r') as file:
        output = file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
def codefinder(submission_repository: ASubmissionRepository):
    code_output = submission_repository.getCodePathByUserId(current_user.idUsers)

    with open(code_output, 'r') as file:
        output = file.read()
    print(output)
    return make_response(output, HTTPStatus.OK)
