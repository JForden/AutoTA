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

class SubmissionRepository():
    def get_submission_by_user_id(self, user_id: int) -> Submissions:
        """Returns the latest submission made by a user with the given user_id.

        Args:
            user_id (int): The ID of the user whose submission is to be retrieved.

        Returns:
            Submissions: The latest submission made by the user with the given user_id.
        """
        submission = Submissions.query.filter(Submissions.User == user_id).order_by(desc("Time")).first()
        return submission
    def get_submission_by_user_and_projectid(self, user_id:int, project_id: int)-> Submissions:
        """Returns the latest submission made by a user for a given project.

        Args:
            user_id (int): The ID of the user.
            project_id (int): The ID of the project.

        Returns:
            Submissions: The latest submission object made by the user for the given project.
        """
        submission = Submissions.query.filter(and_(Submissions.Project == project_id, Submissions.User == user_id, Submissions.visible== 1)).order_by(desc("Time")).first()
        return submission

    def get_submission_by_submission_id(self, submission_id: int) -> Submissions:
        """Retrieves a submission by its ID.

        Args:
            submission_id (int): The ID of the submission to retrieve.

        Returns:
            Submissions: The submission object with the specified ID.
        """
        submission = Submissions.query.filter(Submissions.Id == submission_id).order_by(desc("Time")).first()
        return submission


    #TODO: Several of these functions for getting Pylint paths are redundant. We should refactor them to use the same function, or simple parse the object we get back from the database in the API layer.
    def get_pylint_path_by_submission_id(self, submission_id: int) -> str:
        """Returns the Pylint filepath for a given submission ID.

        Args:
            submission_id (int): The ID of the submission.

        Returns:
            str: The filepath of the Pylint file for the submission.
        """
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.PylintFilepath

    def get_code_path_by_submission_id(self, submission_id: int) -> str:
        """Returns the file path of the code file associated with a submission.

        Args:
            submission_id (int): The ID of the submission.

        Returns:
            str: The file path of the code file associated with the submission.
        """
        submission = self.get_submission_by_submission_id(submission_id)
        return submission.CodeFilepath

    def read_code_file(self, code_path) -> str:
        """Returns the contents of the code file associated with a given submission.

        Args:
            submission_id (int): The ID of the submission.

        Returns:
            str: The contents of the code file associated with the submission.
        """
        student_file = ""
        #TODO: Make More Robust for Multiple Files, this simply grabs the first file in the directory
        if os.path.isdir(code_path):
            for filename in os.listdir(code_path):
                with open(filename, "r") as f:
                    student_file = f.read()
                break
        else:
            with open(code_path, "r") as f:
                student_file = f.read()
        return student_file
    def read_output_file(self, output_path) -> str:
        """Returns the contents of the output file associated with a given submission.

        Args:
            submission_id (int): The ID of the submission.

        Returns:
            str: The contents of the output file associated with the submission.
        """
        student_output_file = ""
        with open(output_path, "r") as f:
            student_output_file = f.read()
        return student_output_file

    def get_pylint_path_by_user_and_project_id(self,user_id:int, project_id:int):
        """
        Returns the file path of the Pylint report for a given user and project ID.

        Args:
        user_id (int): The ID of the user.
        project_id (int): The ID of the project.

        Returns:
        str: The file path of the Pylint report.
        """
        submission = self.get_submission_by_user_and_projectid(user_id,project_id)
        return submission.PylintFilepath
    
    def create_submission(self, user_id: int, output: str, codepath: str, pylintpath: str, time: str, project_id: int,status: bool, errorcount: int, level: str, score: int, is_visible: int, testcase_results: str, linting_results: str):
        """Creates a new submission record in the database.

        Args:
            user_id (int): The ID of the user who submitted the code.
            output (str): The filepath of the output file generated by the code.
            codepath (str): The filepath of the code file submitted.
            pylintpath (str): The filepath of the pylint output file.
            time (str): The time at which the submission was made.
            project_id (int): The ID of the project for which the code was submitted.
            status (bool): Whether the submission passed or failed.
            errorcount (int): The number of pylint errors in the code.
            level (str): The level of the submission (e.g. beginner, intermediate, advanced).
            score (int): The score awarded to the submission.
            is_visible (int): Whether the submission is visible to the student, or locked due to TBS.

        Returns:
            int: The ID of the newly created submission record.
        """
        submission = Submissions(OutputFilepath=output, CodeFilepath=codepath, PylintFilepath=pylintpath, Time=time, User=user_id, Project=project_id,IsPassing=status,NumberOfPylintErrors=errorcount,SubmissionLevel=level,Points=score, visible=is_visible, TestCaseResults=str(testcase_results), LintingResults=str(linting_results))
        db.session.add(submission)
        db.session.commit()
        created_id = submission.Id  # Assuming the auto-incremented ID field is named "ID"
        return created_id

    def get_total_submission_for_all_projects(self) -> Dict[int, int]:
        """
        Returns a dictionary containing the total number of unique submissions for each project.

        Returns:
        - A dictionary where the keys are project IDs and the values are the total number of unique submissions for that project.
        """
        thisdic={}
        project_ids = Projects.query.with_entities(Projects.Id).all()
        for proj in project_ids:
            count = Submissions.query.with_entities(Submissions.User).filter(Submissions.Project == proj[0]).distinct().count()
            thisdic[proj[0]]=count
        return thisdic

    def get_most_recent_submission_by_project(self, project_id: int, user_ids: List[int]) -> Dict[int, Submissions]:
        """
        Returns a dictionary containing the most recent submission for each user in a given project.

        Args:
            project_id (int): The ID of the project to search for submissions.
            user_ids (List[int]): A list of user IDs to search for submissions.

        Returns:
            Dict[int, Submissions]: A dictionary where the keys are user IDs and the values are the most recent submission for each user.
        """
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
        

    def get_current_level(self, project_id: int, user_ids: int) -> str:
        """
        Returns the latest level of a given project for a given user.

        Args:
        - project_id (int): The ID of the project.
        - user_ids (int): The ID of the user.

        Returns:
        - str: The latest level of the project for the user. Returns an empty string if the user has not made any progress.
        """
        highest_level = StudentProgress.query.filter(and_(StudentProgress.ProjectId == project_id, StudentProgress.UserId == user_ids)).first()
        if highest_level == None:
            return ""
        return highest_level.LatestLevel

    def modifying_level(self, project_id: int, user_id: int, submission_id: str, current_level: str) -> bool:
        """
        Modifies the level of a student's progress in a project.

        Args:
            project_id (int): The ID of the project.
            user_id (int): The ID of the user.
            submission_id (str): The ID of the submission.
            current_level (str): The current level of the student's progress.

        Returns:
            bool: True if the level was successfully modified
        """
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

    def get_project_by_submission_id(self, submission_id: int) -> int:
        """Returns the project ID associated with a given submission ID.

        Args:
            submission_id (int): The ID of the submission.

        Returns:
            int: The ID of the project associated with the submission.
        """
        submission = Submissions.query.filter(Submissions.Id == submission_id).first()
        return submission.Project

    def submission_view_verification(self, user_id, submission_id) -> bool:
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
        
        # Remove all comment lines from the code
        lines = lined_code.split('\n')
        lines = [line for line in lines if not line.strip().startswith('#')]
        lined_code = '\n'.join(lines)

        assignment_prompt = f"""
        I failed a test case, give me a single succinct bulletpoint on why this might have happened.

        The Linux diff is: {student_output}  
        A description of the test case is: {question_description}  

        Here is my code
        {lined_code}"""
        try:
            completions = openai.chat.completions.create(
                model=model_engine,
                messages=[
                    {"role": "system", "content": assignment_prompt},
                ],
                max_tokens=500,  # Reduce the number of tokens in the response
                temperature=0.5,
            )

            # Get the generated response from completions
            generated_response = completions.choices[0].message.content

            # Save the generated response into the database
            log = GPTLogs(SubmissionId=submission_id, GPTResponse=generated_response, StudentFeedback=-1, Type=0)
            db.session.add(log)
            db.session.commit()

            # Return the generated response if needed (optional)
            return [generated_response,log.Qid]

        except openai.error.ServiceUnavailableError as e:
            # Handle the error
            message = "The server is overloaded or not ready yet."
            return message

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
            completions = openai.chat.completions.create(
                model=model_engine,
                messages=[
                    {"role": "system", "content": assignment_prompt},
                ],
                max_tokens=500,  # Reduce the number of tokens in the response
                temperature=0.5,
            )

            # Get the generated response from completions
            generated_response = completions.choices[0].message.content
            # Save the generated response into the database
            log = GPTLogs(SubmissionId=submission_id, GPTResponse=generated_response, StudentFeedback=-1,Type=1)
            db.session.add(log)
            db.session.commit()

            # Return the generated response if needed (optional)
            return [generated_response,log.Qid]

        except openai.error.ServiceUnavailableError as e:
            # Handle the error
            message = "The server is overloaded or not ready yet."
            return message
        
    def descriptionGPT_caller(self, solutionpath, input, project_id):
        openai.api_key = "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"
        solution_code = ""
        if os.path.isdir(solutionpath):
            for filename in os.listdir(solutionpath):
                with open(filename, "r") as f:
                    solution_code = f.read()
                break
        else:
            with open(solutionpath, 'r') as file:
                solution_code = file.read()
        print("solution code is: ", solution_code, flush=True)
        # https://beta.openai.com/docs/models
        # to find average tokens OpenAI's tiktoken Python library.
        model_engine = "gpt-3.5-turbo"  # fastest model
        assignment_prompt = f"""
        Please provide a brief, conversational description of what this test case aims to achieve without disclosing the specific input or solution code.
        Here is the testcase input: {input} and here is the solution code: {solution_code}"""
        try:
            completions = openai.chat.completions.create(
                model=model_engine,
                messages=[
                    {"role": "system", "content": assignment_prompt},
                ],
                max_tokens=500,  # Reduce the number of tokens in the response
                temperature=0.5,
            )

            # Get the generated response from completions
            generated_response = completions.choices[0].message.content
            # Save the generated response into the database

            # Return the generated response if needed (optional)
            log = GPTLogs(SubmissionId=project_id, GPTResponse=generated_response, StudentFeedback=-2,Type=-2)
            db.session.add(log)
            db.session.commit()

            return [generated_response]

        except openai.error.ServiceUnavailableError as e:
            # Handle the error
            message = "The server is overloaded or not ready yet."
            return message

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
        #Get classId based on the projectID
        project = Projects.query.filter(Projects.Id == question.projectId).first()
        classId = project.ClassId
        question.dismissed = int(1)
        question.TimeCompleted = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        db.session.commit()
        return [question.StudentId, classId]
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
            return [1, "None"]
        most_recent_submission = submissions.Time
        project_start_date = Projects.query.filter(Projects.Id == project_id).first().Start
        #Get how many days have passed since the project start date
        days_passed = (datetime.now() - project_start_date).days
        if days_passed > 7:
            days_passed = 7
        # get current time
        current_time = datetime.now()
        #given the student ID and project, query to see if there was a question asked for this project, get the most recent question
        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == project_id)).order_by(desc(StudentQuestions.TimeSubmitted)).first()
        time_until_resubmission=""
        tbs_threshold = tbs_settings[days_passed]
        if question == None:
            if most_recent_submission + timedelta(minutes=tbs_threshold) < current_time:
                return [1, "None"]
        time_until_resubmission = most_recent_submission + timedelta(minutes=tbs_threshold) - current_time
        if question is not None and question.ruling == 1:
            if question.dismissed == 0:
                return [1, "None"]
            submission_time_limit = question.TimeSubmitted + timedelta(hours=3)
            if submission_time_limit > current_time:
                if most_recent_submission + timedelta(minutes=tbs_threshold / 3) < current_time:
                    return [1, "None"]
                time_until_resubmission = most_recent_submission + timedelta(minutes=tbs_threshold / 3) - current_time
            else:
                if most_recent_submission + timedelta(minutes=tbs_threshold) < current_time:
                    return [1, "None"]
        return [0, time_until_resubmission]

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
        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == int(project_id), StudentQuestions.dismissed == 1)).order_by(desc(StudentQuestions.TimeSubmitted)).first()
        #Get how long until this time is the current time
        if question == None:
            return "Expired"
        elif question.TimeAccepted == None:
            formatted_time_remaining = f"{3} hours, {0} minutes" 
            return formatted_time_remaining 
        current_time = datetime.now()
        time_remaining = question.TimeCompleted + timedelta(hours=3) - current_time
        if time_remaining < timedelta(minutes=0):
            formatted_time_remaining = "Expired"
        else:
            hours = time_remaining.seconds // 3600
            minutes = (time_remaining.seconds % 3600) // 60
            formatted_time_remaining = f"{hours} hours, {minutes} minutes" 
        return formatted_time_remaining 
    
    def get_number_of_questions_asked(self, user_id, project_id):
        number_of_questions = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == int(project_id))).count()
        return number_of_questions
    
    def get_student_questions_asked(self, user_id, project_id):
        questions = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.projectId == int(project_id))).all()
        return questions
    
    def get_all_submissions_for_project(self, project_id):
        submissions = Submissions.query.filter(Submissions.Project == project_id).all()
        return submissions

    def get_all_submission_times(self, project_id):
        project = Projects.query.filter(Projects.Id == project_id).first()
        project_start_date = project.Start
        project_end_date = project.End

        blocks = [
            '12:00 AM - 2:00 AM',
            '2:00 AM - 4:00 AM',
            '4:00 AM - 6:00 AM',
            '6:00 AM - 8:00 AM',
            '8:00 AM - 10:00 AM',
            '10:00 AM - 12:00 PM',
            '12:00 PM - 2:00 PM',
            '2:00 PM - 4:00 PM',
            '4:00 PM - 6:00 PM',
            '6:00 PM - 8:00 PM',
            '8:00 PM - 10:00 PM',
            '10:00 PM - 12:00 AM'
        ]
        submissions_dict = {(project_start_date + timedelta(days=i)).strftime('%A %b %d'): {block: 0 for block in blocks} for i in range(8)}

        submissions = Submissions.query.filter(Submissions.Project == project_id).all()

        students ={}
        for submission in submissions:
            
            if submission.User not in students:
                if submission.IsPassing == 1:
                    students[submission.User] = -1
                else:
                    students[submission.User] = 1
            else:
                if submission.IsPassing == 1:
                    students[submission.User] = -1
                else:
                    if students[submission.User] != -1:
                        students[submission.User] += 1
            date = submission.Time.date()
            weekday_date = date.strftime('%A %b %d')
            hour = submission.Time.hour
            if (date < project_start_date.date()) or (date > (project_start_date.date() + timedelta(days=9))):
                continue

            if weekday_date not in submissions_dict:
                submissions_dict[weekday_date] = {block: 0 for block in blocks}

            block_index = hour // 2
            block = blocks[block_index]

            submissions_dict[weekday_date][block] += 1

        students = {student: value for student, value in students.items() if value != -1}
        students = dict(sorted(students.items(), key=lambda item: item[1], reverse=True)[:10])
        
        students_list = []
        for student_id in students:
            student = Users.query.filter(Users.Id == student_id).first()
            students_list.append([student_id,  students[student_id],student.Firstname, student.Lastname, student.Email])

        # Create a list of weekdays starting from start_weekday and ending on the day before start_weekday in the next week
        weekdays = []
        for i in range(9):
            date = project_start_date + timedelta(days=i)
            weekdays.append(date.strftime('%A %b %d'))
        submission_heatmap = []
        for weekday_date in weekdays:
            blocks = submissions_dict.get(weekday_date)
            if blocks:
                data = list(blocks.values())
                submission_heatmap.append({
                    'name': weekday_date,
                    'data': data
                })
            else:
                submission_heatmap.append({
                    'name': weekday_date,
                    'data': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                })
        #reverse the list so that the days are in order
        submission_heatmap.reverse()

        return submission_heatmap, students_list
    
    def day_to_day_visualizer(self, project_id, user_ids):

        project = Projects.query.filter(Projects.Id == project_id).first()
        project_start_date = project.Start
        project_end_date = project.End

        dates = []
        date = project_start_date

        days_live = (project_end_date - project_start_date).days
        for i in range(days_live + 1):
            dates.append(date.strftime('%Y/%m/%d'))
            date += timedelta(days=1)
        

        passed =[0 for i in range(days_live + 1)]
        failed =[0 for i in range(days_live + 1)]
        no_submission =[0 for i in range(days_live + 1)]

        submissions = Submissions.query.filter(Submissions.Project == project_id).all()
        
        for user_Id in user_ids:
            passed_flag = False # flag to check if the user has passed the project for a given date
            submission_flag = False # flag to check if the user has submitted for a given date
            for date in dates:
                for submission in submissions:
                    if submission.Time.strftime('%Y/%m/%d') == date and submission.User == user_Id:
                        submission_flag = True
                        if submission.IsPassing:
                            passed_flag = True
                            break
                if not submission_flag:
                    no_submission[dates.index(date)] += 1
                else:
                    if passed_flag:
                        passed[dates.index(date)] += 1
                    else:
                        failed[dates.index(date)] += 1
    
        return dates, passed, failed, no_submission
    def get_all_submissions_for_user(self, user_id):
        submissions = Submissions.query.filter(Submissions.User == user_id).all()
        return submissions
    def get_project_scores(self, project_id):
        scores = StudentGrades.query.filter(StudentGrades.Pid == project_id).all()
        student_list = []
        for score in scores:
            student_list.append([score.Sid, score.Grade])
        return student_list
    def submitSuggestion(self, user_id, suggestion):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        suggestion = StudentSuggestions(UserId=user_id, StudentSuggestionscol=suggestion, TimeSubmitted=dt_string)
        db.session.add(suggestion)
        db.session.commit()
        return "ok"
    def log_code_snippet(self, user_id, code, language, input, result ):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        # Don't need to sanitize code input as using an ORM (Object-Relational Mapping) library aka SQLAlchemy automatically parameterizes queries to prevent SQL injection
        snippet = SnippetRuns(UserId=user_id, Code=code, Language=language, TestCaseInput=input, Result=result, TimeSubmitted=dt_string)
        db.session.add(snippet)
        db.session.commit()
        return "ok"
    def get_charges(self, user_id, class_id, project_id):
        tbs_settings = [5, 15, 45, 60, 90, 120, 120, 120]
        tbs_settings = [i * 3 for i in tbs_settings]
        project_start_date = Projects.query.filter(Projects.Id == project_id).first().Start
        charges = SubmissionCharges.query.filter(and_(SubmissionCharges.UserId == user_id, SubmissionCharges.ClassId == class_id)).first()
        if charges is None:
            charge = SubmissionCharges(UserId=user_id, ClassId=class_id, BaseCharge=3, RewardCharge=0)
            db.session.add(charge)
            db.session.commit()
            return [3, 0]
        try:
            charges = SubmissionCharges.query.filter(and_(SubmissionCharges.UserId == user_id, SubmissionCharges.ClassId == class_id)).first()

            # If the charges are less than 3, pull most recent Charge Redemptions and award charges.
            if charges.BaseCharge < 3:
                # Get the 3 most recent charge redemptions for the student
                
                charge_redemptions = SubmissionChargeRedeptions.query.filter(and_(SubmissionChargeRedeptions.UserId == int(user_id), SubmissionChargeRedeptions.ClassId == int(class_id), SubmissionChargeRedeptions.projectId == int(project_id), SubmissionChargeRedeptions.Type=="base", SubmissionChargeRedeptions.Recouped==0)).order_by(desc(SubmissionChargeRedeptions.RedeemedTime)).all()
                
                for charge in charge_redemptions:
                    #Idenify on what date the charge was redeemed
                    charge_date = charge.RedeemedTime
                    #Identify how many days have passed since the project start date
                    days_passed = (charge_date - project_start_date).days
                    #If more than 7 days have passed, set the days passed to 7
                    if days_passed > 7:
                        days_passed = 7
                    #Get the TBS threshold for the given day
                    tbs_threshold = tbs_settings[days_passed]
                    #Identify the current time, and see if it's greater than the time the charge was redeemed + the TBS threshold for the given day
                    if datetime.now() > charge.RedeemedTime + timedelta(minutes=tbs_threshold):
                        #Award the student a charge
                        charges.BaseCharge += 1
                        #Recoup the charge
                        charge.Recouped = 1
                        db.session.commit()
        except  Exception as e:
            return [0, 0]
        return [charges.BaseCharge, charges.RewardCharge]
    def get_time_until_recharge(self, user_id, class_id, project_id):
        project_start_date = Projects.query.filter(Projects.Id == project_id).first().Start
        #Get how many days have passed since the project start date
        tbs_settings = [5, 15, 45, 60, 90, 120, 120, 120]
        tbs_settings = [i * 3 for i in tbs_settings]
        charge_redemptions = SubmissionChargeRedeptions.query.filter(
            and_(
                SubmissionChargeRedeptions.UserId == user_id, 
                SubmissionChargeRedeptions.ClassId == class_id, 
                SubmissionChargeRedeptions.projectId == project_id, 
                SubmissionChargeRedeptions.Recouped == 0,
                SubmissionChargeRedeptions.Type=="base"
            )
        ).order_by(SubmissionChargeRedeptions.RedeemedTime).first()
        #Idenify on what date the charge was redeemed

        charge_date = charge_redemptions.RedeemedTime


        #Identify how many days have passed since the project start date
        days_passed = (charge_date - project_start_date).days
        if days_passed > 7:
            days_passed = 7
        #Get the TBS threshold for the given day
        tbs_threshold = tbs_settings[days_passed]
         
        # Get the time until the next recharge
        time_until_resubmission = charge_redemptions.RedeemedTime + timedelta(minutes=tbs_threshold) - datetime.now()

        return time_until_resubmission
    def consume_charge(self, user_id, class_id, project_id, submission_id):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        charge = SubmissionCharges.query.filter(and_(SubmissionCharges.UserId == user_id, SubmissionCharges.ClassId == class_id)).first()
        
        
        
        submission_charge = None

        visible = 0 
        #Determine if a user is in an active office hour session, if so, do not charge a student

        question = StudentQuestions.query.filter(and_(StudentQuestions.StudentId == user_id, StudentQuestions.dismissed == 0)).first()
        print("Question is: ", question, flush=True)
        time_until_resubmission=""
        if question is not None and question.ruling == 1:
            visible= 1
            submission = Submissions.query.filter(Submissions.Id == submission_id).first()
            submission.visible = visible
            db.session.commit()
            return "ok"
        #Determine if a user has redeemed a reward charge for the given project
        reward_charge = SubmissionChargeRedeptions.query.filter(and_(SubmissionChargeRedeptions.UserId == user_id, SubmissionChargeRedeptions.ClassId == class_id, SubmissionChargeRedeptions.projectId == project_id, SubmissionChargeRedeptions.Type=="reward")).all()
        if len(reward_charge) > 0:
            for reward in reward_charge:
                if reward.RedeemedTime == None:
                    reward.RedeemedTime = dt_string
                    reward.submissionId = submission_id
                    db.session.commit()
                    visible= 1
                    submission = Submissions.query.filter(Submissions.Id == submission_id).first()
                    submission.visible = visible
                    db.session.commit()
                    return "ok"
        if charge.BaseCharge > 0:
            charge.BaseCharge -= 1
            submission_charge = SubmissionChargeRedeptions(UserId=user_id, ClassId=class_id, projectId=project_id, Type="base", ClaimedTime=dt_string, RedeemedTime=dt_string, SubmissionId=submission_id,  Recouped=0)
            db.session.add(submission_charge)
            db.session.commit()
            visible= 1
        #Update the visibility of the submission
        submission = Submissions.query.filter(Submissions.Id == submission_id).first()
        submission.visible = visible
        db.session.commit()
        return "ok"

    def Charge_use_accounting(self, submission_id, charge_id):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        charge = SubmissionChargeRedeptions.query.filter(SubmissionChargeRedeptions.Id == charge_id).first()
        charge.submissionId = submission_id
        charge.RedeemedTime = dt_string
        db.session.commit()
        return "ok"
    def add_reward_charge(self, user_id, class_id, rewardAmount):
        charge = SubmissionCharges.query.filter(and_(SubmissionCharges.UserId == user_id, SubmissionCharges.ClassId == class_id)).first()
        charge.RewardCharge += rewardAmount
        if charge.RewardCharge > 5:
            charge.RewardCharge = 5
        db.session.commit()
    def consume_reward_charge(self, user_id, class_id, project):
        dt_string = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        try:
            student_submissionCharges = SubmissionCharges.query.filter(and_(SubmissionCharges.UserId == user_id, SubmissionCharges.ClassId == class_id)).first()
            if student_submissionCharges.RewardCharge < 1:
                return 0
            student_submissionCharges.RewardCharge -= 1

            reward_charge = SubmissionChargeRedeptions(UserId=user_id, ClassId=class_id, projectId=project, Type="reward", ClaimedTime=dt_string, Recouped=1)
            db.session.add(reward_charge)
            db.session.commit()
            
            return 1
        except Exception as e:
            print("An error occurred while handling the database operation", e)
            db.session.rollback()
            return 0
        


    



