from src.repositories.database import db
from .models import ClassAssignments, Classes, Labs, LectureSections, Config
from sqlalchemy import desc, and_
from typing import List

class ConfigRepository():
    def get_config_setting(self, name: str) -> str:
        config = Config.query.filter(Config.Name == name).one()
        return config.Value

        