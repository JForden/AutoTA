import pytest
from tes import app

@pytest.fixture
def client():
    testapp = app.create_app()
    testapp.config['TESTING'] = True

    with testapp.test_client() as client:
        yield client