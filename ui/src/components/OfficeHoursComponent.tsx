import React, { Component, SyntheticEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab, Icon, Table, Form, TextArea, Dropdown, DropdownProps, Button, Feed, Header, ButtonOr, Modal, Input, Radio, Segment, Checkbox, Label, Grid, StepGroup, StepContent, StepDescription, Step, StepTitle } from 'semantic-ui-react'
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import codeimg from '../codeex.png'
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-tomorrow';


interface OfficeHoursProps {
  question: string;
  project_id: string;
}

interface OfficeHoursState {
  question: string;
  questionAsked: boolean;
  Student_questions: Array<OHQuestion>;
  classes: Array<DropDownOption>;
  projects: Array<DropDownOption>;
  selectedClass: number | null;
  selectedProject: number;
  usersQuestionID: number;
  modalOpen: boolean;
  QueuemodalOpen: boolean;
  codesnippet: string;
  modalCodeSnippetOpen: boolean;
  testcaseInput: string;
  testcaseOutput: string;
  language: string;
  studentMessage: string;
  runningStep: number;
}

interface OHQuestion {
  questionID: number;
  question: string;
  question_time: string;
}

interface DropDownOption {
  key: number,
  value: number,
  text: string
}


class OfficeHoursComponent extends Component<OfficeHoursProps, OfficeHoursState> {
  constructor(props: OfficeHoursProps) {
    super(props);
    this.state = {
      question: "",
      questionAsked: false,
      Student_questions: [],
      classes: [],
      projects: [],
      selectedClass: 0,
      selectedProject: 0,
      usersQuestionID: 0,
      modalOpen: false,
      QueuemodalOpen: false,
      codesnippet: "",
      modalCodeSnippetOpen: false,
      testcaseInput: "None",
      testcaseOutput: "Click Run to see the output!",
      language: "python",
      studentMessage: "",
      runningStep: 0,
    };

    this.handleQuestionSubmit = this.handleQuestionSubmit.bind(this);
    this.fetchOHQuestions = this.fetchOHQuestions.bind(this);
    this.startFetchingInterval = this.startFetchingInterval.bind(this);
    this.fetchClasses = this.fetchClasses.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.handleClassIdChange = this.handleClassIdChange.bind(this);
    this.handleProjectIdChange = this.handleProjectIdChange.bind(this);
    this.calculateTimeDifference = this.calculateTimeDifference.bind(this);
    this.activequestion = this.activequestion.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenQueueModal = this.handleOpenQueueModal.bind(this);
    this.handleCloseQueueModal = this.handleCloseQueueModal.bind(this);
    this.handleOpenCodeSnippetModal = this.handleOpenCodeSnippetModal.bind(this);
    this.handleCloseCodeSnippetModal = this.handleCloseCodeSnippetModal.bind(this);


  }
  componentDidMount(): void {
    this.setState({ selectedClass: parseInt(this.props.project_id) })
    this.activequestion();
    this.fetchClasses();
    this.fetchProjects(parseInt(this.props.project_id));
    console.log("This is the projectID", this.props.project_id);
  }
  activequestion = () => {
    axios.get(process.env.REACT_APP_BASE_API_URL + '/submissions/getactivequestion', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        var data = parseInt(res.data);
        if (data != -1) {
          this.setState({ usersQuestionID: data });
          this.setState({ questionAsked: true });
          this.startFetchingInterval();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  fetchClasses() {
    axios.get(process.env.REACT_APP_BASE_API_URL + '/class/all?filter=true', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        //map the response data to the correct format
        const classesDropdown: DropDownOption[] = res.data.map((item: { id: any; name: any; }) => ({
          key: item.id,
          value: item.id,
          text: item.name
        }));
        this.setState({ classes: classesDropdown });
      })
      .catch(err => {
        console.log(err);
      });
  }
  fetchProjects(classId: number) {
    axios
      .get(
        `${process.env.REACT_APP_BASE_API_URL}/projects/get_projects_by_class_id?id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'AUTOTA_AUTH_TOKEN'
            )}`,
          },
        }
      )
      .then(res => {
        //map the response data to the correct format
        const projectDropdown: DropDownOption[] = res.data.map((itemString: string) => {
          const item = JSON.parse(itemString);
          return {
            key: item.Id,
            value: item.Id,
            text: item.Name
          };
        });
        this.setState({ projects: projectDropdown });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleQuestionSubmit() {
    if (this.state.question === "") {
      window.alert("Please enter a question");
      return;
    }
    axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/submitOHquestion?question=${this.state.question}&projectId=${this.state.selectedProject}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        this.setState({ usersQuestionID: res.data });
        this.setState({ questionAsked: true });
        this.setState({ modalOpen: false });
        this.startFetchingInterval();

      })
      .catch(err => {
        console.log(err);
      });
  }
  fetchOHQuestions() {
    axios.get(process.env.REACT_APP_BASE_API_URL + '/submissions/getOHquestions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        console.log(res.data);
        const formattedQuestions = res.data.map((item: any[]) => ({
          questionID: parseInt(item[0]),
          question: item[1],
          question_time: item[2]
        }));
        this.setState({ Student_questions: formattedQuestions });
      })
      .catch(err => {
        console.log(err);
      });
  }
  calculateTimeDifference = (questionTime: string) => {
    const currentTime = new Date();
    const questionTimestamp = new Date(questionTime).getTime(); // Convert to timestamp in milliseconds
    const timeDifferenceInMilliseconds = currentTime.getTime() - questionTimestamp;
    const timeDifferenceInMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60));
    return timeDifferenceInMinutes;
  };

  startFetchingInterval() {
    this.fetchOHQuestions(); // Call immediately when starting

    // Call the fetchOHQuestions function every minute
    setInterval(this.fetchOHQuestions, 60000); // 60000 milliseconds = 1 minute
  }
  handleClassIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps) {
    const parsedValue = value.value ? parseInt(value.value.toString()) : null;
    this.setState({ selectedClass: parsedValue });
    if (parsedValue !== null) {
      this.fetchProjects(parsedValue);
    }
  }
  handleProjectIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps) {
    this.setState({ selectedProject: value.value ? parseInt(value.value.toString()) : -1 });
  }
  handleOpenModal() {
    this.setState({ modalOpen: true });
  }
  handleCloseModal() {
    this.setState({ modalOpen: false });
  }
  handleOpenQueueModal() {
    this.setState({ QueuemodalOpen: true });
  }
  handleCloseQueueModal() {
    this.setState({ QueuemodalOpen: false });
  }
  handleOpenCodeSnippetModal() {
    this.setState({ runningStep: 0 })
    this.setState({ modalCodeSnippetOpen: true });
  }
  handleCloseCodeSnippetModal() {
    this.setState({ modalCodeSnippetOpen: false });
  }

  handlelanguageChange = (e: any, { value }: any) => {
    if (value === undefined) {
      return;
    }
    if (value == "java") {
      this.setState({
        codesnippet: `class Snippet{  
  public static void main(String args[]){  
    //Add code here!  
  }  
}`
      })
    }
    if (value == "python") {
      this.setState({
        codesnippet: ""
      })
    }
    this.setState({ language: value });
  }
  handleChatSubmit = () => {
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/submitChat?code=${encodeURIComponent(this.state.codesnippet)}&language=${this.state.language}&project_id=${this.props.project_id}&message=${this.state.studentMessage}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }


  //Axios call to submit code snippet to the backend code running service



  handleCodesnippetSubmit = () => {
    console.log(this.state.codesnippet);
    this.setState({ runningStep: 0 });

    this.setState({ runningStep: 1 });

    axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/run_code_snippet?code=${encodeURIComponent(this.state.codesnippet)}&language=${this.state.language}&input=${encodeURIComponent(this.state.testcaseInput)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then(res => {
        this.setState({ runningStep: 2 });
        setTimeout(() => {
          this.setState({ runningStep: 3 });
        }, 1000);
        setTimeout(() => {
          console.log(res.data);
          if (typeof res.data === 'string' && res.data.includes('SyntaxError:')) {
            this.setState({ runningStep: 5 });
          } else {
            this.setState({ runningStep: 4 });
          }
          this.setState({ testcaseOutput: res.data });
        }, 3000);
      })
      .catch(err => {
        console.log(err);
      });
  }


  render() {
    const events = [
      {
        image: codeimg,
        date: '5 days ago',
        meta: <><Icon name='like' /> 5 Likes</>,
        summary: <span style={{ color: 'blue' }}>BlueTiger:</span>,
        extraText:
          <SyntaxHighlighter language="python" style={vs} showLineNumbers={true}>
            {`print("hello world")`}
          </SyntaxHighlighter>
      },
      {
        image: codeimg,
        date: '5 days ago',
        meta: (
          <div style={{ color: '#888', fontSize: '0.85em', marginBottom: '10px' }}>
            <Icon name='like' /> 5 Likes
          </div>
        ),
        summary: (
          <div style={{ fontWeight: 'bold', color: 'blue', marginBottom: '5px' }}>BlueTiger:</div>
        ),
        extraText: (
          <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '10px' }}>
            <SyntaxHighlighter language="python" style={vs} showLineNumbers={true}>
              {`print("hello world")`}
            </SyntaxHighlighter>
          </div>
        ),
      },
      {
        image: codeimg,
        date: '3 days ago',
        meta: <><Icon name='like' /> 10 Likes</>,
        summary: <span style={{ color: 'red' }}>RedRhino:</span>,
        extraText:
          <SyntaxHighlighter language="python" style={vs} showLineNumbers={true}>
            {`
      class Node:
        def __init__(self, data):
          self.left = None
          self.right = None
          self.data = data

        def insert(self, data):
          if self.data:
            if data < self.data:
              if self.left is None:
                self.left = Node(data)
              else:
                self.left.insert(data)
            elif data > self.data:
              if self.right is None:
                self.right = Node(data)
              else:
                self.right.insert(data)
          else:
            self.data = data
            `}
          </SyntaxHighlighter>
      },
      {
        image: codeimg,
        date: '4 days ago',
        meta: <><Icon name='like' /> 5 Likes</>,
        summary: <span style={{ color: 'green' }}>GreenGoose:</span>,
        extraText:
          <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} >
            print("hello world")
          </SyntaxHighlighter>
      },
      {
        image: codeimg,
        date: '3 days ago',
        meta: <><Icon name='like' /> 75 Likes</>,
        summary: <span style={{ color: 'orange' }}>OrangeOtter:</span>,
        extraText:
          <div>
            <p>Here is a simple example of a user comment</p>
            <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} >
              import numpy as np
            </SyntaxHighlighter>
          </div>
      },
      {
        image: codeimg,
        date: '2 days ago',
        meta: <><Icon name='like' /> 45 Likes</>,
        summary: <span style={{ color: '#FFA500' }}>AdminBear:</span>,
        extraText:
          <div>
            <p >Here is a simple example of a user comment</p>
            <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} >
              import numpy as np
            </SyntaxHighlighter>
          </div>
      },
      {
        image: codeimg,
        date: '12 hours ago',
        meta: <><Icon name='like' /> 15 Likes</>,
        summary: <span style={{ color: 'blue' }}>BlueTiger:</span>,
        extraText:
          <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} >
            my_list = [1, 2, 3, 4, 5]
            print(my_list[0])
          </SyntaxHighlighter>
      },
      {
        image: codeimg,
        date: 'Just now',
        meta: <><Icon name='like' /> 20 Likes</>,
        summary: <span style={{ color: 'red' }}>RedRhino:</span>,
        extraText:
          <SyntaxHighlighter language="python" style={vs} showLineNumbers={true}>
            {`
              def factorial(n):
                  if n == 0:
                      return 1
                  else:
                      return n * factorial(n-1)

              num = 5
              print("The factorial of", num, "is", factorial(num))
              `}
          </SyntaxHighlighter>
      }
    ]
    return (
      <div>
        <Modal
          open={this.state.modalCodeSnippetOpen}
          onClose={this.handleCloseCodeSnippetModal}
          size="large"
          style={{
            fontFamily: "'Roboto', sans-serif",
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <Modal.Header style={{ backgroundColor: '#6200EE', color: '#FFFFFF', fontSize: '1.5em', padding: '20px', borderRadius: '20px 20px 0 0' }}>
            Code Runner:
          </Modal.Header>
          <Modal.Content style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
            <AceEditor
              placeholder="Write your code snippet here..."
              mode={this.state.language}
              theme="monokai"
              name="codeSnippetEditor"
              fontSize={18}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              value={this.state.codesnippet}
              onChange={(newValue) => this.setState({ codesnippet: newValue })}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              style={{ borderRadius: '10px', border: '2px solid #e0e0e0' }}
              height="250px"
              width="100%"
            />
            <Form style={{ marginTop: '20px' }}>
              <Form.Field>
                <label htmlFor="testcase-input" style={{ fontSize: '1em', fontWeight: 'bold', color: '#333' }}>Test Case Input:</label>
                <TextArea
                  id="testcase-input"
                  placeholder="Enter input...(if the code does not require input, just hit run!)"
                  style={{ borderRadius: '10px', border: '2px solid #e0e0e0', minHeight: '100px', padding: '10px', fontSize: '16px', fontFamily: "'Roboto', sans-serif" }}
                  onChange={(e, { value }) => this.setState({ testcaseInput: value as string })}
                />
              </Form.Field>
              <Form.Field>
                <label htmlFor="testcase-output" style={{ fontSize: '1em', fontWeight: 'bold', color: '#333' }}>Test Case Output:</label>
                <TextArea
                  id="testcase-output"
                  value={this.state.testcaseOutput}
                  style={{ borderRadius: '10px', border: '2px solid #e0e0e0', minHeight: '100px', padding: '10px', fontSize: '16px', fontFamily: "'Roboto', sans-serif", backgroundColor: '#e7e7e7', color: '#333' }}
                  readOnly
                />
              </Form.Field>
              <Button
                type='button'
                color='blue'
                style={{
                  borderRadius: '30px',
                  padding: '15px 30px',
                  fontSize: '1em',
                  color: '#ffffff',
                  backgroundColor: '#6200EE',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  marginTop: '20px',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                onClick={this.handleCodesnippetSubmit}
              >
                Run
              </Button>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '30px', marginBottom: '20px' }}>
                <Step.Group size='small' style={{ flex: '1' }}>
                  <Step active={this.state.runningStep === 1} completed={this.state.runningStep > 1}>
                    <Icon name='setting' style={{ color: this.state.runningStep >= 1 ? '#6200EE' : '#bbb' }} />
                    <Step.Content>
                      <Step.Title style={{ color: this.state.runningStep >= 1 ? '#333' : '#bbb', fontWeight: 'bold' }}>Preparing Snippet</Step.Title>
                    </Step.Content>
                  </Step>

                  <Step active={this.state.runningStep === 2} completed={this.state.runningStep > 2}>
                    <Icon name='spinner' loading={this.state.runningStep === 2} style={{ color: this.state.runningStep >= 2 ? '#6200EE' : '#bbb' }} />
                    <Step.Content>
                      <Step.Title style={{ color: this.state.runningStep >= 2 ? '#333' : '#bbb', fontWeight: 'bold' }}>Executing Code</Step.Title>
                    </Step.Content>
                  </Step>

                  <Step active={this.state.runningStep === 3 || this.state.runningStep === 5} completed={this.state.runningStep > 3 && this.state.runningStep !== 5} error={this.state.runningStep === 5}>
                    <Icon name={this.state.runningStep === 5 ? 'cancel' : 'check circle'} style={{ color: this.state.runningStep === 5 ? '#DB2828' : this.state.runningStep > 3 ? '#21BA45' : '#bbb' }} />
                    <Step.Content>
                      <Step.Title style={{ color: this.state.runningStep >= 3 ? '#333' : '#bbb', fontWeight: 'bold' }}>
                        {this.state.runningStep === 5 ? 'Error Detected' : 'Execution Complete'}
                      </Step.Title>
                    </Step.Content>
                  </Step>
                </Step.Group>
              </div>
            </Form>
          </Modal.Content>
        </Modal>



        <Modal
          open={this.state.modalOpen}
          onClose={this.handleCloseModal}
          size="large"
          style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4',
            boxShadow: '0px 0px 10px 2px rgba(0,0,0,0.1)',
            borderRadius: '10px',
          }}
        >
          <Modal.Header style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Office hour form:</Modal.Header>
          <Modal.Content style={{ padding: '20px' }}>
            <Form style={{ padding: '20px' }}>
              <Form.Field style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '16px', fontWeight: 'bold' }}>Please select a project</label>
                <Dropdown
                  disabled={this.state.selectedClass === null}
                  placeholder='Select project'
                  fluid
                  search
                  selection
                  options={this.state.projects}
                  onChange={this.handleProjectIdChange}
                  style={{ borderRadius: '5px', borderColor: '#ddd' }}
                />
              </Form.Field>
              <Form.Field>
                <label style={{ fontSize: '16px', fontWeight: 'bold' }}>Please ask a question for the TA to consider</label>
                <TextArea
                  rows={2}
                  placeholder='Remember, the more detail provided helps the TA find and fix your error faster'
                  value={this.state.question}
                  onChange={(e) => this.setState({ question: e.target.value })}
                  style={{ borderRadius: '5px', borderColor: '#ddd' }}
                />
              </Form.Field>
              <Button onClick={this.handleQuestionSubmit} style={{ backgroundColor: '#007BFF', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Submit Question</Button>
            </Form>
          </Modal.Content>
        </Modal>

        <Modal
          open={this.state.QueuemodalOpen}
          onClose={this.handleCloseQueueModal}
          size="large"
          style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f4',
            boxShadow: '0px 0px 10px 2px rgba(0,0,0,0.1)',
            borderRadius: '10px',
          }}
        >
          <Modal.Header style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Office hour Queue:</Modal.Header>
          <Modal.Content style={{ padding: '20px' }}>
            <div style={{ margin: '20px', marginTop: "60px", padding: '20px', border: '1px solid #ddd', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', overflow: 'auto', height: '300px', maxHeight: '1000px' }}>
              <Form>
                <Header as='h2'>In-Person office hour queue: <br></br>
                  {!this.state.questionAsked ? <Button style={{ marginTop: "20px" }} onClick={this.handleOpenModal}>Enter Queue</Button> : <p></p>}
                </Header>
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Question Queue</Table.HeaderCell>
                      <Table.HeaderCell>Time Submitted</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {this.state.Student_questions.map((question, index) => {
                      return (
                        <Table.Row key={index}>
                          <Table.Cell>
                            {question.questionID === this.state.usersQuestionID
                              ?
                              'Your submission'
                              : index + 1}
                          </Table.Cell>
                          <Table.Cell>
                            {question.question_time} - This was {this.calculateTimeDifference(question.question_time)} minutes ago
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </Form>
            </div>
          </Modal.Content>

        </Modal>

        <div style={{
          margin: '20px',
          marginTop: "60px",
          padding: '30px',
          border: '2px solid #e0e0e0',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          <h2 style={{
            marginBottom: '30px',
            color: '#333',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>In-Person Office Hours Queue:</h2>
          {!this.state.questionAsked ?
            <Button style={{
              marginTop: "20px",
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} onClick={this.handleOpenModal}>Enter Queue</Button>
            :
            <Button style={{
              marginTop: "20px",
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} onClick={this.handleOpenQueueModal}>View Active Queue</Button>
          }
        </div>
      </div>

    );
  }
}
{/* <div style={{
          margin: '20px',
          marginTop: '20px', // Adjusted for consistency in spacing
          padding: '30px',
          border: '2px solid #e0e0e0',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'auto',
          backgroundColor: '#ffffff',
          maxHeight: '700px' // Ensuring the container does not grow beyond a certain height
        }}> */}
{/* <h2 style={{
            marginBottom: '20px',
            color: '#333',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>Live Class Chat:</h2>
          <hr style={{
            border: '0',
            height: '2px',
            backgroundColor: '#e0e0e0',
            marginBottom: '20px'
          }} /> */}
{/* Chat items container */ }
{/* <div style={{
            overflowY: 'scroll',
            maxHeight: '600px', // Adjusted to maintain overall maxHeight
            paddingRight: '5px' // Compensate for scroll bar space
          }}>
            {events.map((event, index) => (
              <div key={index} style={{
                marginBottom: '20px',
                borderBottom: '1px solid #eee',
                paddingBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <img src={event.image} alt="" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    marginRight: '10px'
                  }} />
                  <div>
                    {event.summary}
                    <div style={{ color: '#999', fontSize: '0.85em' }}>{event.date}</div>
                  </div>
                </div>
                {event.meta}
                <div style={{
                  marginTop: '10px',
                  background: '#f5f5f5',
                  borderRadius: '10px',
                  padding: '10px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {event.extraText}
                </div>
              </div>
            ))} */}

{/* <Form style={{
          marginTop: '40px',
          padding: '30px',
          border: '2px solid #e0e0e0',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Grid columns={2} stackable>
            <Grid.Column>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '1em', fontWeight: 'bold', color: '#333' }}>What would you like to say to your peers?</label>
              <input
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1em', color: '#333', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.08)' }}
                placeholder='Submit your text here...'
                onChange={(e) => this.setState({ studentMessage: e.target.value })}
              />
            </Grid.Column>
            <Grid.Column>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '1em', fontWeight: 'bold', color: '#333' }}>Select a language</label>
              <Dropdown
                placeholder='Select Language'
                fluid
                selection
                options={[
                  { key: 'java', text: 'Java', value: 'java' },
                  { key: 'python', text: 'Python', value: 'python' },
                  // Add more options as needed
                ]}
                style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                onChange={this.handlelanguageChange}
              />
            </Grid.Column>
          </Grid>
          <Form.Field style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '1em', fontWeight: 'bold', color: '#333' }}>If you want to add a code snippet, feel free!</label>
            <AceEditor
              placeholder="Feel Free to write an example code snippet here! ~~~
      Reminder: Guide your peers, don't give them the exact solutions to the problem!"
              mode="python"
              theme="tomorrow"
              name="codeSnippetEditor"
              fontSize={18}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              value={this.state.codesnippet}
              onChange={(newValue) => this.setState({ codesnippet: newValue })}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
              }}
              style={{ borderRadius: '8px', border: '2px solid #ccc' }}
              height="250px"
              width="100%"
            />
          </Form.Field>
          <Button
            type='submit'
            style={{ padding: '15px 30px', borderRadius: '20px', border: 'none', backgroundColor: '#007BFF', color: 'white', fontSize: '1em', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', marginRight: '10px' }}
            onClick={this.handleChatSubmit}
          >
            Submit!
          </Button>
          <Button
            onClick={this.handleOpenCodeSnippetModal}
            style={{
              padding: '15px 30px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: '#28a745',
              color: 'white',
              fontSize: '1em',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              float: 'right'
            }}
          >
            Run Code Snippet!
          </Button>
        </Form> */}

export default OfficeHoursComponent;

