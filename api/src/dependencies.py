from injector import singleton
from src.services.authentication_service import AuthenticationService, PAMAuthenticationService
from src.repositories.submission_repository import ASubmissionRepository, SubmissionRepository
from src.repositories.user_repository import AUserRepository, UserRepository
from src.repositories.project_repository import AProjectRepository, ProjectRepository


def configure(binder):
    binder.bind(AuthenticationService, to=PAMAuthenticationService, scope=singleton)
    binder.bind(ASubmissionRepository, to=SubmissionRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AProjectRepository, to=ProjectRepository, scope=singleton)
