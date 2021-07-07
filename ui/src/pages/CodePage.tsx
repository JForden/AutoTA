import { Component, useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Grid } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';
import MenuComponent from '../components/MenuComponent';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const defaultpagenumber=-1;

interface CodePageProps {
    id?: string
}

interface JsonTestResponseBody {
    Status: string,
    Testcase: string,
    Description: string,
    Diff: string
}

interface JsonResponseBody {
    Suite: string,
    Points: string,
    Tests: Array<JsonTestResponseBody>
}

interface JsonResponse {
    result: Array<JsonResponseBody>
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

const CodePage = () => {
    let { id } = useParams<CodePageProps>();
    var submissionId = id ? parseInt(id) : defaultpagenumber; 
    
    const [json, setJson] = useState<JsonResponse>({ result: [] });
    const [pylint, setPylint] = useState<Array<PylintObject>>([]);
    const [code, setCode] = useState<string>("");


    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/testcaseerrors?id=${submissionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            setJson(res.data as JsonResponse)
        })
        .catch(err => {
            console.log(err);
        });
 
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/pylintoutput?id=${submissionId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            var x = res.data as Array<PylintObject>;
            x = x.sort((a, b) => (a.line < b.line ? -1 : 1));
            setPylint(x);    
        })
        .catch(err => {
            console.log(err);
        });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/codefinder?id=${submissionId}`, {
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
    }, []);

    return (
        <div id="code-page">
            <MenuComponent showUpload={true} showHelp={true} showCreate={false}></MenuComponent>
            <Grid>
                <Grid.Column>
                    <Grid.Row width={16} className="top-row full-height">
                        <CodeComponent pylintData={pylint} codedata={code}></CodeComponent>
                    </Grid.Row>

                    <Grid.Row width={16}>
                        <TestResultsComponent testcase={json}></TestResultsComponent>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        </div>
    );
}

export default CodePage;
