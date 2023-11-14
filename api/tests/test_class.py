import json
from src import classes
from http import HTTPStatus
from unittest.mock import Mock, patch
from src.auth import auth, create_user
from pytest_mock import MockerFixture
from flask_jwt_extended import create_access_token
import src.classes
from src.repositories import user_repository

from src.repositories.models import Classes, Levels, Users


def test_get_classes_and_ids_no_classes(testcontext, mocker: MockerFixture):
   # Arrange
   with testcontext.app.app_context() as ctx:
        user = Users(Id = 1, Firstname="Jack")
        access_token = create_access_token(identity = user)
        with testcontext.app.test_request_context(path='/?filter=false', headers={'Authorization': 'Bearer {}'.format(access_token)}) as tctx:
            class_repo = mocker.MagicMock()
            class_repo.get_classes.return_value = []    
            
            class_service = mocker.MagicMock()   
    
            mocker.patch('flask_jwt_extended.view_decorators._load_user', return_value=user)
            mocker.patch('flask_jwt_extended.utils.get_current_user', return_value=user)

            # Act
            rv = classes.get_classes_and_ids(class_repo=class_repo, class_service=class_service)

            # Assert
            assert rv.status_code == 200
            assert rv.data == b'[]\n'
        
def test_get_classes_and_ids_multiple_classes(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context() as ctx:
        user = Users(Id = 1, Firstname="Jack")
        access_token = create_access_token(identity = user)
        with testcontext.app.test_request_context(path='/?filter=false', headers={'Authorization': 'Bearer {}'.format(access_token)}) as tctx:
            class_repo = mocker.MagicMock()
            class_repo.get_classes.return_value = [ Classes(Id=0, Name="Class 1", Tid="1"), Classes(Id=1, Name="Class 2", Tid="172"), Classes(Id=2, Name="Class 7", Tid="7,2,3"), Classes(Id=3, Name="Class 3", Tid="7, 6, 1") ]       

            class_service = mocker.MagicMock()
    
            mocker.patch('flask_jwt_extended.view_decorators._load_user', return_value=user)
            mocker.patch('flask_jwt_extended.utils.get_current_user', return_value=user)

            # Act
            rv = classes.get_classes_and_ids(class_repo=class_repo, class_service=class_service)

            # Assert
            data = json.loads(rv.data)
            
            assert rv.status_code == 200
            assert len(data) == 4
            assert_class(data[0], 0, "Class 1")
            assert_class(data[1], 1, "Class 2")
            assert_class(data[2], 2, "Class 7")
            assert_class(data[3], 3, "Class 3")

def test_get_classes_and_ids_no_classes_for_teacher(testcontext, mocker: MockerFixture):
    # Arrange
    with testcontext.app.app_context() as ctx:
        user = Users(Id = 0, Firstname="Jack")
        access_token = create_access_token(identity = user)
        with testcontext.app.test_request_context(path='/?filter=true', headers={'Authorization': 'Bearer {}'.format(access_token)}) as tctx:
            class_repo = mocker.MagicMock()
            class_service = mocker.MagicMock()
            class_service.get_assigned_classes.return_value = [ Classes(Id=0, Name="Class 1", Tid="1"), Classes(Id=1, Name="Class 2", Tid="172"), Classes(Id=2, Name="Class 7", Tid="7,2,3"), Classes(Id=3, Name="Class 3", Tid="7, 6, 1") ]       
    
            mocker.patch('flask_jwt_extended.view_decorators._load_user', return_value=user)
            mocker.patch('flask_jwt_extended.utils.get_current_user', return_value=user)

            # Act
            rv = classes.get_classes_and_ids(class_repo=class_repo,class_service=class_service)

            # Assert
            data = json.loads(rv.data)
            
            assert rv.status_code == 200
            assert len(data) == 4
            assert_class(data[0], 0, "Class 1")
            assert_class(data[1], 1, "Class 2")
            assert_class(data[2], 2, "Class 7")
            assert_class(data[3], 3, "Class 3")

def assert_class(cls, expected_id, expected_name):
    assert cls['id'] == expected_id
    assert cls['name'] == expected_name

def mock_request(mocker, path):
    mock_request = mocker.patch(path)
    # make your mocks and stubs
    
    
    