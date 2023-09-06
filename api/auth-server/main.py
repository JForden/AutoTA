# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask
from flask import jsonify
from flask import request
import pam
import json
 
# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)
 
# The route() function of the Flask class is a decorator,
# which tells the application which URL should call
# the associated function.
@app.route('/', methods=['POST'])
# ‘/’ URL is bound with hello_world() function.
def auth():
    data = request.get_json()
    dict = {'success': False}
    try:
        pam_module=pam.pam()
        username = data['username'].strip('"')
        password = data['password'].strip('"')
        dict['success'] = bool(pam_module.authenticate(username, password))
    except:
        pass
    print(dict)
    return jsonify(dict), 200
 
# main driver function
if __name__ == '__main__':
 
    # run() method of Flask class runs the application
    # on the local development server.
    app.run(host='0.0.0.0', port='4000')
