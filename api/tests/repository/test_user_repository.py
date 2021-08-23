import datetime

from pytest_mock import MockerFixture

from src.repositories.database import db
from src.repositories.models import Users, LoginAttempts
from src.repositories.user_repository import UserRepository


def test_doesUserExist_not_exist(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        result = user_repo.doesUserExist("invalid-user")

        assert result == False

        db.session.remove()
        db.drop_all()


def test_doesUserExist_exist(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user = Users(Username = "valid-user")
        db.session.add(user)
        db.session.commit()

        user_repo = UserRepository()
        result = user_repo.doesUserExist("valid-user")

        assert result == True

        db.session.remove()
        db.drop_all()


def test_getUserByName(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user = Users(Id = 1, Username = "alexg", Firstname = "Alex", Lastname = "Gebhard", Email = "alexander.gebhard@marquette.edu", StudentNumber = "12345678", Role = 0, IsLocked = 0)
        db.session.add(user)
        db.session.commit()

        user_repo = UserRepository()
        result = user_repo.getUserByName("alexg")

        assert_user(result, 1, "alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678", 0, 0)

        db.session.remove()
        db.drop_all()


def test_create_user(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        user_repo.create_user("alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678")

        result = Users.query.filter(Users.Username=="alexg").one_or_none()
        assert_user(result, 1, "alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678", 0, 0)

        db.session.remove()
        db.drop_all()


def test_get_all_users(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        user_repo.create_user("alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678")
        user_repo.create_user("jackf", "Jack", "Forden", "jack.forden@marquette.edu", "12345678")
        user_repo.create_user("dennisb", "Dennis", "Brylow", "dennis.brylow@marquette.edu", "12345678")

        results = user_repo.get_all_users()
        assert len(results) == 3
        assert_user(results[0], 1, "alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678", 0, 0)
        assert_user(results[1], 2, "jackf", "Jack", "Forden", "jack.forden@marquette.edu", "12345678", 0, 0)
        assert_user(results[2], 3, "dennisb", "Dennis", "Brylow", "dennis.brylow@marquette.edu", "12345678", 0, 0)

        db.session.remove()
        db.drop_all()


def test_send_attempt_data(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        user_repo.send_attempt_data("alexg", "192.168.1.1", datetime.datetime(2020, 5, 17))

        result = LoginAttempts.query.filter(LoginAttempts.Username == "alexg").one()

        assert_login_attempt(result, "alexg", "192.168.1.1", datetime.date(2020, 5, 17))

        db.session.remove()
        db.drop_all()


def test_can_user_login(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        result = user_repo.can_user_login("alexg")
        assert result == 0

        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.commit()

        result = user_repo.can_user_login("alexg")
        assert result == 3

        db.session.remove()
        db.drop_all()


def test_clear_failed_attempts(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        user_repo.clear_failed_attempts("alexg")

        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.add(LoginAttempts(Username="alexg", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.add(LoginAttempts(Username="jackf", IPAddress="192.168.1.1", Time=datetime.date(2020, 5, 17)))
        db.session.commit()

        result = LoginAttempts.query.filter(LoginAttempts.Username == "alexg").all()
        assert len(result) == 3

        user_repo.clear_failed_attempts("alexg")

        result = LoginAttempts.query.filter(LoginAttempts.Username == "alexg").all()
        assert len(result) == 0

        result = LoginAttempts.query.all()
        assert len(result) == 1

        db.session.remove()
        db.drop_all()


def test_lock_user_account(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        user_repo = UserRepository()
        user_repo.create_user("alexg", "Alex", "Gebhard", "alexander.gebhard@marquette.edu", "12345678")
        user_repo.create_user("jackf", "Jack", "Forden", "jack.forden@marquette.edu", "12345678")

        result = Users.query.filter(Users.Username == "alexg").one()
        assert result.IsLocked == False

        user_repo.lock_user_account("alexg")

        result = Users.query.filter(Users.Username == "alexg").one()
        assert result.IsLocked == True

        result = Users.query.filter(Users.Username == "jackf").one()
        assert result.IsLocked == False

        db.session.remove()
        db.drop_all()


def assert_login_attempt(actual: LoginAttempts, username: str, ip: str, time: str):
    assert actual.Username == username
    assert actual.IPAddress == ip
    assert actual.Time == time


def assert_user(actual: Users, id: int, username: str, firstname: str, lastname: str, email: str, student_number: str, role: int, is_locked: int):
    assert actual.Id == id
    assert actual.Username == username
    assert actual.Firstname == firstname
    assert actual.Lastname == lastname
    assert actual.Email == email
    assert actual.StudentNumber == student_number
    assert actual.Role == role
    assert actual.IsLocked == is_locked