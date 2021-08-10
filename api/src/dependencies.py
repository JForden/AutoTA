from src.repositories.config_repository import AConfigRepository, ConfigRepository
from injector import singleton
from src.services.authentication_service import AuthenticationService, PAMAuthenticationService
from src.repositories.submission_repository import ASubmissionRepository, SubmissionRepository
from src.repositories.user_repository import AUserRepository, UserRepository
from src.repositories.project_repository import AProjectRepository, ProjectRepository
from src.repositories.Classes_repository import AClassRepository, ClassRepository
from src.services.link_service import LinkService, PylintLinkService


def configure(binder):
    binder.bind(AuthenticationService, to=PAMAuthenticationService, scope=singleton)
    binder.bind(ASubmissionRepository, to=SubmissionRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AUserRepository, to=UserRepository, scope=singleton)
    binder.bind(AProjectRepository, to=ProjectRepository, scope=singleton)
    binder.bind(LinkService, to=PylintLinkService, scope=singleton)
    binder.bind(AClassRepository, to=ClassRepository, scope=singleton)
    binder.bind(AConfigRepository, to=ConfigRepository, scope=singleton)

