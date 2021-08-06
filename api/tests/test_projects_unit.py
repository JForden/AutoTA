from http import HTTPStatus
from unittest.mock import Mock, patch
from src.projects import all_projects
from src.repositories.models import Projects
from pytest_mock import MockerFixture
import datetime
import json

# test
def test_projects_all_projects_unauthorized(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role = 0
        mocker.patch("src.projects.current_user", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        project_repository_mock = Mock()
        submission_repository_mock = Mock()

        rv = all_projects(project_repository_mock, submission_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.UNAUTHORIZED
        assert rv.is_json == True
        assert rv.data == b'{"message":"Access Denied"}\n'

def test_projects_all_no_projects(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role = 1
        mocker.patch("src.projects.current_user", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        project_repository_mock = Mock()
        submission_repository_mock = Mock()
        project_repository_mock.get_all_projects.return_value = []
        submission_repository_mock.get_total_submission_for_all_projects.return_value = []

        rv = all_projects(project_repository_mock, submission_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.data == b'[]\n'

def test_projects_all_projects(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role = 1
        mocker.patch("src.projects.current_user", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        projects = [
            Projects(Id = 0, Name = "Project 1", Start = datetime.datetime(2020, 5, 17), End = datetime.datetime(2021, 5, 17)),
            Projects(Id = 1, Name = "Project 2", Start = datetime.datetime(2021, 5, 17), End = datetime.datetime(2022, 5, 17))
        ]

        project_repository_mock = Mock()
        submission_repository_mock = Mock()
        project_repository_mock.get_all_projects.return_value = projects
        submission_repository_mock.get_total_submission_for_all_projects.return_value = { 0: 0, 1: 5 }

        rv = all_projects(project_repository_mock, submission_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == True
        json_response = json.loads(rv.data)
        assert len(json_response) == 2
        assert_project(json_response[0], 0, "Project 1", "05/17/2020", "05/17/2021", 0)
        assert_project(json_response[1], 1, "Project 2", "05/17/2021", "05/17/2022", 5)

def assert_project(actual: str, id: int, name: str, start: str, end: str, total_submissions: int):
    parsed_json = json.loads(actual)
    assert parsed_json["Id"] == id
    assert parsed_json["Name"] == name
    assert parsed_json["Start"] == start
    assert parsed_json["End"] == end
    assert parsed_json["TotalSubmissions"] == total_submissions