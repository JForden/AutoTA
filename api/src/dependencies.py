from injector import singleton
from services.authentication_service import AuthenticationService, PAMAuthenticationService


def configure(binder):
    binder.bind(AuthenticationService, to=PAMAuthenticationService, scope=singleton)
