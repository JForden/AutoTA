from flask import Flask
from flask_injector import FlaskInjector
from flask_cors import CORS
from auth import auth_api
from upload import upload_api
from dependencies import configure
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, Text, MetaData, Table, String
from sqlalchemy.types import Date



def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = '/home/alex/Documents/Repositories/AutoTA/'
    app.config['ALLOWED_EXTENSIONS'] = ['py']
    app.config['GRADE_ONDEMAND_SCRIPT_PATH'] = '/home/alex/Documents/Repositories/AutoTA/GradeOnD.sh'
    app.config["JWT_SECRET_KEY"] = "ob1L04WeQ1U0H5Kiybk9rMoQigVhoGJCKBxC6KxF85G89vAK3L903I073JXQ"
    #connection = "mysql+pymysql://{0}:{1}@{2}/{3}".format("dbmasteruser","pc&[sMI;5KWNNfo7F$S*4;F8B[|2xtv^","ls-a1219070b91f9fd2f5647d71fa8b7e70a419305b.ch4bcjnxytnt.us-east-2.rds.amazonaws.com","autota")
    
    
    
    app.register_blueprint(auth_api, url_prefix='/auth')  
    app.register_blueprint(upload_api, url_prefix='/upload')
    FlaskInjector(app=app, modules=[configure])
    jwt = JWTManager(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
