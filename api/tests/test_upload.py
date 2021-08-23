from src import upload
from http import HTTPStatus
import io
import tempfile


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

