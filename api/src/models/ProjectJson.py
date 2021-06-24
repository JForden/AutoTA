import json
import datetime

class ProjectJson:
    Id = -1
    Name = ""
    Start = ""
    End = ""
    TotalSubmissions = -1

    def __init__(self, id, name, start, end, totalSubmissions):
        self.Id = id
        self.Name = name
        self.Start = start
        self.End = end
        self.TotalSubmissions = totalSubmissions
    
    def json_default(self, value):
        if isinstance(value, datetime.date):
            return dict(year=value.year, month=value.month, day=value.day)
        else:
            return value.__dict__

    def toJson(self):
        return json.dumps(self, default=lambda o: self.json_default(o))
