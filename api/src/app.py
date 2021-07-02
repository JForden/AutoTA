from flask import Flask
from flask_injector import FlaskInjector
from flask_cors import CORS
from auth import auth_api
from upload import upload_api
from submission import submission_api
from projects import projects_api
from dependencies import configure
from jwtF import jwt
from datetime import timedelta
import sentry_sdk

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = '/home/alex/Documents/Repositories/AutoTA/'
    app.config['TABOT_PATH'] = '/home/alex/Documents/Repositories/ta-bot/tabot.sh'
    app.config['ALLOWED_EXTENSIONS'] = ['py', 'tgz']
    app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = '/home/alex/Documents/Repositories/AutoTA/GradeOnD.sh'
    app.config["JWT_SECRET_KEY"] = "ob1L04WeQ1U0H5Kiybk9rMoQigVhoGJCKBxC6KxF85G89vAK3L903I073JXQ"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    
    app.register_blueprint(auth_api, url_prefix='/auth')  
    app.register_blueprint(upload_api, url_prefix='/upload')
    app.register_blueprint(submission_api, url_prefix='/submissions')
    app.register_blueprint(projects_api,url_prefix='/projects')
    
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
