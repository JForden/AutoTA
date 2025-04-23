from collections import defaultdict
import os
import openai
from src.repositories.database import db
from .models import GPTLogs, SnippetRuns, StudentGrades, StudentQuestions, StudentSuggestions, StudentUnlocks, SubmissionChargeRedeptions, SubmissionCharges, Submissions, Projects, StudentProgress, Users, ChatGPTkeys
from sqlalchemy import desc, and_
from typing import Dict, List, Tuple
from src.repositories.config_repository import ConfigRepository
from datetime import datetime, timedelta
from openai import AsyncOpenAI

class ForumRepository():
    # def get_submission_by_user_id(self, user_id: int) -> Submissions:
    #     """Returns the latest submission made by a user with the given user_id.

    #     Args:
    #         user_id (int): The ID of the user whose submission is to be retrieved.

    #     Returns:
    #         Submissions: The latest submission made by the user with the given user_id.
    #     """
    #     submission = Submissions.query.filter(Submissions.User == user_id).order_by(desc("Time")).first()
    #     return submission

    def postThread(self, user_id, thread):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        suggestion = StudentSuggestions(UserId=user_id, StudentSuggestionscol=suggestion, TimeSubmitted=dt_string)
        db.session.add(suggestion)
        db.session.commit()
        return "ok"
        


    



