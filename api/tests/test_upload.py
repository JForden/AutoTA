from src import upload
from http import HTTPStatus
import io
import tempfile

from src.repositories.models import Levels


def test_allowed_file_python_allowed(testcontext):
    # Act
    with testcontext.app.app_context():
        rv = upload.allowed_file('test.PY', ['py'])

    # Assert
    assert rv == True


def test_allowed_file_not_in_list(testcontext):
    # Act
    with testcontext.app.app_context():
        rv = upload.allowed_file('test.py', ['zip'])

    # Assert
    assert rv == False


def test_allowed_file_in_string_but_not_extension(testcontext):
    # Act
    with testcontext.app.app_context():
        rv = upload.allowed_file('test.zip.py', ['zip'])

    # Assert
    assert rv == False


def test_allowed_file_only_string(testcontext):
    # Act
    with testcontext.app.app_context():
        rv = upload.allowed_file('zip', ['zip'])

    # Assert
    assert rv == False

def test_find_level_no_failing_tests(testcontext):
    # Arrange
    levels = [Levels(Id=1, ProjectId=1, Name="Level 1", Order=1, Points=30),
              Levels(Id=2, ProjectId=1, Name="Level 2", Order=2, Points=30),
              Levels(Id=3, ProjectId=1, Name="Level 3", Order=3, Points=35)]

    pass_levels = ["Level 1", "Level 1", "Level 2", "Level 2", "Level 3"]
    failed_levels = []

    # Act
    rv = upload.find_level(pass_levels, failed_levels, levels)

    # Assert
    assert rv == "Level 3"

def test_find_level_failing_first_level(testcontext):
    # Arrange
    levels = [Levels(Id=1, ProjectId=1, Name="Level 1", Order=1, Points=30),
              Levels(Id=2, ProjectId=1, Name="Level 2", Order=2, Points=30),
              Levels(Id=3, ProjectId=1, Name="Level 3", Order=3, Points=35)]

    pass_levels = ["Level 2", "Level 2", "Level 3"]
    failed_levels = ["Level 1", "Level 1"]

    # Act
    rv = upload.find_level(pass_levels, failed_levels, levels)

    # Assert
    assert rv == "Level 1"


def test_find_level_failing_second_level(testcontext):
    # Arrange
    levels = [Levels(Id=1, ProjectId=1, Name="Level 1", Order=1, Points=30),
              Levels(Id=2, ProjectId=1, Name="Level 2", Order=2, Points=30),
              Levels(Id=3, ProjectId=1, Name="Level 3", Order=3, Points=35)]

    pass_levels = ["Level 1", "Level 1", "Level 3"]
    failed_levels = ["Level 2", "Level 2"]

    # Act
    rv = upload.find_level(pass_levels, failed_levels, levels)

    # Assert
    assert rv == "Level 2"


def test_find_level_partially_failing_second_level(testcontext):
    # Arrange
    levels = [Levels(Id=1, ProjectId=1, Name="Level 1", Order=1, Points=30),
              Levels(Id=2, ProjectId=1, Name="Level 2", Order=2, Points=30),
              Levels(Id=3, ProjectId=1, Name="Level 3", Order=3, Points=35)]

    pass_levels = ["Level 1", "Level 1", "Level 2", "Level 2", "Level 3"]
    failed_levels = ["Level 2"]

    # Act
    rv = upload.find_level(pass_levels, failed_levels, levels)

    # Assert
    assert rv == "Level 3"


def test_find_level_one_failing_level(testcontext):
    # Arrange
    levels = [Levels(Id=1, ProjectId=1, Name="Level 1", Order=1, Points=30)]

    pass_levels = []
    failed_levels = ["Level 1", "Level 1", "Level 2"]

    # Act
    rv = upload.find_level(pass_levels, failed_levels, levels)

    # Assert
    assert rv == "Level 1"

