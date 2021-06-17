from flask import Flask
from flask_injector import FlaskInjector
from flask_cors import CORS
from auth import auth_api
from upload import upload_api
from dependencies import configure
from flask_jwt_extended import JWTManager


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = '/home/alex/Documents/Repositories/AutoTA/'
    app.config['ALLOWED_EXTENSIONS'] = ['py']
    app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = '/home/alex/Documents/Repositories/AutoTA/GradeOnD.sh'
    app.config["JWT_SECRET_KEY"] = "ob1L04WeQ1U0H5Kiybk9rMoQigVhoGJCKBxC6KxF85G89vAK3L903I073JXQ"

    app.register_blueprint(auth_api, url_prefix='/auth')  
    app.register_blueprint(upload_api, url_prefix='/upload')

    FlaskInjector(app=app, modules=[configure])
    jwt = JWTManager(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run()
