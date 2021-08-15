"""
This is our main file for our application, from here everything else is called
"""

from datetime import timedelta
from flask import Flask
from flask_injector import FlaskInjector
from flask_cors import CORS
from src.auth import auth_api
from src.upload import upload_api
from src.submission import submission_api
from src.projects import projects_api
from src.classes import class_api
from src.jwt_manager import jwt
import sentry_sdk


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['TABOT_PATH'] = '/home/agebhard/ta-bot/tabot.sh'
    app.config["JWT_SECRET_KEY"] = "5WZBHN8yWHH9V7IjIg8aeDwQSOMpYqVyEJXMaXhSuHpsutYyKDrx4BvVR0CEf69"
    app.config["MAX_FAILED_LOGINS"] = 5
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.register_blueprint(auth_api, url_prefix='/api/auth')
    app.register_blueprint(upload_api, url_prefix='/api/upload')
    app.register_blueprint(submission_api, url_prefix='/api/submissions')
    app.register_blueprint(projects_api,url_prefix='/api/projects')  
    app.register_blueprint(class_api,url_prefix='/api/class')  
    sentry_sdk.init(
        "https://c4f15810b0d34cd589cbc1c86bb5e0fd@o906488.ingest.sentry.io/5843824",

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0
    )

    FlaskInjector(app=app, modules=[configure])
    jwt.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
