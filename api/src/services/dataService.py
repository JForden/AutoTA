from typing import List
from src.repositories.submission_repository import SubmissionRepository
from src.repositories.user_repository import UserRepository
import mosspy
import threading
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate


def all_submissions(projectid: int, userId: int, submission_repository: SubmissionRepository, user_repository: UserRepository):

    ##thread creation function
    files = []
    users = user_repository.get_all_users()
    userids=[]
    for user in users:
        userids.append(user.Id)
    bucket = submission_repository.get_most_recent_submission_by_project(projectid, userids)    
    for user in users:
        if user.Id in bucket:
            files.append(bucket[user.Id].CodeFilepath)

    #Gets the user Email to email Moss results to.
    email=user_repository.get_user_email(userId)

    thread = threading.Thread(target=moss_submissions, args=(files, email), daemon=True)
    thread.start()


def moss_submissions(files: List[str], email: str):
    # TODO: Load in language from DB
    m = mosspy.Moss("41498278", "python")
    for file in files:
        m.addFile(file)
    url = m.send(lambda file_path, display_name: print('*', end='', flush=True))
    gmail_user = 'autotabugreports@gmail.com'
    gmail_password ='cgoafdqjabnwgxoa'
    receivers = [str(email)]
    sent_from = gmail_user

    subject = 'TA-Bot MOSS REPORT'

    msg = MIMEMultipart()
    msg['From'] = "autotabugreports@gmail.com"
    msg['To'] = email
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject

    msg.attach(MIMEText("Here is the MOSS link: "+ str(url)))

    smtpObj = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    smtpObj.ehlo()
    smtpObj.login(gmail_user, gmail_password)
    smtpObj.sendmail("autotabugreports@gmail.com", receivers, msg.as_string())         
    smtpObj.close()
