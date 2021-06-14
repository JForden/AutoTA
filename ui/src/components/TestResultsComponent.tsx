import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab } from 'semantic-ui-react'
import '../css/TestResultComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';

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
        var json = {
            "result": [
            {
            "Suite": "01-simple",
            "Points" : "5 points",
            "Tests": [
            {
            "Testcase": "00-empty.test",
            "Status": "PASSED",
            "description": "This test looks to see what the program does when the string is empty.",
            "Diff": ""
            },
            {
            "Testcase": "01-single.test",
            "Status": "PASSED",
            "description": "This test examines what happends when a single character is entered.",
            "Diff": ""
            }
            ]},
            {
            "Suite": "02-simple",
            "Points" : "10 points",
            "Tests": [
            {
            "Testcase": "00-test1.test",
            "Status": "PASSED",
            "description": "This test uses random numbers to test.",
            "Diff": ""
            },
            {
            "Testcase": "01-test2.test",
            "Status": "FAILED",
            "description": "This test uses MORE random numbers to test.",
            "Diff": "1c1\n< 4 8 15 16 24 36 49 69 102 1031\n---\n> 4 8 15 16 24 36 49 69 102 103"
            }
            ]}
            ]};     

    const panes = json.result.map(d => ({
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
                <div>
                {(() => {
                    if(!this.state.showComponent) {
                        return (<></>);
                    } else {
                        return (
                            <div>
                                <b>[{this.state.suite}] {this.state.test}</b><br/>
                                Result: <span className={this.state.result === "PASSED" ? "passed" : "failed"}>{this.state.result}</span><br/>
                                {this.state.description}<br/>
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
