from http import HTTPStatus
from unittest.mock import Mock, patch
from src.auth import auth, create_user
from pytest_mock import MockerFixture
from src.repositories.models import Users
import json


def test_auth_invalid_login(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config["MAX_FAILED_LOGINS"] = 10
        m = mocker.MagicMock()
        m.get_json.return_value = { "username": "alex", "password": "alex" }
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()

        auth_service_mock.login.return_value = False
        user_repository_mock.can_user_login.return_value = 1

        test_container = testcontext.app.container

        with test_container.auth_service.override(auth_service_mock),\
             test_container.user_repo.override(user_repository_mock):
                rv = auth()

        # Assert
        assert rv.status_code == HTTPStatus.FORBIDDEN
        assert rv.is_json == True
        assert rv.data == b'{"message":"Invalid username and/or password!  Please try again!"}\n'


def test_auth_valid_login_new_user(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config["MAX_FAILED_LOGINS"] = 10
        m = mocker.MagicMock()
        m.get_json.return_value = { "username": "alex", "password": "alex" }
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()

        auth_service_mock.login.return_value = True
        user_repository_mock.can_user_login.return_value = 0
        user_repository_mock.doesUserExist.return_value = False

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = auth()

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json == True
        assert rv.data == b'{"message":"New User"}\n'


def test_auth_valid_login_old_user(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config["MAX_FAILED_LOGINS"] = 10
        m = mocker.MagicMock()
        m.get_json.return_value = {"username": "alex", "password": "alex"}
        mocker.patch("src.auth.request", m)

        auth_service_mock = Mock()
        user_repository_mock = Mock()

        auth_service_mock.login.return_value = True
        user_repository_mock.can_user_login.return_value = 0
        user_repository_mock.doesUserExist.return_value = True
        user_repository_mock.getUserByName.return_value = Users(Role = 34)

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = auth()

        # Assert
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json

        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "Success"
        assert data["role"] == 34


def test_auth_no_username_or_password(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config["MAX_FAILED_LOGINS"] = 10
        m = mocker.MagicMock()
        m.get_json.return_value = {}
        mocker.patch("src.auth.request", m)

        auth_service_mock = Mock()
        user_repository_mock = Mock()
        user_repository_mock.can_user_login.return_value = 0
        auth_service_mock.login.return_value = False

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = auth()

        # Assert
        assert rv.status_code == HTTPStatus.FORBIDDEN
        assert rv.is_json
        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "Invalid username and/or password!  Please try again!"


def test_auth_create_no_username_or_password(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        m = mocker.MagicMock()
        m.get_json.return_value = {}
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()
        auth_service_mock.login.return_value = False

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = create_user()

        # Assert
        assert rv.status_code == HTTPStatus.FORBIDDEN
        assert rv.is_json
        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "Invalid username and/or password!  Please try again!"


def test_auth_create_missing_required_data(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        m = mocker.MagicMock()
        m.get_json.return_value = { 'username': 'alex', 'password': 'alex' }
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()
        auth_service_mock.login.return_value = True
        user_repository_mock.doesUserExist.return_value = False
        test_container = testcontext.app.container

        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = create_user()

        # Assert
        assert rv.status_code == HTTPStatus.NOT_ACCEPTABLE
        assert rv.is_json
        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "Missing required data"


def test_auth_create_user_already_exists(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        m = mocker.MagicMock()
        m.get_json.return_value = { 'username': 'alex', 'password': 'alex' }
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()
        auth_service_mock.login.return_value = True
        user_repository_mock.doesUserExist.return_value = True

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock):
            rv = create_user()

        # Assert
        assert rv.status_code == HTTPStatus.NOT_ACCEPTABLE
        assert rv.is_json
        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "User already exists"


def test_auth_create_basic(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        m = mocker.MagicMock()
        m.get_json.return_value = { 'username': 'alex', 'password': 'alex', 'fname': 'Alex', 'lname': 'Gebhard', 'id': '000000000', 'email': 'example@example.com', 'class_id': '1010', 'lab_id': '401' }
        mocker.patch("src.auth.request", m)
        auth_service_mock = Mock()
        user_repository_mock = Mock()
        class_repository_mock = Mock()
        auth_service_mock.login.return_value = True
        user_repository_mock.doesUserExist.return_value = False
        user_repository_mock.getUserByName.return_value = Users(Id = 1)
        class_repository_mock.create_assignments.return_value = 0

        test_container = testcontext.app.container
        with test_container.auth_service.override(auth_service_mock), test_container.user_repo.override(user_repository_mock), test_container.class_repo.override(class_repository_mock):
            rv = create_user()

        # Assert
        print(rv.data)
        assert rv.status_code == HTTPStatus.OK
        assert rv.is_json
        data = json.loads(rv.data.decode("utf-8"))
        assert data["message"] == "Success"
        assert data["role"] == 0
