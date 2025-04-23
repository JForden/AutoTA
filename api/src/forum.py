from datetime import timedelta
import os
import threading

import requests
import urllib3
from src.repositories.config_repository import ConfigRepository
from src.repositories.user_repository import UserRepository
from flask import Blueprint
from flask import make_response
from flask import request
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from src.repositories.submission_repository import SubmissionRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.config_repository import ConfigRepository
from src.services.link_service import LinkService
from src.constants import EMPTY, DELAY_CONFIG, REDEEM_BY_CONFIG, ADMIN_ROLE, TA_ROLE
import json
from tap.parser import Parser
from flask import jsonify
from datetime import datetime
from dependency_injector.wiring import inject, Provide
from container import Container
from urllib.parse import unquote
from flask import Blueprint

forum_api = Blueprint('forum_api', __name__)

@forum_api.route('/post_thread', methods=['POST'])
@jwt_required()
@inject
def post_thread(forum_repo: SubmissionRepository = Provide[Container.submission_repo]):
    data = request.get_json()
    suggestion = data['suggestion']
    #submission_repo.submitSuggestion(current_user.Id ,suggestion)
    return make_response("Forum Post Submitted", HTTPStatus.OK)