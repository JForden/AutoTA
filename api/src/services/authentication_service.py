from abc import ABC, abstractmethod
import pam
import os
import requests
import json


class AuthenticationService(ABC):
    """This class is an abstract for our main class PAM AuthenticationService"""

    @abstractmethod
    def login(self, username: str, password: str) -> bool:
        """This is a prototype for our actual method called Login found in the class PAMAuthenticationService"""
        pass
    @abstractmethod
    def placeholder(self, username: str, password: str) -> bool:
        """this class exists so pylint isnt annoyed"""
        pass


class PAMAuthenticationService(AuthenticationService):
    """This class utalizes the PAM library to authenticate users"""
    def login(self, username, password):
        if os.getenv('FLASK_DEBUG', False):
           return True
        
        url =  os.getenv('AUTH_URL')
        data = {'username': json.dumps(username),
                 'password': json.dumps(password)}

        response = requests.post(url, json = data)
        response_json = response.json()
        return response_json['success']
    def placeholder(self, username: str, password: str) -> bool:
        """this class exists so pylint isnt annoyed"""
        pass
