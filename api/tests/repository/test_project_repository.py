import datetime
from src.repositories.project_repository import ProjectRepository
from pytest_mock import MockerFixture
from src.repositories.database import db
from src.repositories.models import Projects, Levels, Labs


def test_get_levels_by_project_project_doesnt_exist(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        proj_repo = ProjectRepository()
        result = proj_repo.get_levels_by_project(-1)

        assert len(result) == 0

        db.session.remove()
        db.drop_all()


def test_get_levels_by_project(testcontext, mocker: MockerFixture):
    # Act
    with testcontext.app.app_context():
        db.init_app(testcontext.app)
        db.create_all()

        db.session.add(Projects(Id=1, Name="Project 1", Start=datetime.datetime(2020, 5, 17), End=datetime.datetime(2020, 6, 17)))
        db.session.add(Levels(Id=1, ProjectId=1, Name="Level 3", Order=3, Points=35))
        db.session.add(Levels(Id=2, ProjectId=1, Name="Level 2", Order=2, Points=30))
        db.session.add(Levels(Id=3, ProjectId=1, Name="Level 1", Order=1, Points=30))
        db.session.commit()

        proj_repo = ProjectRepository()
        result = proj_repo.get_levels_by_project(1)

        assert len(result) == 3

        assert_level(result[0], 3, "Level 1", 1, 1, 30)
        assert_level(result[1], 2, "Level 2", 1, 2, 30)
        assert_level(result[2], 1, "Level 3", 1, 3, 35)

        db.session.remove()
        db.drop_all()


def assert_level(actual: Levels, id: int, name: str, project_id: int, order: int, points: int):
    assert actual.Id == id
    assert actual.Name == name
    assert actual.ProjectId == project_id
    assert actual.Order == order
    assert actual.Points == points
