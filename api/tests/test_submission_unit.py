from datetime import datetime, timedelta
from http import HTTPStatus
from unittest.mock import Mock, patch, MagicMock

from src.constants import REDEEM_BY_CONFIG, DELAY_CONFIG
from src.repositories.models import Projects, Submissions
from src.submission import get_testcase_errors, get_submission_information
from pytest_mock import MockerFixture
import json

#test
def test_submission_testcaseerrors_not_admin(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role = 0
        p.Id = 1
        mocker.patch("src.submission.current_user", p)

        x = mocker.MagicMock()
        x.args.get.return_value = "3"
        mocker.patch("src.submission.request", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        submission_repository_mock = Mock()
        submission_repository_mock.get_submissions_remaining.return_value = 10
        submission_repository_mock.get_json_path_by_user_id.return_value = "/root/output/output.out"

        test_container = testcontext.app.container
        with test_container.submission_repo.override(submission_repository_mock):
            rv = get_testcase_errors()

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == False
        assert rv.data == b'10'

#test
def test_get_submission_information_no_project(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        project_repo_mock = Mock()
        project_repo_mock.get_current_project.return_value = None

        test_container = testcontext.app.container
        with test_container.project_repo.override(project_repo_mock):
            rv = get_submission_information()

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == True
        assert_submission_info(rv.data.decode("utf-8"), -1, "", "", -1, -1, False, 0, "")


#test
def test_get_submission_information_basic(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role = 0
        p.Id = 1
        mocker.patch("src.submission.current_user", p)

        mocker.patch("src.submission.request", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        projects = [
            Projects(Id=1, Name="Test Project 1", Start=datetime.now() + timedelta(days=-3),
                     End=datetime(2020, 5, 17), Language="python"),
            Projects(Id=2, Name="Test Project 2", Start=datetime.now() + timedelta(days=-6),
                     End=datetime(2020, 5, 14), Language="python"),
            Projects(Id=3, Name="Test Project 3", Start=datetime.now() + timedelta(days=-9),
                     End=datetime(2020, 5, 11), Language="python")
        ]

        project_repo_mock = Mock()
        project_repo_mock.get_all_projects.return_value = projects
        project_repo_mock.get_current_project.return_value = projects[0]

        config_repo_mock = MagicMock()
        config_repo_mock.get_config_setting.side_effect = get_config_setting_mock

        submission_repo_mock = Mock()
        submission_repo_mock.get_can_redeemed.return_value = (False, 0)
        submission_repo_mock.get_most_recent_submission_by_project.return_value = {1: Submissions(Time = datetime(2020, 5, 17))}

        test_container = testcontext.app.container
        with test_container.project_repo.override(project_repo_mock), test_container.submission_repo.override(submission_repo_mock), test_container.config_repo.override(config_repo_mock):
            rv = get_submission_information()

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == True
        assert_submission_info(rv.data.decode("utf-8"), 10, "Test Project 1", "Sun, 17 May 2020 00:00:00 GMT", 1, 10, False, 0, "2020-05-17T00:05:00")


def get_config_setting_mock(value: str):
    if value == REDEEM_BY_CONFIG:
        return "3"
    elif value == DELAY_CONFIG:
        return "1,2,3,4,5,6,7"
    else:
        raise Exception()

def assert_submission_info(actual: str, submissions_remaining: int, name: str, end: str, id: int, max_submissions: int, can_redeem: bool, points: int, time_until_next_submission: str):
    parsed_json = json.loads(actual)
    assert parsed_json["Id"] == id
    assert parsed_json["name"] == name
    assert parsed_json["submissions_remaining"] == submissions_remaining
    assert parsed_json["end"] == end
    assert parsed_json["max_submissions"] == max_submissions
    assert parsed_json["can_redeem"] == can_redeem
    assert parsed_json["points"] == points
    assert parsed_json["time_until_next_submission"] == time_until_next_submission