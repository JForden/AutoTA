from flask import Flask
from flask_cors import CORS
from src.auth import auth_api
from src.upload import upload_api

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = '/home/alex/Documents/Repositories/AutoTA/'
    app.config['ALLOWED_EXTENSIONS'] = ['py', 'zip']
    app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = '/home/alex/Documents/Repositories/AutoTA/GradeOnD.sh'

    app.register_blueprint(auth_api, url_prefix='/auth')  
    app.register_blueprint(upload_api, url_prefix='/upload')  

    return app

if __name__ == "__main__":
    app = create_app()
    app.run()
