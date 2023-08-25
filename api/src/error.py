from flask import Blueprint
from flask import jsonify, request
import json
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user

error_api = Blueprint('error_api', __name__)

@error_api.route('/log', methods=['POST'])
@jwt_required()
def log_error():
    error = request.get_json()
    error["user"] = current_user.Username
    raise Exception(json.dumps(error))