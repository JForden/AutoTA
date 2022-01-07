"""
This is our main file for our application, from here everything else is called
"""

from container import Container
from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from src.auth import auth_api
from src.repositories.database import db
from src.upload import upload_api
from src.submission import submission_api
from src.projects import projects_api
from src.classes import class_api
from src.error import error_api
from src.settings import settings_api
from src.jwt_manager import jwt
from src import classes, auth, projects, submission, upload, settings
from src.services import timeout_service

USER_NAME = "dbmasteruser"
PASSWORD = ":pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^"
SERVICE = "@ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com"
PATH = "/autota"


def create_app():
    app = Flask(__name__)
    container = Container()
    app.container = container
    container.wire(modules=[classes, auth, projects, submission, upload, settings, timeout_service])
    CORS(app)
    app.config['TABOT_PATH'] = '/home/alex/repos/ta-bot/tabot.sh'
    app.config["JWT_SECRET_KEY"] = "ob1L04WeQ1U0H5Kiybk9rMoQigVhoGJCKBxC6KxF85G89vAK3L903I073JXQ"
    app.config["MAX_FAILED_LOGINS"] = 5
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://"+USER_NAME+PASSWORD+SERVICE+PATH
    app.register_blueprint(auth_api, url_prefix='/api/auth')
    app.register_blueprint(upload_api, url_prefix='/api/upload')
    app.register_blueprint(submission_api, url_prefix='/api/submissions')
    app.register_blueprint(projects_api,url_prefix='/api/projects')  
    app.register_blueprint(class_api,url_prefix='/api/class')
    app.register_blueprint(error_api,url_prefix='/api/error')
    app.register_blueprint(settings_api,url_prefix="/api/settings")
    jwt.init_app(app)
    db.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5001)
