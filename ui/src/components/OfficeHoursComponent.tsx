import React, { Component, SyntheticEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab,Icon,Table,Form, TextArea, Dropdown, DropdownProps, Button } from 'semantic-ui-react'
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';


interface OfficeHoursProps {
  question: string;
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
      Student_questions:[],
      classes: [],
      projects: [],
      selectedClass: 0,
      selectedProject: 0,
      usersQuestionID: 0
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


    }
    componentDidMount(): void {
      this.activequestion();
      this.fetchClasses();
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
      axios.get(process.env.REACT_APP_BASE_API_URL + '/class/all_classes_and_ids_for_student', {
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
    handleClassIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
      const parsedValue = value.value ? parseInt(value.value.toString()) : null;
      this.setState({ selectedClass: parsedValue });
      if (parsedValue !== null) {
        this.fetchProjects(parsedValue);
      }
    }
    handleProjectIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
      this.setState({ selectedProject: value.value ? parseInt(value.value.toString()) : -1 });
    }
      
    
    
  
    render() {
    return (
      <div>
      <h2>Office Hours Queue</h2>

      { !this.state.questionAsked ?
      <div>
      <Form>
        <Form.Group widths='equal'>
          <Form.Field>
            <label>Please select a class</label>
            <Dropdown
              placeholder='Select class'
              fluid
              search
              selection
              options={this.state.classes}
              onChange={this.handleClassIdChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Please select a project</label>
            <Dropdown
              disabled={this.state.selectedClass === null}
              placeholder='Select project'
              fluid
              search
              selection
              options={this.state.projects}
              onChange={this.handleProjectIdChange}
            />
          </Form.Field>
        </Form.Group>

        {this.state.selectedProject !== 0 && (
          <div>
            <Form.Field>
              <label>Please ask a question for the TA to consider</label>
              <TextArea
                rows={2}
                placeholder='Remember, the more detail provided helps the TA find and fix your error faster'
                value={this.state.question}
                onChange={(e) => this.setState({ question: e.target.value })}
              />
            </Form.Field>
            <Button onClick={this.handleQuestionSubmit}>Submit Question</Button>
          </div>
        )}
      </Form>
      </div>
      :
      <div>
        <h3>Question Submitted</h3>
        <p>Thank you for submitting your question, a TA will be with you shortly</p>
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
                {question.questionID === this.state.usersQuestionID && index === 0
                ? 'Your turn!'
                : question.questionID === this.state.usersQuestionID
                    ? 'Your submission'
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
        </div>
    }
      </div>
    );
  }
}

export default OfficeHoursComponent;
