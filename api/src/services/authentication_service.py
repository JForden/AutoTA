from abc import ABC, abstractmethod
import pam


class AuthenticationService(ABC):

    @abstractmethod
    def login(self, username: str, password: str) -> bool:
        pass


class PAMAuthenticationService(AuthenticationService):
    def login(self, username, password):
        p=pam.pam()
        if(p.authenticate(username, password)):
            return True
        else:
            return False