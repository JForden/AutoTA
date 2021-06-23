from injector import singleton
from services.authentication_service import AuthenticationService, PAMAuthenticationService
from repositories.submission_repository import ASubmissionRepository, SubmissionRepository
from repositories.user_repository import AUserRepository, UserRepository
from repositories.project_repository import AProjectRepository, ProjectRepository


def configure(binder):
    binder.bind(AuthenticationService, to=PAMAuthenticationService, scope=singleton)
    binder.bind(ASubmissionRepository, to=SubmissionRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AProjectRepository, to=ProjectRepository, scope=singleton)