from abc import ABC, abstractmethod
import pam


class AuthenticationService(ABC):

    @abstractmethod
    def login(self, username: str, password: str) -> bool:
        pass


class PAMAuthenticationService(AuthenticationService):
    def login(self, username, password):
        p=pam.pam()
        p.authenticate(username, password)
        if(p):
            return True
        else:
            return False