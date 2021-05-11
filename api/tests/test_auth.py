from http import HTTPStatus


def test_successful_auth(testcontext):
    # Act
    rv = testcontext.client.post('/auth/login', data='{ "username": "test", "password": "test" }', content_type='application/json', follow_redirects=True)

    # Assert
    assert rv.status_code == HTTPStatus.OK
    assert rv.is_json == True
    assert rv.data == b'{"message":"Success"}\n'


def test_failed_auth(testcontext):
    # Act
    rv = testcontext.client.post('/auth/login', data='{ "username": "fake", "password": "fake" }', content_type='application/json', follow_redirects=True)

    # Assert
    assert rv.status_code == HTTPStatus.FORBIDDEN
    assert rv.is_json == True
    assert rv.data == b'{"message":"Invalid username and/or password!  Please try again!"}\n'