from src.repositories.project_repository import ProjectRepository
from src.repositories.config_repository import ConfigRepository
from src.repositories.submission_repository import SubmissionRepository
from datetime import date, datetime, timedelta
from src.constants import DELAY_CONFIG
from dependency_injector.wiring import inject, Provide
from container import Container


@inject
def get_timeout(project_id: int, user_id: int,
                submission_repo: SubmissionRepository = Provide[Container.submission_repo],
                project_repo: ProjectRepository = Provide[Container.project_repo],
                config_repo: ConfigRepository = Provide[Container.config_repo]) -> date:
    curr_date = datetime.now()

    project = project_repo.get_selected_project(project_id)

    day_delays_str = config_repo.get_config_setting(DELAY_CONFIG)
    day_delays = [int(x) for x in day_delays_str.split(",")]
    day = curr_date - project.Start
    index = day.days

    if index < len(day_delays):
        delay_minutes = day_delays[index]
    else:
        delay_minutes = day_delays[len(day_delays) - 1]

    submissions = submission_repo.get_most_recent_submission_by_project(project_id, [user_id])

    if not user_id in submissions:
        # The user has no previous submissions.  Return a date in the past so they don't have a timeout
        return curr_date + timedelta(minutes=-1)

    submission = submissions[user_id]
    time_for_next_submission = submission.Time + timedelta(minutes=delay_minutes)
    if submission_repo.unlock_check(user_id, project_id):
        time_for_next_submission = submission.Time + timedelta(minutes=5)

    return time_for_next_submission


def on_timeout(project_id: int, user_id: int) -> bool:
    curr_date = datetime.now()
    time_for_next_submission = get_timeout(project_id, user_id)

    return time_for_next_submission > curr_date
