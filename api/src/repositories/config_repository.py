from src.repositories.database import db
from .models import ClassAssignments, Classes, Labs, LectureSections, Config, LectureSectionSettings
from sqlalchemy import desc, and_
from typing import List

class ConfigRepository():
    def get_config_setting(self, name: str) -> str:
        config = Config.query.filter(Config.Name == name).one()
        return config.Value
        
    def change_unlockday_toggle(self, boolval:int, lecture_ids: List[int]) -> bool:
        for lecture_id in lecture_ids:
            TableResult = LectureSectionSettings.query.filter(LectureSectionSettings.LectureSectionId == lecture_id).one()
            TableResult.HasUnlockEnabled = boolval
        db.session.commit()
        
        return True

    def change_score_toggle(self, boolval:int, lecture_ids: List[int]) -> bool:
        for lecture_id in lecture_ids:
            TableResult = LectureSectionSettings.query.filter(LectureSectionSettings.LectureSectionId == lecture_id).one()
            TableResult.HasScoreEnabled = boolval
        db.session.commit()
        return True
    
    def change_tbs_toggle(self, boolval:int, lecture_ids: List[int]) -> bool:
        for lecture_id in lecture_ids:
            TableResult = LectureSectionSettings.query.filter(LectureSectionSettings.LectureSectionId == lecture_id).one()
            TableResult.HasTBSEnabled = boolval
        db.session.commit()
        return True
        
    def get_lecture_section_settings(self, lecture_id:int) -> dict:
        TableResult = LectureSectionSettings.query.filter(LectureSectionSettings.LectureSectionId == lecture_id).one()
        LectureConfigDict={}
        LectureConfigDict["LectureSectionId"] = TableResult.LectureSectionId
        LectureConfigDict["HasUnlockEnabled"] = TableResult.HasUnlockEnabled
        LectureConfigDict["HasScoreEnabled"] = TableResult.HasScoreEnabled
        LectureConfigDict["HasTBSEnabled"] = TableResult.HasTBSEnabled

        return LectureConfigDict
        