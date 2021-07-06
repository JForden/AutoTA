from http import HTTPStatus
from unittest.mock import Mock, patch
from src.projects import all_projects
from pytest_mock import MockerFixture

def mock_jwt_required(realm):
    return

# test
def test_projects_all_projects_unauthorized(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Role.return_value = 0
        mocker.patch("src.projects.current_user", p)
        x = mocker.MagicMock()
        mocker.patch('flask_jwt_extended.jwt_required', x)

        project_repository_mock = Mock()
        submission_repository_mock = Mock()

        rv = all_projects(project_repository_mock, submission_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.FORBIDDEN
        assert rv.is_json == True
        assert rv.data == b'{"message":"Invalid username and/or password!  Please try again!"}\n'
