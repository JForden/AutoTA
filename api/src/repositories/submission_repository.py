import openai
from src.repositories.database import db
from .models import GPTLogs, StudentQuestions, StudentUnlocks, Submissions, Projects, StudentProgress, Users, ChatGPTkeys
from sqlalchemy import desc, and_
from typing import Dict, List, Tuple
from src.repositories.config_repository import ConfigRepository
from datetime import datetime, timedelta

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
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool, errorcount: int, level: str, score: int, is_visible: int):
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount,SubmissionLevel=level,Points=score, visible=is_visible)
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
    def Submit_Student_OH_question(self, question, user_id, project_id):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        student_question = StudentQuestions(StudentQuestionscol=question, StudentId=user_id, dismissed=0, ruling=-1, TimeSubmitted=dt_string, projectId=project_id)
        db.session.add(student_question)
        db.session.commit()
        return str(student_question.Sqid)
    def Submit_OH_ruling(self, question_id, ruling):
        question = StudentQuestions.query.filter(StudentQuestions.Sqid == question_id).first()
        question.ruling = int(ruling)
        if(int(ruling) == 0):
            question.dismissed = int(1)
        else:
            question.TimeAccepted = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        db.session.commit()
        return "ok"
    def Submit_OH_dismiss(self, question_id):
        question = StudentQuestions.query.filter(StudentQuestions.Sqid == question_id).first()
        question.dismissed = int(1)
        question.TimeCompleted = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        db.session.commit()
        return "ok"
    def Get_all_OH_questions(self):
        #get all questions that have not been dismissed
        questions = StudentQuestions.query.filter(StudentQuestions.dismissed == 0).all()
        return questions
    def get_active_question(self, user_id):
        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.dismissed == 0)).first()
        if question == None:
            return -1
        return question.Sqid
    def check_timeout(self, user_id, project_id):
        tbs_settings = [5, 15, 45, 60, 90, 120, 120, 120]
        #get the two most recent submissions for a given projectID
        submissions = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User == user_id, Submissions.visible ==1)).order_by(desc(Submissions.Time)).first()
        #get the time of the most recent submission
        if submissions == None:
            return 1
        most_recent_submission = submissions.Time
        project_start_date = Projects.query.filter(Projects.Id == project_id).first().Start
        #Get how many days have passed since the project start date
        days_passed = (datetime.now() - project_start_date).days
        if days_passed > 7:
            days_passed = 7
        # get current time
        current_time = datetime.now()
        print("current timeout time: ", tbs_settings[days_passed], flush=True)
        #given the student ID and project, query to see if there was a question asked for this project, get the most recent question
        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == project_id)).order_by(desc(StudentQuestions.TimeSubmitted)).first()
        if question == None:
            if most_recent_submission + timedelta(minutes=tbs_settings[days_passed]) < current_time:
                return 1
        if question != None:
            if question.ruling ==1:
                if(question.dismissed == 0):
                    return 1
                if question.TimeSubmitted + timedelta(hours=3) > current_time:
                    if most_recent_submission + timedelta(minutes=(tbs_settings[days_passed])/3) < current_time:
                        return 1
                    else:
                        return 0
                else:
                    if most_recent_submission + timedelta(minutes=tbs_settings[days_passed]) < current_time:
                        return 1
                    else:
                        return 0
        return 0
    def check_visibility(self, user_id, project_id):
        # Get most recent submission given userId and projectID
        submission = Submissions.query.filter(and_(Submissions.User == user_id, Submissions.Project == project_id)).order_by(desc(Submissions.Time)).first()
        if submission == None:
            print("Error: No submission found", flush=True)
        if submission.visible == 1:
            return True
        return False
    
    def get_remaining_OH_Time(self, user_id, project_id):
        #Get the most recent question asked by the student for the given project that is dismissed
        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == project_id, StudentQuestions.dismissed == 1)).order_by(desc(StudentQuestions.TimeSubmitted)).first()
        #Get how long until this time is the current time
        if question == None:
            return 0
        current_time = datetime.now()
        time_remaining = question.TimeCompleted + timedelta(hours=3) - current_time
        return time_remaining.seconds/60
    



