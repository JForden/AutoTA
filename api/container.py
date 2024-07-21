from src.repositories.config_repository import ConfigRepository
from src.services.class_service import ClassService
from src.services.link_service import PylintLinkService
from src.repositories.user_repository import UserRepository
from src.services.authentication_service import PAMAuthenticationService
from dependency_injector import containers, providers
from src.repositories.class_repository import ClassRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.submission_repository import SubmissionRepository


class Container(containers.DeclarativeContainer):

    config = providers.Configuration()

    class_repo = providers.Factory(
        ClassRepository
    )

    config_repo = providers.Factory(
        ConfigRepository
    )

    project_repo = providers.Factory(
        ProjectRepository
    )

    submission_repo = providers.Factory(
        SubmissionRepository
    )

    user_repo = providers.Factory(
        UserRepository
    )

    auth_service = providers.Factory(
        PAMAuthenticationService
    )

    link_service = providers.Factory(
        PylintLinkService
    )
    
    class_service = providers.Factory(
        ClassService
    )