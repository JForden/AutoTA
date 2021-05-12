from src import upload
from http import HTTPStatus
import io
import tempfile


def test_allowed_file_python_allowed(testcontext):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['py']
        rv = upload.allowed_file('test.PY')

    # Assert
    assert rv == True


def test_allowed_file_not_in_list(testcontext):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['zip']
        rv = upload.allowed_file('test.py')

    # Assert
    assert rv == False


def test_allowed_file_in_string_but_not_extension(testcontext):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['zip']
        rv = upload.allowed_file('test.zip.py')

    # Assert
    assert rv == False


def test_allowed_file_only_string(testcontext):
    # Act
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['zip']
        rv = upload.allowed_file('zip')

    # Assert
    assert rv == False


def test_upload_no_file_selected(testcontext):
    # Act
    data = {'files': ''}
    rv = testcontext.client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)

    # Assert
    assert rv.status_code == HTTPStatus.BAD_REQUEST
    assert rv.is_json == True
    assert rv.data == b'{"message":"No selected file"}\n'


def test_upload_file_success(testcontext):
    # Act
    data = {}
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['jpg']
        testcontext.app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
        testcontext.app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = "exit 0"
        data['file'] = (io.BytesIO(b"abcdef"), 'test.jpg')
        rv = testcontext.client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)

    # Assert
    assert rv.status_code == HTTPStatus.OK
    assert rv.is_json == True
    assert rv.data == b'{"message":"Success"}\n'

def test_upload_file_fail_script(testcontext):
    # Act
    data = {}
    with testcontext.app.app_context():
        testcontext.app.config['ALLOWED_EXTENSIONS'] = ['jpg']
        testcontext.app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()
        testcontext.app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = "exit 1"
        data['file'] = (io.BytesIO(b"abcdef"), 'test.jpg')
        rv = testcontext.client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)

    # Assert
    assert rv.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert rv.is_json == True
    assert rv.data == b'{"message":"Error"}\n'
