from datetime import timedelta
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
from src.repositories.class_repository import ClassRepository
from src.services.link_service import LinkService
from src.constants import EMPTY, DELAY_CONFIG, REDEEM_BY_CONFIG, ADMIN_ROLE
import json
from tap.parser import Parser
from flask import jsonify
from datetime import datetime
from dependency_injector.wiring import inject, Provide
from container import Container
from src.api_utils import get_value_or_empty

settings_api = Blueprint('settings_api', __name__)

#write a function that takes in a class name, using the class name and user id, it will return the lecture id's
@settings_api.route('/config', methods=['GET'])
@jwt_required()
@inject
def GetLecConfig(config_repos: ConfigRepository = Provide[Container.config_repo],class_repo: ClassRepository = Provide[Container.class_repo]):
    class_id = request.args.get('class_id')
    lecture_ids= class_repo.get_lecture_sections_ID(current_user.Id, class_id)
    print(lecture_ids)
    LectureConfigDict=config_repos.get_lecture_section_settings(lecture_ids[0])
    return make_response(jsonify(LectureConfigDict), HTTPStatus.OK)


@settings_api.route('/config', methods=['POST'])
@jwt_required()
@inject
def UpdateLecConfig(config_repos: ConfigRepository = Provide[Container.config_repo],class_repo: ClassRepository = Provide[Container.class_repo]):
    input_json = request.get_json()
    unlocked_int = get_value_or_empty(input_json, 'HasUnlockedEnabled')
    score_int = get_value_or_empty(input_json, 'HasScoreEnabled')
    tbs_int = get_value_or_empty(input_json, 'HasTBSEnabled')
    class_id= get_value_or_empty(input_json, 'ClassId')
    lvlSYS_int=get_value_or_empty(input_json,'HasLvlSysEnabled')
    #lecture_ids= class_repo.get_lecture_sections_ID(current_user.Id, class_id)
    #config_repos.change_unlockday_toggle(unlocked_int,lecture_ids)
    #config_repos.change_score_toggle(score_int, lecture_ids)
    #config_repos.change_tbs_toggle(tbs_int, lecture_ids)
    #config_repos.change_lvlsys_toggle(lvlSYS_int,lecture_ids)
    
    return make_response("Good", HTTPStatus.OK)
