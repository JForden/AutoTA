import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab } from 'semantic-ui-react'
import '../css/TestResultComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';

interface TestResultComponentProps {
    testcase: JsonResponse
}

interface TestState {
    showComponent: boolean;
    suite:string;
    test:string;
    result:string;
    description:string;
    diff:string;
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

class TestResultsComponent extends Component<TestResultComponentProps, TestState> {
    constructor(props: TestResultComponentProps){
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
        const panes = this.props.testcase.result.map(d => ({
            menuItem: d.Suite,
            render: () =>
            <Tab.Pane attached={false}>
                <div id="testresults-container">
                    {d.Tests.map(test => {
                        if(test.Status === "PASSED"){  
                            return (
                            <span className="testcase" onClick={() => this.handleClick(d.Suite, test.Testcase, test.Status, test.Description,test.Diff)}>
                                <StyledIcon name='check' className="passed" />
                            </span>)
                        } else {
                            return (
                            <span className="testcase" onClick={() => this.handleClick(d.Suite, test.Testcase, test.Status, test.Description,test.Diff)}>
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
                        return (<h1 id="blank-testcase-message">Please click on <StyledIcon name='check' className="passed" /> or <StyledIcon name='close' className="failed" /> to see more details</h1>);
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
