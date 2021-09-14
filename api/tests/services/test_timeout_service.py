from datetime import datetime, timedelta
from http import HTTPStatus
from unittest.mock import Mock, patch, MagicMock

from src.constants import REDEEM_BY_CONFIG, DELAY_CONFIG
from src.repositories.models import Projects, Submissions
from src.services.timeout_service import get_timeout
from pytest_mock import MockerFixture
import json


def test_get_timeout_first_day(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context():
        project = Projects(Id=1, Name="Test Project 1", Start=datetime.now() + timedelta(minutes=-3),
                        End=datetime(2020, 5, 17), Language="python")

        project_repo_mock = Mock()
        project_repo_mock.get_selected_project.return_value = project

        config_repo_mock = Mock()
        config_repo_mock.get_config_setting.return_value = "1,10,20,30"

        submission_repo_mock = Mock()
        submission_repo_mock.get_can_redeemed.return_value = (False, 0)
        submission_repo_mock.get_most_recent_submission_by_project.return_value = {1: Submissions(Time = datetime(2020, 5, 17))}
        submission_repo_mock.unlock_check.return_value = False

        test_container = testcontext.app.container

        # Act
        with test_container.project_repo.override(project_repo_mock), test_container.submission_repo.override(submission_repo_mock), test_container.config_repo.override(config_repo_mock):
            rv = get_timeout(1, 1)

        # Assert
        timeout = datetime(2020, 5, 17, 0, 1, 0, 0)
        assert rv == timeout


def test_get_timeout_last_day(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context():
        project = Projects(Id=1, Name="Test Project 1", Start=datetime.now() + timedelta(days=-3),
                        End=datetime(2020, 5, 17), Language="python")

        project_repo_mock = Mock()
        project_repo_mock.get_selected_project.return_value = project

        config_repo_mock = Mock()
        config_repo_mock.get_config_setting.return_value = "1,10,20,30"

        submission_repo_mock = Mock()
        submission_repo_mock.get_can_redeemed.return_value = (False, 0)
        submission_repo_mock.get_most_recent_submission_by_project.return_value = {1: Submissions(Time = datetime(2020, 5, 17))}
        submission_repo_mock.unlock_check.return_value = False

        test_container = testcontext.app.container

        # Act
        with test_container.project_repo.override(project_repo_mock), test_container.submission_repo.override(submission_repo_mock), test_container.config_repo.override(config_repo_mock):
            rv = get_timeout(1, 1)

        # Assert
        timeout = datetime(2020, 5, 17, 0, 30, 0, 0)
        assert rv == timeout


def test_get_timeout_out_of_range(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context():
        project = Projects(Id=1, Name="Test Project 1", Start=datetime.now() + timedelta(days=-10),
                        End=datetime(2020, 5, 17), Language="python")

        project_repo_mock = Mock()
        project_repo_mock.get_selected_project.return_value = project

        config_repo_mock = Mock()
        config_repo_mock.get_config_setting.return_value = "1,10,20,30"

        submission_repo_mock = Mock()
        submission_repo_mock.get_can_redeemed.return_value = (False, 0)
        submission_repo_mock.get_most_recent_submission_by_project.return_value = {1: Submissions(Time = datetime(2020, 5, 17))}
        submission_repo_mock.unlock_check.return_value = False

        test_container = testcontext.app.container

        # Act
        with test_container.project_repo.override(project_repo_mock), test_container.submission_repo.override(submission_repo_mock), test_container.config_repo.override(config_repo_mock):
            rv = get_timeout(1, 1)

        # Assert
        timeout = datetime(2020, 5, 17, 0, 30, 0, 0)
        assert rv == timeout


def test_get_timeout_unlocked(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context():
        project = Projects(Id=1, Name="Test Project 1", Start=datetime.now() + timedelta(days=-2),
                        End=datetime(2020, 5, 17), Language="python")

        project_repo_mock = Mock()
        project_repo_mock.get_selected_project.return_value = project

        config_repo_mock = Mock()
        config_repo_mock.get_config_setting.return_value = "10,10,20,30"

        submission_repo_mock = Mock()
        submission_repo_mock.get_can_redeemed.return_value = (False, 0)
        submission_repo_mock.get_most_recent_submission_by_project.return_value = {1: Submissions(Time = datetime(2020, 5, 17))}
        submission_repo_mock.unlock_check.return_value = True

        test_container = testcontext.app.container

        # Act
        with test_container.project_repo.override(project_repo_mock), test_container.submission_repo.override(submission_repo_mock), test_container.config_repo.override(config_repo_mock):
            rv = get_timeout(1, 1)

        # Assert
        timeout = datetime(2020, 5, 17, 0, 5, 0, 0)
        assert rv == timeout