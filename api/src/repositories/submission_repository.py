import openai
from src.repositories.database import db
from .models import GPTLogs, StudentUnlocks, Submissions, Projects, StudentProgress, Users, ChatGPTkeys
from sqlalchemy import desc, and_
from typing import Dict, List, Tuple
from src.repositories.config_repository import ConfigRepository
from datetime import datetime

class SubmissionRepository():
    def get_submission_by_user_id(self, user_id: int) -> Submissions:
        submission = Submissions.query.filter(Submissions.User == user_id).order_by(desc("Time")).first()
        return submission
    def get_submission_by_user_and_projectid(self, user_id:int, project_id: int)-> Submissions:
        #get project id for class
        submission = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User == user_id)).order_by(desc("Time")).first()
        return submission

    def get_submission_by_submission_id(self, submission_id: int) -> Submissions:
        submission = Submissions.query.filter(Submissions.Id == submission_id).order_by(desc("Time")).first()
        return submission

    def get_json_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.OutputFilepath

    def get_pylint_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.PylintFilepath    

    def get_code_path_by_submission_id(self, submission_id: int) -> str:
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.CodeFilepath

    def get_pylint_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.PylintFilepath
    def get_pylint_path_by_user_and_project_id(self,user_id:int, project_id:int):
        submission = self.get_submission_by_user_and_projectid(user_id,project_id)
        return submission.PylintFilepath
    
    def get_clangtidy_path_by_user_id(self, user_id:int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.PylintFilepath
        

    def get_json_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.OutputFilepath

    def get_code_path_by_user_id(self, user_id: int) -> str:
        submission = self.get_submission_by_user_id(user_id)
        return submission.CodeFilepath
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool, errorcount: int, level: str, score: int):
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount,SubmissionLevel=level,Points=score)
        db.session.add(submission)
        db.session.commit()
        created_id = submission.Id  # Assuming the auto-incremented ID field is named "ID"
        return created_id

    def get_total_submission_for_all_projects(self) -> Dict[int, int]:
        thisdic={}
        project_ids = Projects.query.with_entities(Projects.Id).all()
        for proj in project_ids:
            count = Submissions.query.with_entities(Submissions.User).filter(Submissions.Project == proj[0]).distinct().count()
            thisdic[proj[0]]=count
        return thisdic

    def get_most_recent_submission_by_project(self, project_id: int, user_ids: List[int]) -> Dict[int, Submissions]:
        holder = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User.in_(user_ids))).order_by(desc(Submissions.Time)).all()
        bucket={}
        for obj in holder:
            if obj.User in bucket:
                if bucket[obj.User].Time < obj.Time:
                    bucket[obj.User] = obj
                else:
                    pass
            else:
                bucket[obj.User] = obj
        return bucket
        

    def get_current_level(self,project_id: int, user_ids: int ) -> str:
        highest_level = StudentProgress.query.filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_ids)).first()
        if highest_level == None:
            return ""
        return highest_level.LatestLevel

    def modifying_level(self, project_id: int, user_id: int, submission_id: str, current_level: str) -> bool:
        level = StudentProgress.query.filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_id)).first()

        if level == None:
            Level_submission = StudentProgress(UserId=user_id,ProjectId=project_id,SubmissionId=submission_id,LatestLevel=current_level)
            db.session.add(Level_submission)
            db.session.commit()
            return True

        level.LatestLevel = current_level
        level.SubmissionId = submission_id
        db.session.commit()
        return True

    def get_project_by_submission_id(self,submission_id: int) -> int:
        submission = Submissions.query.filter(Submissions.Id == submission_id).first()
        return submission.Project

    def get_can_redeemed(self, Config_Repository: ConfigRepository,  user_id: int, previous_project_id: int, project_id: int) -> Tuple[bool, int]:
        if previous_project_id == -1:
            return (False, 0)
        
        submission = self.get_most_recent_submission_by_project(previous_project_id,[user_id])
        if user_id in submission:
            score=submission[user_id].Points
        else:
            score=0

        unlocked=StudentUnlocks.query.filter(and_(StudentUnlocks.ProjectId == project_id, StudentUnlocks.UserId == user_id)).first()
        if not unlocked == None:
            return (False,score)
        
        RedeemNumber=int(Config_Repository.get_config_setting("RedeemValue"))
        if score < RedeemNumber:
            return (False, score)
        return (True,score)
    
    def redeem_score(self,user_id: int, project_id: int,dt_string:str) -> bool:
        entry = StudentUnlocks(UserId=user_id,ProjectId=project_id,Time=dt_string)
        db.session.add(entry)
        db.session.commit()
        return True

    def get_score(self,submission_id:int)->int:
        submission = Submissions.query.filter(Submissions.Id==submission_id).one()
        return submission.Points

    def submission_view_verification(self, submission_id, user_id) -> bool:
        submission = Submissions.query.filter(and_(Submissions.Id==submission_id,Submissions.User==user_id)).first()
        return submission is not None
        
    def unlock_check(self, user_id,project_id) -> bool:
        unlocked_info = StudentUnlocks.query.filter(and_(StudentUnlocks.ProjectId==project_id,StudentUnlocks.UserId==user_id)).first()
        current_day=datetime.today().strftime('%A')
        #TODO: Make this not hardcoded for 2.0
        return (current_day == "Wednesday" and unlocked_info != None)
        
    def submission_counter(self, project_id: int, user_ids: List[int]) -> bool:
        submissions = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User.in_(user_ids))).all()
        submission_counter_dict={}
        for sub in submissions:
            if sub.User in submission_counter_dict:
                submission_counter_dict[sub.User] = submission_counter_dict[sub.User] +1
            else:
                submission_counter_dict[sub.User] = 1
        return submission_counter_dict


    def chatGPT_caller(self, submission_id, question_description, student_output, student_code) -> str:
        print("in subfunctino", flush=True)
        openai.api_key = "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"
        # https://beta.openai.com/docs/models
        # to find average tokens OpenAI's tiktoken Python library.
        model_engine = "gpt-3.5-turbo"  # fastest model
        lines = student_code.strip().split('\n')
        max_line_number_width = len(str(len(lines)))
        lines_with_numbers = [f"{i:>{max_line_number_width}} {line}" for i, line in enumerate(lines, start=1)]
        lined_code = '\n'.join(lines_with_numbers)
        assignment_prompt = f"""
        I failed a test case, give me a single bulletpoint on why this might have happened.

        The Linux diff is: {student_output}  
        A description of the test case is: {question_description}  

        Here is my code
        {lined_code}"""
        try:
            completions = openai.ChatCompletion.create(
                model=model_engine,
                messages=[
                    {"role": "system", "content": assignment_prompt},
                ],
                max_tokens=500,  # Reduce the number of tokens in the response
                temperature=0.5,
            )

            # Get the generated response from completions
            generated_response = completions['choices'][0]['message']['content']

            # Save the generated response into the database
            log = GPTLogs(SubmissionId=submission_id, GPTResponse=generated_response, StudentFeedback=-1, Type=0)
            db.session.add(log)
            db.session.commit()

            # Return the generated response if needed (optional)
            return [generated_response,log.Qid]

        except openai.error.ServiceUnavailableError as e:
            # Handle the error
            message = "The server is overloaded or not ready yet."

    def chatGPT_explainer(self, submission_id, question_description, student_output) -> str:
        print("in subfunctino", flush=True)
        openai.api_key = "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"
        # https://beta.openai.com/docs/models
        # to find average tokens OpenAI's tiktoken Python library.
        model_engine = "gpt-3.5-turbo"  # fastest model
        assignment_prompt = f"""
        Here is my output Linux diff format: {student_output}  
        A description of the test case is: {question_description}

        Write me a sentance on what the diff is telling me, be specific"""
        try:
            completions = openai.ChatCompletion.create(
                model=model_engine,
                messages=[
                    {"role": "system", "content": assignment_prompt},
                ],
                max_tokens=500,  # Reduce the number of tokens in the response
                temperature=0.5,
            )

            # Get the generated response from completions
            generated_response = completions['choices'][0]['message']['content']

            # Save the generated response into the database
            log = GPTLogs(SubmissionId=submission_id, GPTResponse=generated_response, StudentFeedback=-1,Type=1)
            db.session.add(log)
            db.session.commit()

            # Return the generated response if needed (optional)
            return [generated_response,log.Qid]

        except openai.error.ServiceUnavailableError as e:
            # Handle the error
            message = "The server is overloaded or not ready yet."
    def getGPTResponse(self, submission_number) -> str:
        tempdata= GPTLogs.query.filter(GPTLogs.SubmissionId ==submission_number).first()
        return tempdata.GPTResponse
    def Update_GPT_Student_Feedback(self,question_id, student_feedback):
        question = GPTLogs.query.filter(GPTLogs.Qid == question_id).first()
        question.StudentFeedback =int(student_feedback)
        db.session.commit()
        return "ok"





