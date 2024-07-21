import React, { Component, PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Container, Dimmer, Header, Icon, Loader, Message, Tab } from 'semantic-ui-react'
import '../css/TestResultComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import axios from 'axios';
import internal from 'stream';

interface TestResultComponentProps {
  codedata: string,
  testcase: JsonResponse,
  score: number,
  showScore: boolean,
  researchGroup: number,
  submissionId: number,
}

interface TestState {
  showComponent: boolean;
  suite: string;
  test: string;
  skipped: boolean;
  result: boolean;
  description: string;
  output: string;
  hidden: string;
  isLoading: boolean;
  helpRequested: boolean;
  helpResponse: string;
  questionId: string;
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

class TestResultsComponent extends Component<TestResultComponentProps, TestState> {
  constructor(props: TestResultComponentProps) {
    super(props);
    this.state = {
      showComponent: false,
      suite: "",
      test: "",
      skipped: false,
      hidden: "",
      result: false,
      description: "",
      output: "",
      isLoading: false,
      helpRequested: false,
      helpResponse: "",
      questionId: "",

    };
    this.handleClick = this.handleClick.bind(this);
    this.handlehelpbuttonclick = this.handlehelpbuttonclick.bind(this);
    this.handleexplinationbuttonclick = this.handleexplinationbuttonclick.bind(this);
    this.handleNegativeClick = this.handleNegativeClick.bind(this);
    this.handlePositiveClick = this.handlePositiveClick.bind(this);
  }

  getResult() {
    if (this.state.skipped) {
      return "SKIPPED";
    }
    return this.state.result ? "PASSED" : "FAILED"
  }

  handleClick(suite: string, test: string, skipped: boolean, result: boolean, description: string, output: Array<string>) {
    this.setState({
      suite: suite,
      test: test,
      skipped: skipped,
      result: result,
      description: description,
      output: output.join("\n"),
      showComponent: true,
      helpRequested: false,
    });
  }
  private handlehelpbuttonclick() {
    this.setState({ isLoading: true })
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/gptData`, {
      params: {
        code: this.props.codedata,
        description: this.state.description,
        output: this.state.output,
        submissionId: this.props.submissionId,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        var response = res.data.toString();
        this.setState({ helpResponse: response });
        this.setState({ questionId: res.data[1].toString() });
        this.setState({ helpRequested: true });
        this.setState({ isLoading: false });

      })
      .catch((err) => {
        console.log(err);
      });
  }
  private handleexplinationbuttonclick() {
    this.setState({ isLoading: true })
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/gptexplainer`, {
      params: {
        description: this.state.description,
        output: this.state.output,
        submissionId: this.props.submissionId,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        var response = res.data[0].toString();
        console.log(res.data[1].toString());
        this.setState({ helpResponse: response });
        this.setState({ questionId: res.data[1].toString() });
        this.setState({ helpRequested: true });
        this.setState({ isLoading: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  private handleNegativeClick() {
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/updateGPTStudentFeedback`, {
      params: {
        questionId: this.state.questionId,
        student_feedback: 0,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        this.setState({ helpRequested: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  private handlePositiveClick() {
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/updateGPTStudentFeedback`, {
      params: {
        questionId: this.state.questionId,
        student_feedback: 1,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        this.setState({ helpRequested: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  render() {
    var suites = [...new Set<string>(this.props.testcase.results.map(item => item.test.suite))];
    var numberOfEntries = suites.length;
    const panes = suites.map(s => ({
      menuItem: s,
      render: () => {
        return (<Tab.Pane attached={false}>
          <div id="testresults-container">
            {this.props.testcase.results.map(x => {
              if (x.test.suite === s) {
                if (x.test.hidden === "True") {
                  return (
                    <span className="testcase">
                      <StyledIcon name='lock' className="LOCKED" />
                    </span>
                  );
                }
                if (x.passed) {
                  return (
                    <Button
                      color='green'
                      icon
                      className="testcase"
                      onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}
                    >
                      <Icon name='check' />
                    </Button>);
                } else {
                  if (x.skipped) {
                    var holder = ["(╯°□°）╯︵ ┻━┻ ", "This test was skipped due to a configuration error!!!", "Please contact a human TA or professor"];
                    x.test.output = holder;
                    return (
                      <span className="testcase" onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}>
                        <StyledIcon name='step forward' className="SKIPPED" />
                      </span>);
                  }
                  return (
                    <Button
                      color='red'
                      icon
                      className="testcase"
                      onClick={() => this.handleClick(x.test.suite, x.test.name, x.skipped, x.passed, x.test.description, x.test.output)}
                    >
                      <Icon name='close' />
                    </Button>);
                }
              }

              return (<></>)
            })}
          </div>
        </Tab.Pane>
        )
      }
    }));
    return (
      <div className="bottom">
        <Split className="split">
          <div><Tab menu={{ secondary: true, pointing: true }} panes={panes} /></div>
          <div id="test-info">
            {(() => {
              if (!this.state.showComponent) {
                if (this.props.showScore == true) {
                  return (<div><h1 id="blank-testcase-message"> Please click on <StyledIcon name='check' className="PASSED" /> or <StyledIcon name='close' className="FAILED" /> to see the test case results </h1><h2 className="center">The score of this submission is: <StyledIcon name='gem' className="GEM" color="blue" />  {this.props.score}</h2>
                    <p className="center"><i>Note: The score of your submission is not the same as the final grade for the assignment. The score is based 60% on test cases and 40% on Pylint results</i></p>
                  </div>);
                } else {
                  return (
                    <Container textAlign='center'>
                      <Message compact>
                        <Header as='h1' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          Please click on <Icon name='check' color='green' /> or <Icon name='close' color='red' /> to see the test case results
                        </Header>
                      </Message>
                    </Container>
                  );
                }
              }
              if (this.state.helpRequested) {
                return (
                  <div>
                    <p>Please note that this is an experimental feature. If the output is helpful, your feedback will train the system.</p>
                    <pre style={{ backgroundColor: 'lightgrey' }}>{this.state.output}</pre>
                    <div className="help-response">
                      <Header as="h1" id="blank-testcase-message">
                        {this.state.helpResponse}
                      </Header>
                    </div>
                    <Button onClick={this.handlePositiveClick} color="green" className="feedback-button helpful-button">
                      <Icon name="check" />
                      Feedback was helpful
                    </Button>


                    <Button onClick={this.handleNegativeClick} color="red" className="feedback-button unhelpful-button">
                      <Icon name="remove" />
                      Feedback was unhelpful
                    </Button>
                  </div>
                );
              }
              else {
                if (this.state.isLoading) {
                  // Display the loading circle when isLoading is true
                  return (
                    <div>
                      <Dimmer active>
                        <Loader content="Loading..." />
                      </Dimmer>
                    </div>
                  );
                }
                else {
                  if (this.props.researchGroup === 0) { // Standard diff
                    return (
                      <div>
                        <div>
                          <b>[{this.state.suite}] {this.state.test}</b>
                        </div>
                        <strong>Result: </strong>
                        <span className={this.getResult()}>{this.getResult()}</span>
                        <strong>For additional help, please select a button: </strong>

                        {/* Conditional buttons */}
                        <Button color='green' onClick={this.handleexplinationbuttonclick}>
                          <Icon name='lightbulb' />
                          Output Explanation
                        </Button>
                        <br />
                        <strong>Test Description: </strong>{this.state.description}<br />
                        <pre style={{ backgroundColor: 'lightgrey' }}>{this.state.output}</pre>
                      </div>
                    );
                  }
                }
                if (this.props.researchGroup == 1) { //Color DIff
                  return (
                    <div>
                      <div><b>[{this.state.suite}] {this.state.test}</b></div>
                      <strong></strong> <span className='FAILED'>User Generated Output -</span>
                      <div><strong></strong> <span className='PASSED'>Correct Output +</span></div>
                      <strong>Result: </strong> <span className={this.getResult()}>{this.getResult()}</span><br />
                      <strong>Test Description: </strong>{this.state.description}<br />
                      <ReactDiffViewer compareMethod={DiffMethod.WORDS} disableWordDiff={false} showDiffOnly={false} oldValue={this.state.output.split("~~~diff~~~")[0]} newValue={this.state.output.split("~~~diff~~~")[1]} splitView={false} />
                    </div>
                  );
                }
                if (this.props.researchGroup == 2) { //Input-output
                  return (
                    <div>
                      <div><b>[{this.state.suite}] {this.state.test}</b></div>
                      <strong>Result: </strong> <span className={this.getResult()}>{this.getResult()}</span><br />
                      <strong>Test Description: </strong>{this.state.description}<br />
                      <strong>Expected output:</strong><pre>{this.state.output.split("~~~diff~~~")[1]}</pre>
                      <strong>Your output:</strong><pre>{this.state.output.split("~~~diff~~~")[0]}</pre>
                    </div>
                  );
                }

              }
            })()}
          </div>
        </Split>
      </div>
    );
  }
}

export default TestResultsComponent;
