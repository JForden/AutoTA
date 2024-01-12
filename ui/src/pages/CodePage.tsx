import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';
import MenuComponent from '../components/MenuComponent';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Split from 'react-split';
import { Helmet } from "react-helmet";

const defaultpagenumber = -1;

interface CodePageProps {
    id?: string
    class_id?: string
}

interface JsonTestResponseBody {
    output: Array<string>,
    type: number,
    description: string,
    name: string,
    suite: string,
    hidden: string
}
interface JsonResponseBody {
    skipped: boolean,
    passed: boolean,
    test: JsonTestResponseBody
}

interface JsonResponse {
    results: Array<JsonResponseBody>
}

interface PylintObject {
    type: string,
    module: string,
    obj: string,
    line: number,
    column: number,
    path: string,
    symbol: string,
    message: string,
    messageid: string,
    reflink: string
}
interface gptobject {
    type: string,
    message: string
}

const CodePage = () => {
    let { id, class_id } = useParams<CodePageProps>();
    var submissionId = id ? parseInt(id) : defaultpagenumber;
    var cid = class_id ? parseInt(class_id) : -1;

    const [json, setJson] = useState<JsonResponse>({ results: [{ skipped: false, passed: false, test: { description: "", output: [""], type: 0, name: "", suite: "", hidden: "" } }] });
    const [pylint, setPylint] = useState<Array<PylintObject>>([]);
    const [gptresponsedata, setgptresponsedata] = useState<Array<gptobject>>([]);
    const [code, setCode] = useState<string>("");
    const [score, setScore] = useState<number>(0);
    const [hasScoreEnabled, setHasScoreEnabled] = useState<boolean>(false);
    const [hasUnlockEnabled, setHasUnlockEnabled] = useState<boolean>(false);
    const [hasTbsEnabled, setHasTbsEnabled] = useState<boolean>(false);
    const [ResearchGroup, setResearchGroup] = useState<number>(0);
    const [lint, setLint] = useState<String>("");

    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/testcaseerrors?id=${submissionId}&class_id=${cid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                setJson(res.data as JsonResponse);
                console.log(json);
            })
            .catch(err => {
                console.log(err);
            });
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/lint_output?id=${submissionId}&class_id=${cid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var x = res.data as Array<PylintObject>;
                if (Array.isArray(x)) {
                    x = x.sort((a, b) => (a.line < b.line ? -1 : 1));
                } else {
                    console.error("x is not an array. Skipping the sorting step.");
                }
                //x = x.sort((a, b) => (a.line < b.line ? -1 : 1));
                setPylint(x);
            })
            .catch(err => {
                console.log(err);
            });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/codefinder?id=${submissionId}&class_id=${cid}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                setCode(res.data as string)
            })
            .catch(err => {
                console.log(err);
            });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/ResearchGroup`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            },

        }).then(res => {
            setResearchGroup(res.data);
        }).catch(err => {
            console.log(err);
        });

    }, []);

    return (
        <div id="code-page">
            <Helmet>
                <title>Submission | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showAdminUpload={false} showHelp={true} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
            <Split sizes={[80, 20]} className="split2" direction="vertical">
                <CodeComponent pylintData={pylint} codedata={code}></CodeComponent>
                <TestResultsComponent codedata={code} testcase={json} showScore={hasScoreEnabled} score={score} researchGroup={ResearchGroup} submissionId={submissionId}></TestResultsComponent>
            </Split>
        </div>
    );
}

export default CodePage;
