import pytest
from src import app


class TestContext:
    def __init__(self, app, client):
        self.app = app
        self.client = client


@pytest.fixture
def testcontext():
    testapp = app.create_app()
    testapp.config['TESTING'] = True

    with testapp.test_client() as client:
        tc = TestContext(testapp, client)
        yield tc
