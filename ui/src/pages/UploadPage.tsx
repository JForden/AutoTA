import { Component, useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment, Dimmer, Header, Icon, Table } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
import React from 'react'
import { SemanticCOLORS } from 'semantic-ui-react'
import ErrorMessage from '../components/ErrorMessage';
import Countdown from 'react-countdown';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

interface UploadProps {
    class_id?: string
}

interface UploadPageState {
    file?: File,
    color: SemanticCOLORS,
    isLoading: boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    end: string,
    canRedeem: boolean,
    points: number
    time_until_next_submission: string,
    is_allowed_to_submit: boolean,
    hasScoreEnabled: boolean,
    hasUnlockEnabled: boolean,

}

const UploadPage = () => {
    let { class_id } = useParams<UploadProps>();
    var cid = class_id ? parseInt(class_id) : -1;
    const [file, setFile] = useState<File | null>(null);
    const [color, setColor] = useState<string>('gray');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error_message, setError_Message] = useState<string>("");
    const [isErrorMessageHidden, setIsErrorMessageHidden] = useState<boolean>(true);
    const [project_name, setProject_Name] = useState<string>("");
    const [project_id, setProject_id] = useState<number>(0);
    const [end, setEnd] = useState<string>('');
    const [canRedeem, setCanRedeem] = useState<boolean>(false);
    const [points, setPoints] = useState<number>(0);
    const [time_until_next_submission, setTime_Until_Next_Submission] = useState<string>("");
    const [is_allowed_to_submit, setIs_Allowed_To_Submit] = useState<boolean>(true);
    const [hasScoreEnabled, setHasScoreEnabled] = useState<boolean>(false);
    const [hasUnlockEnabled, setHasUnlockEnabled] = useState<boolean>(false);
    const [hasTbsEnabled, setHasTbsEnabled] = useState<boolean>(false);
    const [tbstime, setTbsTime] = useState<string>("");
    const [DaysSinceProjectStarted, setDaysSinceProjectStarted] = useState<number>(0);
    const [TimeUntilNextSubmission, setTimeUntilNextSubmission] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string>("");


    useEffect(() => {
        getSubmissionDetails();
    }, [])

    // On file select (from the pop up)
    function handleFileChange(event: React.FormEvent) {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setFile(files[0])
        } else {
            setFile(null);
        }

    };
    function handleRedeem() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/extraday`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            alert("You have now recieved an extra day of unlimited submissions!  Instead of the regular 45 minutes coolday this Wednesday, you'll only have a 5 minute cooldown between submissions!");
            window.location.reload();
        })
    }
    function getSubmissionDetails() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/GetSubmissionDetails?class_id=${class_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            console.log(res.data);
            setDaysSinceProjectStarted(parseInt(res.data[1]) + 1);
            setTbsTime(res.data[0]);
            setTimeUntilNextSubmission(res.data[2]);
        })
    }
    function submitSuggestions() {
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/submit_suggestion`,
            {
                "suggestion": suggestions
            },
            {
                headers:
                {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            }
        ).then(res => {
            alert("Thank you for your constructive feedback, if you have any other suggestions please feel free to submit them.");
        }, (error) => {
            alert("There was an error submitting your feedback. Please try again later.");
        })
    }

    function onTimerFinish() {
        window.location.reload();
    }

    function handleSubmit() {
        if (file !== null) {
            setIsErrorMessageHidden(true);
            setIsLoading(true);
            // Create an object of formData
            const formData = new FormData();

            // Update the formData object
            formData.append(
                "file",
                file,
                file.name
            );

            formData.append("class_id", cid.toString());

            // Request made to the backend api
            // Send formData object
            axios.post(process.env.REACT_APP_BASE_API_URL + `/upload/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            })
                .then(res => {
                    window.location.href = "code";
                })
                .catch(err => {
                    setError_Message(err.response.data.message);
                    setIsErrorMessageHidden(false);
                    setIsLoading(false);
                })
        }
    }


    return (
        <div>
            <Helmet>
                <title>Upload | TA-Bot</title>
            </Helmet>
            <MenuComponent showAdminUpload={false} showUpload={false} showHelp={false} showCreate={false} showLast={true} showReviewButton={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column width={4}>
                    <Form loading={isLoading} size='large' onSubmit={handleSubmit} disabled={true}>
                        <Dimmer.Dimmable dimmed={true}>
                            <Segment stacked>
                                <h1>Upload Assignment Here</h1>
                                <Form.Input type="file" fluid required onChange={handleFileChange} />
                                <Button disabled={!is_allowed_to_submit} type="submit" color='blue' fluid size='large'>
                                    Upload
                                </Button>
                                <br />
                            </Segment>
                            {tbstime != "Expired" || TimeUntilNextSubmission != "None" ? (
                                <Segment stacked>
                                    <Table definition>
                                        {tbstime !== "Expired" && (
                                            <Table.Row>
                                                <Table.Cell>Reduced TBS:</Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Icon name="clock outline" />
                                                    <Countdown
                                                        date={new Date(new Date().getTime() + (parseInt(tbstime.split(' ')[0]) * 3600000) + (parseInt(tbstime.split(' ')[2]) * 60000))}
                                                        intervalDelay={1000}
                                                        precision={2}
                                                        renderer={({ hours, minutes }) => `${hours} hours, ${minutes} minutes`}
                                                        onComplete={() => { }}
                                                    />
                                                    &nbsp; remaining
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                        {TimeUntilNextSubmission !== "None" && (
                                            <Table.Row>
                                                <Table.Cell>Time Until next visible submission:</Table.Cell>
                                                <Table.Cell textAlign="center">
                                                    <Icon name="clock outline" />
                                                    <Countdown
                                                        date={new Date(new Date().getTime() + (parseInt(TimeUntilNextSubmission.split(' ')[0]) * 3600000) + (parseInt(TimeUntilNextSubmission.split(' ')[2]) * 60000) + (parseInt(TimeUntilNextSubmission.split(' ')[4]) * 1000))}
                                                        intervalDelay={1000}
                                                        precision={2}
                                                        renderer={({ hours, minutes, seconds }) => `${hours} hours, ${minutes} minutes, ${seconds} seconds`}
                                                        onComplete={() => { }}
                                                    />
                                                    &nbsp; remaining
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </Table>
                                </Segment>
                            ) : (
                                <div></div>
                            )}
                            <Dimmer active={project_id === -1}>
                                <Header as='h2' icon inverted>
                                    <Icon name='ban' />
                                    No active project
                                </Header>
                            </Dimmer>
                        </Dimmer.Dimmable>
                    </Form>
                    <div>
                        <Table definition>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell />
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 1 ? '#51f542' : 'white' }}>Day 1</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 2 ? '#66bb6a' : 'white' }}>Day 2</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 3 ? '#f5ce42' : 'white' }}>Day 3</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 4 ? '#f59e42' : 'white' }}>Day 4</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 5 ? '#f57842' : 'white' }}>Day 5</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted >= 6 ? '#f55442' : 'white' }}>Day 6+</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>normal TBS</Table.Cell>
                                    <Table.Cell>5</Table.Cell>
                                    <Table.Cell>15</Table.Cell>
                                    <Table.Cell>45</Table.Cell>
                                    <Table.Cell>60</Table.Cell>
                                    <Table.Cell>90</Table.Cell>
                                    <Table.Cell>120</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>office hours TBS</Table.Cell>
                                    <Table.Cell>1.7</Table.Cell>
                                    <Table.Cell>5</Table.Cell>
                                    <Table.Cell>15</Table.Cell>
                                    <Table.Cell>20</Table.Cell>
                                    <Table.Cell>30</Table.Cell>
                                    <Table.Cell>40</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                        <p style={{ color: 'red', fontSize: '20px', fontWeight: 'bold' }}>
                            You get instant test case feedback while in office hours! <br></br>
                            After you leave office hours, you will have the reduced TBS for 3 hours!
                        </p>
                    </div>

                    {hasTbsEnabled && project_id !== -1 && !is_allowed_to_submit && (
                        <>
                            <Icon name="clock outline" />
                            <Countdown date={new Date(time_until_next_submission)} onComplete={onTimerFinish} />
                        </>
                    )}

                    <ErrorMessage message={error_message} isHidden={isErrorMessageHidden} />

                    {hasScoreEnabled && (
                        <Button basic color='blue' content='Score on last assignment' icon='gem'
                            label={{ as: 'a', basic: true, color: 'blue', pointing: 'left', content: points }} />
                    )}

                    {hasUnlockEnabled && (
                        <Button disabled={!canRedeem} type="submit" color='yellow' fluid size='small' onClick={handleRedeem}>
                            Use Extra Day (Score must be above 75)
                        </Button>
                    )}
                    <div>&nbsp;</div>
                </Grid.Column>
                <Grid.Column width={2}>
                    <Form>
                        <label>
                            TA-Bot is an assessment system developed by Marquette students. We welcome constructive feedback throughout the semester. The TA-Bot team will strive to implement your suggestions. For more information, please see our <a href="https://docs.google.com/document/d/1af1NU6K24drPaiJXFFo4gLD4dqNVivKQ9ZijDMAWyd4/edit?usp=sharing">FAQ's</a>.
                        </label>
                        <Form.TextArea placeholder={"example: TA-Bot struggles when dealing with small issues in Test cases"} value={suggestions} onChange={(e, { value }) => setSuggestions(value as string)} />
                        <Button style={{ backgroundColor: 'purple', color: 'white', marginTop: '10px' }} onClick={submitSuggestions} type='submit'>Submit Feedback</Button>
                    </Form>
                </Grid.Column>
            </Grid>
        </div>
    );
}

export default UploadPage;
