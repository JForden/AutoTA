import json
from abc import ABC, abstractmethod
from src.constants import BASE_URL

class LinkService(ABC):
    @abstractmethod
    def add_link_info_links(self, output: str) -> str:
        pass

class PylintLinkService(LinkService):
    def add_link_info_links(self, output: str) -> str:
        link = {
            "C0102": BASE_URL + "basic/C0102",
            "C0103": BASE_URL + "basic/C0103",
            "C0112": BASE_URL + "basic/C0112",
            "C0114": BASE_URL + "basic/C0114",
            "C0115": BASE_URL + "basic/C0115",
            "C0116": BASE_URL + "basic/C0116",
            "C0121": BASE_URL + "basic/C0121",
            "C0122": BASE_URL + "basic/C0122",
            "C0123": BASE_URL + "basic/C0123",
            "E0100": BASE_URL + "basic/E0100",
            "E0101": BASE_URL + "basic/E0101",
            "E0102": BASE_URL + "basic/E0102",
            "E0103": BASE_URL + "basic/E0103",
            "E0104": BASE_URL + "basic/E0104",
            "E0105": BASE_URL + "basic/E0105",
            "E0106": BASE_URL + "basic/E0106",
            "E0107": BASE_URL + "basic/E0107",
            "E0108": BASE_URL + "basic/E0108",
            "E0110": BASE_URL + "basic/E0110",
            "E0111": BASE_URL + "basic/E0111",
            "E0112": BASE_URL + "basic/E0112",
            "E0113": BASE_URL + "basic/E0113",
            "E0114": BASE_URL + "basic/E0114",
            "E0115": BASE_URL + "basic/E0115",
            "E0116": BASE_URL + "basic/E0116",
            "E0117": BASE_URL + "basic/E0117",
            "E0118": BASE_URL + "basic/E0118",
            "E0119": BASE_URL + "basic/E0119",
            "R0123": BASE_URL + "basic/R0123",
            "R0124": BASE_URL + "basic/R0124",
            "W0101": BASE_URL + "basic/W0101",
            "W0102": BASE_URL + "basic/W0102",
            "W0104": BASE_URL + "basic/W0104",
            "W0105": BASE_URL + "basic/W0105",
            "W0106": BASE_URL + "basic/W0106",
            "W0107": BASE_URL + "basic/W0107",
            "W0108": BASE_URL + "basic/W0108",
            "W0109": BASE_URL + "basic/W0109",
            "W0111": BASE_URL + "basic/W0111",
            "W0120": BASE_URL + "basic/W0120",
            "W0122": BASE_URL + "basic/W0122",
            "W0123": BASE_URL + "basic/W0123",
            "W0124": BASE_URL + "basic/W0124",
            "W0125": BASE_URL + "basic/W0125",
            "W0126": BASE_URL + "basic/W0126",
            "W0127": BASE_URL + "basic/W0127",
            "W0128": BASE_URL + "basic/W0128",
            "W0143": BASE_URL + "basic/W0143",
            "W0150": BASE_URL + "basic/W0150",
            "W0199": BASE_URL + "basic/W0199",
            "W0717": BASE_URL + "broad-try-clause/W0717",
            "C0202": BASE_URL + "classes/C0202",
            "C0203": BASE_URL + "classes/C0203",
            "C0204": BASE_URL + "classes/C0204",
            "C0205": BASE_URL + "classes/C0205",
            "E0202": BASE_URL + "classes/E0202",
            "E0203": BASE_URL + "classes/E0203",
            "E0211": BASE_URL + "classes/E0211",
            "E0213": BASE_URL + "classes/E0213",
            "E0236": BASE_URL + "classes/E0236",
            "E0237": BASE_URL + "classes/E0237",
            "E0238": BASE_URL + "classes/E0238",
            "E0239": BASE_URL + "classes/E0239",
            "E0240": BASE_URL + "classes/E0240",
            "E0241": BASE_URL + "classes/E0241",
            "E0242": BASE_URL + "classes/E0242",
            "E0301": BASE_URL + "classes/E0301",
            "E0302": BASE_URL + "classes/E0302",
            "E0303": BASE_URL + "classes/E0303",
            "F0202": BASE_URL + "classes/F0202",
            "R0201": BASE_URL + "classes/R0201",
            "R0202": BASE_URL + "classes/R0202",
            "R0203": BASE_URL + "classes/R0203",
            "R0205": BASE_URL + "classes/R0205",
            "R0206": BASE_URL + "classes/R0206",
            "W0201": BASE_URL + "classes/W0201",
            "W0211": BASE_URL + "classes/W0211",
            "W0212": BASE_URL + "classes/W0212",
            "W0221": BASE_URL + "classes/W0221",
            "W0222": BASE_URL + "classes/W0222",
            "W0223": BASE_URL + "classes/W0223",
            "W0231": BASE_URL + "classes/W0231",
            "W0232": BASE_URL + "classes/W0232",
            "W0233": BASE_URL + "classes/W0233",
            "W0235": BASE_URL + "classes/W0235",
            "W0236": BASE_URL + "classes/W0236",
            "C1901": BASE_URL + "compare-to-empty-string/C1901",
            "C2001": BASE_URL + "compare-to-zero/C2001",
            "W0141": BASE_URL + "deprecated-builtins/W0141",
            "R0901": BASE_URL + "design/R0901",
            "R0902": BASE_URL + "design/R0902",
            "R0903": BASE_URL + "design/R0903",
            "R0904": BASE_URL + "design/R0904",
            "R0911": BASE_URL + "design/R0911",
            "R0912": BASE_URL + "design/R0912",
            "R0913": BASE_URL + "design/R0913",
            "R0914": BASE_URL + "design/R0914",
            "R0915": BASE_URL + "design/R0915",
            "R0916": BASE_URL + "design/R0916",
            "R1260": BASE_URL + "design/R1260",
            "C0198": BASE_URL + "docstyle/C0198",
            "C0199": BASE_URL + "docstyle/C0199",
            "R5501": BASE_URL + "else-if-used/R5501",
            "E0701": BASE_URL + "exceptions/E0701",
            "E0702": BASE_URL + "exceptions/E0702",
            "E0703": BASE_URL + "exceptions/E0703",
            "E0704": BASE_URL + "exceptions/E0704",
            "E0710": BASE_URL + "exceptions/E0710",
            "E0711": BASE_URL + "exceptions/E0711",
            "E0712": BASE_URL + "exceptions/E0712",
            "W0702": BASE_URL + "exceptions/W0702",
            "W0703": BASE_URL + "exceptions/W0703",
            "W0705": BASE_URL + "exceptions/W0705",
            "W0706": BASE_URL + "exceptions/W0706",
            "W0711": BASE_URL + "exceptions/W0711",
            "W0715": BASE_URL + "exceptions/W0715",
            "W0716": BASE_URL + "exceptions/W0716",
            "C0301": BASE_URL + "format/C0301",
            "C0302": BASE_URL + "format/C0302",
            "C0303": BASE_URL + "format/C0303",
            "C0304": BASE_URL + "format/C0304",
            "C0305": BASE_URL + "format/C0305",
            "C0321": BASE_URL + "format/C0321",
            "C0325": BASE_URL + "format/C0325",
            "C0326": BASE_URL + "format/C0326",
            "C0327": BASE_URL + "format/C0327",
            "C0328": BASE_URL + "format/C0328",
            "C0330": BASE_URL + "format/C0330",
            "W0301": BASE_URL + "format/W0301",
            "W0311": BASE_URL + "format/W0311",
            "W0312": BASE_URL + "format/W0312",
            "C0410": BASE_URL + "imports/C0410",
            "C0411": BASE_URL + "imports/C0411",
            "C0412": BASE_URL + "imports/C0412",
            "C0413": BASE_URL + "imports/C0413",
            "C0414": BASE_URL + "imports/C0414",
            "C0415": BASE_URL + "imports/C0415",
            "E0401": BASE_URL + "imports/E0401",
            "E0402": BASE_URL + "imports/E0402",
            "R0401": BASE_URL + "imports/R0401",
            "W0401": BASE_URL + "imports/W0401",
            "W0402": BASE_URL + "imports/W0402",
            "W0404": BASE_URL + "imports/W0404",
            "W0406": BASE_URL + "imports/W0406",
            "W0407": BASE_URL + "imports/W0407",
            "W0410": BASE_URL + "imports/W0410",
            "E1200": BASE_URL + "logging/E1200",
            "E1201": BASE_URL + "logging/E1201",
            "E1205": BASE_URL + "logging/E1205",
            "E1206": BASE_URL + "logging/E1206",
            "W1201": BASE_URL + "logging/W1201",
            "W1202": BASE_URL + "logging/W1202",
            "I0023": BASE_URL + "miscellaneous/I0023",
            "W0511": BASE_URL + "miscellaneous/W0511",
            "R0204": BASE_URL + "multiple-types/R0204",
            "E1003": BASE_URL + "newstyle/E1003",
            "W0714": BASE_URL + "overlap-except/W0714",
            "W9005": BASE_URL + "parameter-documentation/W9005",
            "W9006": BASE_URL + "parameter-documentation/W9006",
            "W9008": BASE_URL + "parameter-documentation/W9008",
            "W9010": BASE_URL + "parameter-documentation/W9010",
            "W9011": BASE_URL + "parameter-documentation/W9011",
            "W9012": BASE_URL + "parameter-documentation/W9012",
            "W9013": BASE_URL + "parameter-documentation/W9013",
            "W9014": BASE_URL + "parameter-documentation/W9014",
            "W9015": BASE_URL + "parameter-documentation/W9015",
            "W9016": BASE_URL + "parameter-documentation/W9016",
            "W9017": BASE_URL + "parameter-documentation/W9017",
            "W9018": BASE_URL + "parameter-documentation/W9018",
            "C0113": BASE_URL + "refactoring/C0113",
            "C0200": BASE_URL + "refactoring/C0200",
            "C0201": BASE_URL + "refactoring/C0201",
            "C1801": BASE_URL + "refactoring/C1801",
            "R1701": BASE_URL + "refactoring/R1701",
            "R1702": BASE_URL + "refactoring/R1702",
            "R1703": BASE_URL + "refactoring/R1703",
            "R1704": BASE_URL + "refactoring/R1704",
            "R1705": BASE_URL + "refactoring/R1705",
            "R1706": BASE_URL + "refactoring/R1706",
            "R1707": BASE_URL + "refactoring/R1707",
            "R1708": BASE_URL + "refactoring/R1708",
            "R1709": BASE_URL + "refactoring/R1709",
            "R1710": BASE_URL + "refactoring/R1710",
            "R1711": BASE_URL + "refactoring/R1711",
            "R1712": BASE_URL + "refactoring/R1712",
            "R1713": BASE_URL + "refactoring/R1713",
            "R1714": BASE_URL + "refactoring/R1714",
            "R1715": BASE_URL + "refactoring/R1715",
            "R1716": BASE_URL + "refactoring/R1716",
            "R1717": BASE_URL + "refactoring/R1717",
            "R1718": BASE_URL + "refactoring/R1718",
            "R1719": BASE_URL + "refactoring/R1719",
            "R1720": BASE_URL + "refactoring/R1720",
            "R1721": BASE_URL + "refactoring/R1721",
            "R1722": BASE_URL + "refactoring/R1722",
            "R1723": BASE_URL + "refactoring/R1723",
            "R1724": BASE_URL + "refactoring/R1724",
            "R0801": BASE_URL + "similarities/R0801",
            "C0401": BASE_URL + "spelling/C0401",
            "C0402": BASE_URL + "spelling/C0402",
            "C0403": BASE_URL + "spelling/C0403",
            "E1507": BASE_URL + "stdlib/E1507",
            "W1501": BASE_URL + "stdlib/W1501",
            "W1502": BASE_URL + "stdlib/W1502",
            "W1503": BASE_URL + "stdlib/W1503",
            "W1505": BASE_URL + "stdlib/W1505",
            "W1506": BASE_URL + "stdlib/W1506",
            "W1507": BASE_URL + "stdlib/W1507",
            "W1508": BASE_URL + "stdlib/W1508",
            "W1509": BASE_URL + "stdlib/W1509",
            "W1510": BASE_URL + "stdlib/W1510",
            "E1300": BASE_URL + "string/E1300",
            "E1301": BASE_URL + "string/E1301",
            "E1302": BASE_URL + "string/E1302",
            "E1303": BASE_URL + "string/E1303",
            "E1304": BASE_URL + "string/E1304",
            "E1305": BASE_URL + "string/E1305",
            "E1306": BASE_URL + "string/E1306",
            "E1307": BASE_URL + "string/E1307",
            "E1310": BASE_URL + "string/E1310",
            "W1300": BASE_URL + "string/W1300",
            "W1301": BASE_URL + "string/W1301",
            "W1302": BASE_URL + "string/W1302",
            "W1303": BASE_URL + "string/W1303",
            "W1304": BASE_URL + "string/W1304",
            "W1305": BASE_URL + "string/W1305",
            "W1306": BASE_URL + "string/W1306",
            "W1307": BASE_URL + "string/W1307",
            "W1308": BASE_URL + "string/W1308",
            "W1401": BASE_URL + "string/W1401",
            "W1402": BASE_URL + "string/W1402",
            "W1403": BASE_URL + "string/W1403",
            "E1101": BASE_URL + "typecheck/E1101",
            "E1102": BASE_URL + "typecheck/E1102",
            "E1111": BASE_URL + "typecheck/E1111",
            "E1120": BASE_URL + "typecheck/E1120",
            "E1121": BASE_URL + "typecheck/E1121",
            "E1123": BASE_URL + "typecheck/E1123",
            "E1124": BASE_URL + "typecheck/E1124",
            "E1125": BASE_URL + "typecheck/E1125",
            "E1126": BASE_URL + "typecheck/E1126",
            "E1127": BASE_URL + "typecheck/E1127",
            "E1128": BASE_URL + "typecheck/E1128",
            "E1129": BASE_URL + "typecheck/E1129",
            "E1130": BASE_URL + "typecheck/E1130",
            "E1131": BASE_URL + "typecheck/E1131",
            "E1132": BASE_URL + "typecheck/E1132",
            "E1133": BASE_URL + "typecheck/E1133",
            "E1134": BASE_URL + "typecheck/E1134",
            "E1135": BASE_URL + "typecheck/E1135",
            "E1136": BASE_URL + "typecheck/E1136",
            "E1137": BASE_URL + "typecheck/E1137",
            "E1138": BASE_URL + "typecheck/E1138",
            "E1139": BASE_URL + "typecheck/E1139",
            "E1140": BASE_URL + "typecheck/E1140",
            "E1141": BASE_URL + "typecheck/E1141",
            "I1101": BASE_URL + "typecheck/I1101",
            "W1113": BASE_URL + "typecheck/W1113",
            "W1114": BASE_URL + "typecheck/W1114",
            "E0601": BASE_URL + "variables/E0601",
            "E0602": BASE_URL + "variables/E0602",
            "E0603": BASE_URL + "variables/E0603",
            "E0604": BASE_URL + "variables/E0604",
            "E0611": BASE_URL + "variables/E0611",
            "E0633": BASE_URL + "variables/E0633",
            "W0601": BASE_URL + "variables/W0601",
            "W0602": BASE_URL + "variables/W0602",
            "W0603": BASE_URL + "variables/W0603",
            "W0604": BASE_URL + "variables/W0604",
            "W0611": BASE_URL + "variables/W0611",
            "W0612": BASE_URL + "variables/W0612",
            "W0613": BASE_URL + "variables/W0613",
            "W0614": BASE_URL + "variables/W0614",
            "W0621": BASE_URL + "variables/W0621",
            "W0622": BASE_URL + "variables/W0622",
            "W0623": BASE_URL + "variables/W0623",
            "W0631": BASE_URL + "variables/W0631",
            "W0632": BASE_URL + "variables/W0632",
            "W0640": BASE_URL + "variables/W0640",
            "W0641": BASE_URL + "variables/W0641",
            "W0642": BASE_URL + "variables/W0642",
            "C0144": BASE_URL + "basic/C0144",
            "E0011": BASE_URL + "basic/E0011",
            "E0012": BASE_URL + "basic/E0012",
            "E0304": BASE_URL + "classes/E0304",
            "E0305": BASE_URL + "classes/E0305",
            "E0306": BASE_URL + "classes/E0306",
            "E0307": BASE_URL + "classes/E0307",
            "E0309": BASE_URL + "classes/E0309",
            "E0311": BASE_URL + "classes/E0311",
            "E1601": BASE_URL + "basic/E1601",
            "R1725": BASE_URL + "classes/R1725",
            "R1726": BASE_URL + "refactoring/R1726",
            "R1727": BASE_URL + "refactoring/R1727",
            "W1115": BASE_URL + "classes/W1115",
            "W1116": BASE_URL + "string/W1116",
            "W1203": BASE_URL + "string/W1203",
            "W1404": BASE_URL + "string/W1404",
            "E0001":"https://realpython.com/invalid-syntax-python/"}    
        json_i = json.loads(output)
        for error in json_i:
            if error['message-id'] in link:
                error["reflink"] = link[error['message-id']]
            else:
                error["reflink"] = ""
        return json.dumps(json_i)
