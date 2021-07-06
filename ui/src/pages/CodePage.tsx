import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Grid } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';
import MenuComponent from '../components/MenuComponent';
import axios from 'axios';

interface TestState {
    json: JsonResponse;
    pylint: Array<PylintObject>
    code: string;
    submissionNumber: number;
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

class CodePage extends Component<{}, TestState> {

    constructor(props: {}){
        super(props);
        this.state = {
            json: {
              result: []
            },
            pylint:[],
            code:"",
            submissionNumber:-1
        };
    }
    

    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/testcaseerrors`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            this.setState({json: res.data as JsonResponse})
        })
        .catch(err => {
            console.log(err);
        });
 
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/pylintoutput`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            var x = res.data as Array<PylintObject>;
            x = x.sort((a, b) => (a.line < b.line ? -1 : 1));
            this.setState({pylint:  x})    
        })
        .catch(err => {
            console.log(err);
        });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/codefinder`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            this.setState({code: res.data })    
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <div id="code-page">
                <MenuComponent showUpload={true} showHelp={true} showCreate={false}></MenuComponent>
                <Grid>
                    <Grid.Column>
                        <Grid.Row width={16} className="top-row full-height">
                            <CodeComponent pylintData={this.state.pylint} codedata={this.state.code}></CodeComponent>
                        </Grid.Row>

                        <Grid.Row width={16}>
                            <TestResultsComponent testcase={this.state.json}></TestResultsComponent>
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default CodePage;
