import datetime
import json


class LabJson:
    Id = -1
    Name = ""

    def __init__(self, id: int, name: str):
        self.Id = id
        self.Name = name

    def json_default(self, value):
        if isinstance(value, datetime.date):
            return dict(year=value.year, month=value.month, day=value.day)
        else:
            return value.__dict__

    def toJson(self):
        return json.dumps(self, default=lambda o: self.json_default(o))
