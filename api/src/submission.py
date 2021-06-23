from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from repositories.submission_repository import ASubmissionRepository
from flask_cors import CORS, cross_origin

submission_api = Blueprint('submission_api', __name__)


@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def testcaseerrors(submission_repository: ASubmissionRepository):
    output_path = submission_repository.getJsonPathByUserId(current_user.Id)

    with open(output_path, 'r') as file:
        output = file.read()
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def pylintoutput(submission_repository: ASubmissionRepository):
    pylint_output = submission_repository.getPylintPathByUserId(current_user.Id)

    with open(pylint_output, 'r') as file:
        output = file.read()
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def codefinder(submission_repository: ASubmissionRepository):
    code_output = submission_repository.getCodePathByUserId(current_user.Id)

    with open(code_output, 'r') as file:
        output = file.read()
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/submissioncounter', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def submissionNumberFinder(submission_repository: ASubmissionRepository):
    number = submission_repository.getSubmissionsRemaining(current_user.Id,1)
    return make_response(str(number), HTTPStatus.OK)
