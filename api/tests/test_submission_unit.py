from http import HTTPStatus
from unittest.mock import Mock, patch
from src.submission import submission_number_finder
from src.repositories.models import Projects
from src.submission import testcaseerrors
from pytest_mock import MockerFixture

# test
def test_submission_submission_number_finder(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        p = mocker.MagicMock()
        p.Id = 1
        mocker.patch("src.submission.current_user", p)
        mocker.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')

        project_repository_mock = Mock()
        project_repository_mock.get_current_project.return_value = Projects(Id = 1)
        submission_repository_mock = Mock()
        submission_repository_mock.get_submissions_remaining.return_value = 10

        rv = submission_number_finder(submission_repository_mock, project_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == False
        assert rv.data == b'10'

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

        rv = testcaseerrors(submission_repository_mock)

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == False
        assert rv.data == b'10'