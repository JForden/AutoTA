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
    skipped:boolean;
    result:boolean;
    description:string;
    output:string;
}

interface JsonTestResponseBody {
    output: Array<string>,
    type: number,
    description: string,
    name: string,
    suite: string
}
interface JsonResponseBody {
    skipped: boolean,
    passed: boolean,
    test: JsonTestResponseBody
}

interface JsonResponse {
    results: Array<JsonResponseBody>
}

class TestResultsComponent extends Component<TestResultComponentProps, TestState> {
    constructor(props: TestResultComponentProps){
        super(props);
        this.state = {
            showComponent: false,
            suite: "",
            test: "",
            skipped: false,
            result: false,
            description: "",
            output: ""
        };
        this.handleClick = this.handleClick.bind(this);
    }

    getResult(){
        if(this.state.skipped){ 
            return "SKIPPED";
        }
        return this.state.result ? "PASSED" : "FAILED"
    }

    handleClick(suite: string, test: string, skipped: boolean, result: boolean, description: string, output: Array<string>) {   
        this.setState({
            suite:suite,
            test:test,
            skipped: skipped,
            result:result,
            description:description,
            output: output.join("\n"),
            showComponent: true,
        });
    }

    render() {
        var suites = [...new Set<string>(this.props.testcase.results.map(item => item.test.suite))];
        const panes = suites.map(s => ({
            menuItem: s,
            render: () => {
            return (<Tab.Pane attached={false}>
                <div id="testresults-container">
                {this.props.testcase.results.map(x => {
                     if(x.test.suite === s){
                        if(x.passed){  
                            return (
                            <span className="testcase" onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}>
                                <StyledIcon name='check' className="PASSED" />
                            </span>);
                        } else {
                            if(x.skipped){
                                var holder=["(╯°□°）╯︵ ┻━┻ ", "This test was skipped due to a configuration error!!!", "Please contact a human TA or professor"];
                                x.test.output=holder;
                                return (
                                    <span className="testcase" onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}>
                                        <StyledIcon name='step forward' className="SKIPPED" />
                                    </span>);
                            }
                            return (
                            <span className="testcase" onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}>
                                <StyledIcon name='close' className="FAILED" />
                            </span>);
                        }
                     }
                })}
                </div>
            </Tab.Pane>
            )}
        }));
    return (
        <div className="bottom">
            <Split className="split">
                <div id="code-container"><Tab menu={{ secondary: true, pointing: true }} panes={panes} /></div>
                <div id="test-info">
                {(() => {
                    if(!this.state.showComponent) {
                        return (<h1 id="blank-testcase-message">Please click on <StyledIcon name='check' className="PASSED" /> or <StyledIcon name='close' className="FAILED" /> to see more details</h1>);
                    } else {
                        return (
                            <div>
                                <div><b>[{this.state.suite}] {this.state.test}</b></div>
                                <strong>Result: </strong> <span className={this.getResult()}>{this.getResult()}</span><br/>
                                <strong>Test Description: </strong>{this.state.description}<br/>
                                <pre style={{backgroundColor: 'lightgrey'}}>{this.state.output}</pre>
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
