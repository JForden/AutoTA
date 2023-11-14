import pytest
import app
from src.repositories.database import db


class TestContext:
    def __init__(self, app, client):
        self.app = app
        self.client = client

@pytest.fixture
def testcontext():
    testapp = app.create_app()
    testapp.debug = True
    testapp.config['TESTING'] = True
    testapp.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"

    with testapp.test_client() as client:
        tc = TestContext(testapp, client)
        yield tc
        #testapp.container.unwire()
