import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';
import CodeHelpComponent from '../components/CodeHelpComponent';
import MenuComponent from '../components/MenuComponent';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Split from 'react-split';
import {Helmet} from "react-helmet";

const defaultpagenumber=-1;

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


const CodeHelpPage = () => {
    let { id, class_id } = useParams<CodePageProps>();
    var submissionId = id ? parseInt(id) : defaultpagenumber;
    var cid = class_id ? parseInt(class_id) : -1;
    
    const [json, setJson] = useState<JsonResponse>({ results: [ { skipped: false, passed: false, test: { description: "", output: [""], type: 0, name: "", suite: "", hidden: "" }} ] });
    const [code, setCode] = useState<string>("");
 

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
 
        
    }, []);
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

    return (
        <div id="codehelp-page">
            <Helmet>
                <title>Submission | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
            <Split sizes={[80, 20]} className="split2" direction="vertical">
                    <CodeHelpComponent codedata={code}></CodeHelpComponent>
            </Split>
        </div>
    );
}

export default CodeHelpPage;
