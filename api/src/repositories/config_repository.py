from abc import ABC, abstractmethod
from typing import Optional
from .models import Config
from .database import Session
from datetime import datetime


class AConfigRepository(ABC):
    @abstractmethod
    def get_config_setting(self, name: str) -> str:
        """[an abstract method]"""
        pass

class ConfigRepository(AConfigRepository):
    def get_config_setting(self, name: str) -> str:
        session = Session()
        config = session.query(Config).filter(Config.Name == name).one()
        session.close()
        return config.Value