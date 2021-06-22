import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab } from 'semantic-ui-react'
import '../css/TestResultComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';
import axios from 'axios';

interface TestState {
    showComponent: boolean;
    suite:string;
    test:string;
    result:string;
    description:string;
    diff:string;
}

class TestResultsComponent extends Component<{}, TestState> {
    constructor(props: {}){
        super(props);
        this.state = {
            showComponent: false,
            suite: "",
            test: "",
            result: "",
            description: "",
            diff: ""
        };
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick(suite: string, test: string, result: string, description: string,diff:string) {        
        this.setState({
            showComponent: true,
            suite:suite,
            test:test,
            result:result,
            description:description,
            diff:diff,
        });
    } 

    render() {
    
        var obj = "";
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/testcaseerrors/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            //obj = JSON.parse(res.data);
            let obj = JSON.stringify(res.data);
        })
        .catch(err => {
            //alert("File upload unsuccessful")
        });

        const panes = obj.result.map(d => ({
            menuItem: d.Suite,
            render: () =>
            <Tab.Pane attached={false}>
                <div id="testresults-container">
                    {d.Tests.map(test => {
                        if(test.Status==="PASSED"){  
                            return (
                            <span className="testcase" onClick={() => this.handleClick(d.Suite, test.Testcase, test.Status, test.description,test.Diff)}>
                                <StyledIcon name='check' className="passed" />
                            </span>)
                        } else {
                            return (
                            <span className="testcase" onClick={() => this.handleClick(d.Suite, test.Testcase, test.Status, test.description,test.Diff)}>
                                <StyledIcon name='close' className="failed" />
                            </span>)
                        }
                    })}
                </div>
            </Tab.Pane>
        }));

    return (
        <div className="bottom">
            <Split className="split">
                <div id="code-container"><Tab menu={{ secondary: true, pointing: true }} panes={panes} /></div>
                <div id="test-info">
                {(() => {
                    if(!this.state.showComponent) {
                        return (<></>);
                    } else {
                        return (
                            <div>
                                <div><b>[{this.state.suite}] {this.state.test}</b></div>
                                <strong>Result: </strong> <span className={this.state.result === "PASSED" ? "passed" : "failed"}>{this.state.result}</span><br/>
                                <strong>Test Description: </strong>{this.state.description}<br/>
                                <pre style={{backgroundColor: 'lightgrey'}}>{this.state.diff}</pre>
                            </div>
                        );
                    }
                })()}               
                </div>
            </Split>
        </div>
    );
  }
}

export default TestResultsComponent;
