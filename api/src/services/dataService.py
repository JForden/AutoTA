from src.repositories.submission_repository import SubmissionRepository
from src.repositories.user_repository import UserRepository
import mosspy


def all_submissions(projectid: int, submission_repository: SubmissionRepository, user_repository: UserRepository):
    # TODO: Load in language from DB
    m = mosspy.Moss("41498278", "python")
    users = user_repository.get_all_users()
    userids=[]
    for user in users:
        userids.append(user.Id)
    bucket = submission_repository.get_most_recent_submission_by_project(projectid, userids)    
    for user in users:
        if user.Id in bucket:
            m.addFile(bucket[user.Id].CodeFilepath)
    url = m.send(lambda file_path, display_name: print('*', end='', flush=True))
    return url
