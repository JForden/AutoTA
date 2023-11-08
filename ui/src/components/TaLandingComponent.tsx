import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Button, Card, Image, Tab } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import codeimg from '../codeex.png'
  
interface OfficeHoursState {
    question: string;
    Student_questions: Array<OHQuestion>;
}
  
interface OHQuestion {
    question: string;
    question_time: string;
    Student_name: string;
    Question_id: number;
    ruled: number;
    submission_id: number;
    project_id: number;
    class_id: number;
}
  


class TaComponent extends Component<{}, OfficeHoursState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            question: "",
            Student_questions: [],
        };
        this.handleComplete = this.handleComplete.bind(this);
        this.handleRuling = this.handleRuling.bind(this);
        this.fetchOHQuestions = this.fetchOHQuestions.bind(this);
        this.startFetchingInterval = this.startFetchingInterval.bind(this);
    }
    componentDidMount() {
        this.startFetchingInterval();
    }
    



    fetchOHQuestions = () => {
        axios.get(process.env.REACT_APP_BASE_API_URL + '/submissions/getOHquestions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            const formattedQuestions = res.data.map((item: any[]) => ({
                Question_id: item[0],
                question: item[1],
                question_time: item[2],
                Student_name: item[3],
                ruled: item[4],
                project_id: item[5],
                class_id: item[6],
                submission_id: item[7]
              }));
            this.setState({ Student_questions: formattedQuestions });
        }
        )
        .catch(err => {
            console.log(err);
        }
        );
    }


    handleComplete = (id: number) => (e: any) => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/dismissOHQuestion?question_id=${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            this.fetchOHQuestions();
        }
        )
        .catch(err => {
            console.log(err);
        }
        );
    }

    handleAssignmentDescription = (id: number) => (e: any) => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/getAssignmentDescription?project_id=${id}`, {
            responseType: 'arraybuffer',  // Add this line to specify response type
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
    
            // Open the PDF in a new browser tab
            window.open(url, '_blank');
    
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.log(err);
        });
    }
    




    handleRuling(id: number, ruling: number) {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/submitOHQuestionRuling?question_id=${id}&ruling=${ruling}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            this.fetchOHQuestions();
        }
        )
        .catch(err => {
            console.log(err);
        }
        );
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
        setInterval(this.fetchOHQuestions, 300000); // 300000 milliseconds = 5 minutes
    }



    render() {
        return (
            <Table celled style={{ 
                borderRadius: '10px', 
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)' // Kept only the darkest shadow
                }}>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Question Queue</Table.HeaderCell>
                <Table.HeaderCell>Student Name</Table.HeaderCell>
                <Table.HeaderCell>Question</Table.HeaderCell>
                <Table.HeaderCell>Time in Queue</Table.HeaderCell>
                <Table.HeaderCell>Feedback</Table.HeaderCell>
                <Table.HeaderCell>Assignment Description</Table.HeaderCell>
                <Table.HeaderCell>Student Code</Table.HeaderCell>
                <Table.HeaderCell>Complete</Table.HeaderCell>
            </Table.Row>
            </Table.Header>
            <Table.Body>
            {this.state.Student_questions.map((item: OHQuestion, index) => (
                <Table.Row>
                <Table.Cell>{index + 1 }</Table.Cell>
                <Table.Cell>{item.Student_name}</Table.Cell>
                <Table.Cell>{item.question}</Table.Cell>
                <Table.Cell>{"In queue for " + this.calculateTimeDifference(item.question_time)} minutes</Table.Cell>
                <Table.Cell>
                <Button.Group>

                {item.ruled === -1 ? 
                    <Button.Group>
                    <Button color="red" onClick={() => this.handleRuling(item.Question_id, 0)}>Reject</Button>
                    <Button.Or />
                    <Button color="blue" onClick={() => this.handleRuling(item.Question_id, 1)}>Accept</Button>
                    </Button.Group>
                    : 
                    <Button.Group>
                    <Button color="red" disabled={true} >Reject</Button>
                    <Button.Or />
                    <Button color="blue" disabled={true} >Accept</Button>
                    </Button.Group>
                    }
                </Button.Group>
                </Table.Cell>
                    
                <Table.Cell>
                <Button disabled={false} color='green' onClick={this.handleAssignmentDescription(item.project_id)}>view description</Button>
                </Table.Cell>
                <Table.Cell>
                {item.ruled === -1 ? 
                    <Button.Group>
                    <Button disabled={true}  color='orange'>view</Button>
                    </Button.Group>
                    : 
                    <Button.Group>
                    <Table.Cell>
                        {item.submission_id !== -1 ? (
                            <Link target="_blank" to={"/class/" + item.class_id + "/code/" + item.submission_id}>
                                <Button color={item.ruled === -1 ? 'grey' : 'orange'}>
                                    View
                                </Button>
                            </Link>
                        ) : (
                            <Button color='grey' disabled>
                                View
                            </Button>
                        )}
                    </Table.Cell>
                    </Button.Group>
                    
                    }
                </Table.Cell>
                <Table.Cell>
                    {item.ruled === -1 ? 
                    <Button.Group>
                    <Button disabled={true}  color='green'>Completed</Button>
                    </Button.Group>
                    : 
                    <Button.Group>
                    <Button disabled={false} color='green' onClick={this.handleComplete(item.Question_id)}>Completed</Button>
                    </Button.Group>
                    
                    }
                </Table.Cell>
                </Table.Row>
            ))}
            </Table.Body>
            </Table>
        );
    }
    
}

export default TaComponent;