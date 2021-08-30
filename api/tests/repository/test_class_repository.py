from src.repositories.class_repository import ClassRepository
from pytest_mock import MockerFixture
from src.repositories.database import db
from src.repositories.models import Users, LoginAttempts, Classes, Labs, LectureSections
from src.repositories.user_repository import UserRepository


def test_get_labs_no_labs(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        class_repo = ClassRepository()
        result = class_repo.get_labs()

        assert result == {}

        db.session.remove()
        db.drop_all()


def test_get_labs(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        db.session.add(Classes(Id=1, Name="COSC 1010"))
        db.session.add(Classes(Id=2, Name="COSC 1020"))
        db.session.add(Classes(Id=3, Name="COSC 2100"))
        db.session.add(Labs(Id=1, Name="401", ClassId=1))
        db.session.add(Labs(Id=2, Name="403", ClassId=1))
        db.session.add(Labs(Id=3, Name="402", ClassId=1))
        db.session.add(Labs(Id=4, Name="401", ClassId=2))
        db.session.add(Labs(Id=5, Name="402", ClassId=2))
        db.session.add(Labs(Id=6, Name="401", ClassId=3))
        db.session.commit()

        class_repo = ClassRepository()
        result = class_repo.get_labs()

        assert len(result) == 3
        assert_lab(result[1][0], 1, "401")
        assert_lab(result[1][1], 3, "402")
        assert_lab(result[1][2], 2, "403")

        assert_lab(result[2][0], 4, "401")
        assert_lab(result[2][1], 5, "402")

        assert_lab(result[3][0], 6, "401")

        db.session.remove()
        db.drop_all()

def test_get_labs(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        db.session.add(Classes(Id=1, Name="COSC 1010"))
        db.session.add(Classes(Id=2, Name="COSC 1020"))
        db.session.add(Classes(Id=3, Name="COSC 2100"))
        db.session.add(Labs(Id=1, Name="401", ClassId=1))
        db.session.add(Labs(Id=2, Name="403", ClassId=1))
        db.session.add(Labs(Id=3, Name="402", ClassId=1))
        db.session.add(Labs(Id=4, Name="401", ClassId=2))
        db.session.add(Labs(Id=5, Name="402", ClassId=2))
        db.session.add(Labs(Id=6, Name="401", ClassId=3))
        db.session.commit()

        class_repo = ClassRepository()
        result = class_repo.get_labs()

        assert len(result) == 3
        assert_lab(result[1][0], 1, "401")
        assert_lab(result[1][1], 3, "402")
        assert_lab(result[1][2], 2, "403")

        assert_lab(result[2][0], 4, "401")
        assert_lab(result[2][1], 5, "402")

        assert_lab(result[3][0], 6, "401")

        db.session.remove()
        db.drop_all()


def test_get_labs_no_lecture_sections(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        class_repo = ClassRepository()
        result = class_repo.get_lecture_sections()

        assert result == {}

        db.session.remove()
        db.drop_all()


def test_get_lecture_sections(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        db.session.add(Classes(Id=1, Name="COSC 1010"))
        db.session.add(Classes(Id=2, Name="COSC 1020"))
        db.session.add(Classes(Id=3, Name="COSC 2100"))
        db.session.add(LectureSections(Id=1, Name="401", ClassId=1))
        db.session.add(LectureSections(Id=2, Name="403", ClassId=1))
        db.session.add(LectureSections(Id=3, Name="402", ClassId=1))
        db.session.add(LectureSections(Id=4, Name="401", ClassId=2))
        db.session.add(LectureSections(Id=5, Name="402", ClassId=2))
        db.session.add(LectureSections(Id=6, Name="401", ClassId=3))
        db.session.commit()

        class_repo = ClassRepository()
        result = class_repo.get_lecture_sections()

        assert len(result) == 3
        assert_lab(result[1][0], 1, "401")
        assert_lab(result[1][1], 3, "402")
        assert_lab(result[1][2], 2, "403")

        assert_lab(result[2][0], 4, "401")
        assert_lab(result[2][1], 5, "402")

        assert_lab(result[3][0], 6, "401")

        db.session.remove()
        db.drop_all()


def assert_lab(actual: Labs, id: int, name: str):
    assert actual.Id == id
    assert actual.Name == name


def assert_user(actual: Users, id: int, username: str, firstname: str, lastname: str, email: str, student_number: str, role: int, is_locked: int):
    assert actual.Id == id
    assert actual.Username == username
    assert actual.Firstname == firstname
    assert actual.Lastname == lastname
    assert actual.Email == email
    assert actual.StudentNumber == student_number
    assert actual.Role == role
    assert actual.IsLocked == is_locked