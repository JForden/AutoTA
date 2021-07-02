from flask import Blueprint
from flask import make_response
from http import HTTPStatus
from injector import inject
from flask_jwt_extended import jwt_required
from flask_jwt_extended import current_user
from repositories.submission_repository import ASubmissionRepository
from repositories.project_repository import AProjectRepository
from flask_cors import CORS, cross_origin
import json

submission_api = Blueprint('submission_api', __name__)


@submission_api.route('/testcaseerrors', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def testcaseerrors(submission_repository: ASubmissionRepository):
    output_path = submission_repository.getJsonPathByUserId(current_user.Id)

    with open(output_path, 'r') as file:
        output = file.read()
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/pylintoutput', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def pylintoutput(submission_repository: ASubmissionRepository):
    pylint_output = submission_repository.getPylintPathByUserId(current_user.Id)

    with open(pylint_output, 'r') as file:
        output = file.read()
        output=linkfinder(output)
    return make_response(output, HTTPStatus.OK)



def linkfinder(pyoutput):
    link = {
        "C0102":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0102",
        "C0103":"https://youtu.be/dQw4w9WgXcQ",
        "C0112":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0112",
        "C0114":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0114",
        "C0115":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0115",
        "C0116":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0116",
        "C0121":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0121",
        "C0122":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0122",
        "C0123":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/C0123",
        "E0100":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0100",
        "E0101":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0101",
        "E0102":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0102",
        "E0103":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0103",
        "E0104":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0104",
        "E0105":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0105",
        "E0106":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0106",
        "E0107":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0107",
        "E0108":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0108",
        "E0110":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0110",
        "E0111":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0111",
        "E0112":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0112",
        "E0113":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0113",
        "E0114":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0114",
        "E0115":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0115",
        "E0116":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0116",
        "E0117":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0117",
        "E0118":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0118",
        "E0119":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/E0119",
        "R0123":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/R0123",
        "R0124":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/R0124",
        "W0101":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0101",
        "W0102":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0102",
        "W0104":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0104",
        "W0105":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0105",
        "W0106":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0106",
        "W0107":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0107",
        "W0108":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0108",
        "W0109":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0109",
        "W0111":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0111",
        "W0120":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0120",
        "W0122":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0122",
        "W0123":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0123",
        "W0124":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0124",
        "W0125":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0125",
        "W0126":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0126",
        "W0127":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0127",
        "W0128":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0128",
        "W0143":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0143",
        "W0150":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0150",
        "W0199":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/basic/W0199",
        "W0717":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/broad-try-clause/W0717",
        "C0202":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/C0202",
        "C0203":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/C0203",
        "C0204":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/C0204",
        "C0205":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/C0205",
        "E0202":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0202",
        "E0203":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0203",
        "E0211":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0211",
        "E0213":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0213",
        "E0236":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0236",
        "E0237":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0237",
        "E0238":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0238",
        "E0239":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0239",
        "E0240":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0240",
        "E0241":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0241",
        "E0242":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0242",
        "E0301":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0301",
        "E0302":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0302",
        "E0303":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/E0303",
        "F0202":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/F0202",
        "R0201":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/R0201",
        "R0202":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/R0202",
        "R0203":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/R0203",
        "R0205":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/R0205",
        "R0206":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/R0206",
        "W0201":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0201",
        "W0211":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0211",
        "W0212":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0212",
        "W0221":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0221",
        "W0222":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0222",
        "W0223":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0223",
        "W0231":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0231",
        "W0232":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0232",
        "W0233":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0233",
        "W0235":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0235",
        "W0236":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/classes/W0236",
        "C1901":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/compare-to-empty-string/C1901",
        "C2001":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/compare-to-zero/C2001",
        "W0141":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/deprecated-builtins/W0141",
        "R0901":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0901",
        "R0902":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0902",
        "R0903":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0903",
        "R0904":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0904",
        "R0911":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0911",
        "R0912":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0912",
        "R0913":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0913",
        "R0914":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0914",
        "R0915":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0915",
        "R0916":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R0916",
        "R1260":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/design/R1260",
        "C0198":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/docstyle/C0198",
        "C0199":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/docstyle/C0199",
        "R5501":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/else-if-used/R5501",
        "E0701":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0701",
        "E0702":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0702",
        "E0703":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0703",
        "E0704":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0704",
        "E0710":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0710",
        "E0711":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0711",
        "E0712":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/E0712",
        "W0702":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0702",
        "W0703":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0703",
        "W0705":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0705",
        "W0706":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0706",
        "W0711":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0711",
        "W0715":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0715",
        "W0716":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/exceptions/W0716",
        "C0301":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0301",
        "C0302":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0302",
        "C0303":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0303",
        "C0304":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0304",
        "C0305":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0305",
        "C0321":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0321",
        "C0325":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0325",
        "C0326":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0326",
        "C0327":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0327",
        "C0328":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0328",
        "C0330":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/C0330",
        "W0301":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/W0301",
        "W0311":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/W0311",
        "W0312":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/format/W0312",
        "C0410":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0410",
        "C0411":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0411",
        "C0412":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0412",
        "C0413":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0413",
        "C0414":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0414",
        "C0415":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/C0415",
        "E0401":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/E0401",
        "E0402":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/E0402",
        "R0401":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/R0401",
        "W0401":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0401",
        "W0402":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0402",
        "W0404":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0404",
        "W0406":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0406",
        "W0407":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0407",
        "W0410":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/imports/W0410",
        "E1200":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/E1200",
        "E1201":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/E1201",
        "E1205":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/E1205",
        "E1206":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/E1206",
        "W1201":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/W1201",
        "W1202":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/logging/W1202",
        "I0023":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/miscellaneous/I0023",
        "W0511":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/miscellaneous/W0511",
        "R0204":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/multiple-types/R0204",
        "E1003":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/newstyle/E1003",
        "W0714":" https://vald-phoenix.github.io/pylint-errors/plerr/errors/overlap-except/W0714",
        "W9005":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9005",
        "W9006":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9006",
        "W9008":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9008",
        "W9010":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9010",
        "W9011":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9011",
        "W9012":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9012",
        "W9013":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9013",
        "W9014":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9014",
        "W9015":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9015",
        "W9016":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9016",
        "W9017":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9017",
        "W9018":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/parameter-documentation/W9018",
        "C0113":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/C0113",
        "C0200":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/C0200",
        "C0201":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/C0201",
        "C1801":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/C1801",
        "R1701":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1701",
        "R1702":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1702",
        "R1703":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1703",
        "R1704":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1704",
        "R1705":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1705",
        "R1706":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1706",
        "R1707":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1707",
        "R1708":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1708",
        "R1709":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1709",
        "R1710":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1710",
        "R1711":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1711",
        "R1712":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1712",
        "R1713":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1713",
        "R1714":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1714",
        "R1715":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1715",
        "R1716":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1716",
        "R1717":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1717",
        "R1718":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1718",
        "R1719":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1719",
        "R1720":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1720",
        "R1721":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1721",
        "R1722":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1722",
        "R1723":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1723",
        "R1724":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/refactoring/R1724",
        "R0801":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/similarities/R0801",
        "C0401":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/spelling/C0401",
        "C0402":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/spelling/C0402",
        "C0403":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/spelling/C0403",
        "E1507":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/E1507",
        "W1501":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1501",
        "W1502":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1502",
        "W1503":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1503",
        "W1505":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1505",
        "W1506":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1506",
        "W1507":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1507",
        "W1508":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1508",
        "W1509":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1509",
        "W1510":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/stdlib/W1510",
        "E1300":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1300",
        "E1301":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1301",
        "E1302":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1302",
        "E1303":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1303",
        "E1304":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1304",
        "E1305":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1305",
        "E1306":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1306",
        "E1307":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1307",
        "E1310":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/E1310",
        "W1300":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1300",
        "W1301":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1301",
        "W1302":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1302",
        "W1303":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1303",
        "W1304":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1304",
        "W1305":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1305",
        "W1306":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1306",
        "W1307":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1307",
        "W1308":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1308",
        "W1401":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1401",
        "W1402":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1402",
        "W1403":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/string/W1403",
        "E1101":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1101",
        "E1102":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1102",
        "E1111":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1111",
        "E1120":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1120",
        "E1121":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1121",
        "E1123":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1123",
        "E1124":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1124",
        "E1125":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1125",
        "E1126":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1126",
        "E1127":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1127",
        "E1128":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1128",
        "E1129":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1129",
        "E1130":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1130",
        "E1131":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1131",
        "E1132":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1132",
        "E1133":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1133",
        "E1134":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1134",
        "E1135":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1135",
        "E1136":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1136",
        "E1137":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1137",
        "E1138":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1138",
        "E1139":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1139",
        "E1140":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1140",
        "E1141":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/E1141",
        "I1101":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/I1101",
        "W1113":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/W1113",
        "W1114":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/typecheck/W1114",
        "E0601":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0601",
        "E0602":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0602",
        "E0603":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0603",
        "E0604":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0604",
        "E0611":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0611",
        "E0633":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/E0633",
        "W0601":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0601",
        "W0602":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0602",
        "W0603":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0603",
        "W0604":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0604",
        "W0611":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0611",
        "W0612":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0612",
        "W0613":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0613",
        "W0614":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0614",
        "W0621":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0621",
        "W0622":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0622",
        "W0623":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0623",
        "W0631":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0631",
        "W0632":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0632",
        "W0640":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0640",
        "W0641":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0641",
        "W0642":"https://vald-phoenix.github.io/pylint-errors/plerr/errors/variables/W0642",
        "E0001":"https://realpython.com/invalid-syntax-python/",
    }
    
    json_i = json.loads(pyoutput)
    print(json_i)
    #value=json_i["message-id"]
    #print("VALUE:  "+ value)
    for error in json_i:
        #print(error)
        error["reflink"] = link[error['message-id']]
        print(error)
    return json.dumps(json_i)




@submission_api.route('/codefinder', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def codefinder(submission_repository: ASubmissionRepository):
    code_output = submission_repository.getCodePathByUserId(current_user.Id)

    with open(code_output, 'r') as file:
        output = file.read()
    return make_response(output, HTTPStatus.OK)


@submission_api.route('/submissioncounter', methods=['GET'])
@jwt_required()
@cross_origin()
@inject
def submissionNumberFinder(submission_repository: ASubmissionRepository,project_repository: AProjectRepository):
    number = submission_repository.getSubmissionsRemaining(current_user.Id, project_repository.get_current_project().Id)
    return make_response(str(number), HTTPStatus.OK)
