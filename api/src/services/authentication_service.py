from abc import ABC, abstractmethod


class AuthenticationService(ABC):

    @abstractmethod
    def login(self, username, password):
        pass


class PAMAuthenticationService(AuthenticationService):
    def login(self, username, password):
        # TODO: Do PAM stuff here
        return True