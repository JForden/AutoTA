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
    isLoading:boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    end: string,
    canRedeem:boolean,
    points:number
    time_until_next_submission: string,
    is_allowed_to_submit: boolean,
    hasScoreEnabled:boolean,
    hasUnlockEnabled: boolean,
    
}

const UploadPage = () => {
    let { class_id } = useParams<UploadProps>();
    var cid = class_id ? parseInt(class_id) : -1;
    const [file, setFile] = useState<File | null>(null);
    const [color, setColor] = useState<string>('gray');
    const [isLoading,setIsLoading] =useState<boolean>(false);
    const [error_message,setError_Message]=useState<string>("");
    const [isErrorMessageHidden,setIsErrorMessageHidden]=useState<boolean>(true);
    const [project_name,setProject_Name]=useState<string>("");
    const [project_id, setProject_id] = useState<number>(0);
    const [end, setEnd] = useState<string>('');
    const [canRedeem, setCanRedeem] = useState<boolean>(false);
    const [points, setPoints] = useState<number>(0);
    const [time_until_next_submission,setTime_Until_Next_Submission]=useState<string>("");
    const [is_allowed_to_submit, setIs_Allowed_To_Submit] = useState<boolean>(true);
    const [hasScoreEnabled, setHasScoreEnabled] = useState<boolean>(false);
    const [hasUnlockEnabled, setHasUnlockEnabled] = useState<boolean>(false);
    const [hasTbsEnabled, setHasTbsEnabled] = useState<boolean>(false);
    const [tbstime, setTbsTime] = useState<string>("");
    const [DaysSinceProjectStarted, setDaysSinceProjectStarted] = useState<number>(0);


    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/submissioncounter`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            setProject_Name(res.data.name);
            setEnd(res.data.end);
            setProject_id(res.data.Id);
            setCanRedeem(res.data.can_redeem);
            setPoints(res.data.points);
            setTime_Until_Next_Submission(res.data.time_until_next_submission);
            setIs_Allowed_To_Submit(!hasTbsEnabled || new Date() > new Date(res.data.time_until_next_submission));
        })
        .catch(err => {
            setError_Message(err.response.data.message);
            setIsErrorMessageHidden(false);
            setIsLoading(false);
        });
        getSubmissionDetails();
    }, [])

    // On file select (from the pop up)
    function handleFileChange(event : React.FormEvent) {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if(files != null && files.length === 1){
            // Update the state
            setFile(files[0])
        } else {
            setFile(null);
        }
      
    }; 
    function handleRedeem(){
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/extraday`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {            
            alert("You have now recieved an extra day of unlimited submissions!  Instead of the regular 45 minutes coolday this Wednesday, you'll only have a 5 minute cooldown between submissions!");
            window.location.reload();
        })
    }
    function getSubmissionDetails(){
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/GetSubmissionDetails?class_id=${class_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            setDaysSinceProjectStarted(parseInt(res.data[1]));
            setTbsTime(res.data[0]);
            console.log(res.data);
    })
    }

    function onTimerFinish(){
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
                    <Segment stacked>
                        <Table definition>
                           {
                                tbstime != "Expired" ?
                                <Table.Row>
                                <Table.Cell>Reduced TBS:</Table.Cell>
                                <Table.Cell textAlign="center">
                                    <Icon name="clock outline" />
                                    <Countdown
                                    date={new Date(new Date().getTime() + (parseInt(tbstime.split(' ')[0]) * 3600000) + (parseInt(tbstime.split(' ')[2]) * 60000))}
                                    intervalDelay={1000} // 1 second interval
                                    precision={2} // Display only hours and minutes
                                    renderer={({ hours, minutes }) => `${hours} hours, ${minutes} minutes`}
                                    onComplete={() => {}}
                                    />
                                    &nbsp; remaining
                                </Table.Cell>
                                </Table.Row>
                                :
                                <div></div>
                           }
                        </Table>
                            <p>Your additional content...</p>
                        </Segment>
                    
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
                        <Table.HeaderCell>Day 1</Table.HeaderCell>
                        <Table.HeaderCell>Day 2</Table.HeaderCell>
                        <Table.HeaderCell>Day 3</Table.HeaderCell>
                        <Table.HeaderCell>Day 4</Table.HeaderCell>
                        <Table.HeaderCell>Day 5</Table.HeaderCell>
                        <Table.HeaderCell>Day 6+</Table.HeaderCell>
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
                <p>You get instant test case feedback while in office hours! <br></br>
                After you leave office hours, you will have the reduced TBS for 3 hours!</p>
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
            <div><Icon name="paper plane" color="red" /><a href="https://docs.google.com/document/d/1Ig15zUygy85cNyPTg7_VYjW7WcgasvijmXGiNDjZssA/edit?usp=sharing" target="_blank">TA-Bot Patch Notes!</a></div>
        </Grid.Column>
    </Grid>
</div>
    );
}

export default UploadPage;
