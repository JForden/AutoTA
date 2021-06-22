from injector import singleton
from services.authentication_service import AuthenticationService, PAMAuthenticationService
from repositories.submission_repository import ASubmissionRepository, SubmissionRepository
from repositories.user_repository import AUserRepository, UserRepository


def configure(binder):
    binder.bind(AuthenticationService, to=PAMAuthenticationService, scope=singleton)
    binder.bind(ASubmissionRepository, to=SubmissionRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
