from .models import Config


class ConfigRepository():
    def get_config_setting(self, name: str) -> str:
        config = Config.query.filter(Config.Name == name).one()
        return config.Value