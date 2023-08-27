from abc import ABC, abstractmethod
import pam
import os


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
        
        pam_module=pam.pam()
        return bool(pam_module.authenticate(username, password))
    def placeholder(self, username: str, password: str) -> bool:
        """this class exists so pylint isnt annoyed"""
        pass
