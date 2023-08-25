import { Component, useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment, Dimmer, Header, Icon } from 'semantic-ui-react'
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
    const [tbsMessage, setTbsMessage] = useState<string>("");
    const [tbsUploadTime, setTbsUploadTime] = useState<string>("");


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
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/getStudentTimeout?class_id=${cid.toString()}`,  {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
          })
        .then(res => {
            setTbsTime(res.data[0]);
            setTbsMessage(res.data[1]);
            setTbsUploadTime(res.data[2]);
            console.log(res.data[0]);
            console.log(res.data[1]);
            console.log(res.data[2]);
        })
        .catch(err => {
            console.log(err);
        }
        );
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

    
    /*
    const [hoursStr, minutesStr, secondsStr] = tbstime.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    const countdownDate = new Date();
    countdownDate.setHours(hours);
    countdownDate.setMinutes(minutes);
    countdownDate.setSeconds(seconds);
    <h1>You have  <Icon name="clock outline"></Icon> <Countdown date={countdownDate} /> left of reduced rate limit submissions.</h1>
    */
    
    return (
        <div>
    <Helmet>
        <title>Upload | TA-Bot</title>
    </Helmet>
    <MenuComponent showAdminUpload={false} showUpload={false} showHelp={false} showCreate={false} showLast={true} showReviewButton={false}></MenuComponent>
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column width={5}>
            <Segment stacked>
                    {tbstime === "1" ? (
                        <div><h1>Currently at office hours: No rate limit!</h1></div>
                    ) : (
                        <div></div>
                    )}
                    {tbstime === "-1" ? (
                        <div>
                            <h1>You can upload to get test case results once every {tbsMessage} minutes <br></br> Attending office hours reduces this to {parseInt(tbsMessage)/3} minutes for 6 hours!</h1>
                            <h1>Next upload is available in <Countdown date={new Date().setHours(parseInt(tbstime.split(":")[0], 10), parseInt(tbstime.split(":")[1], 10), parseInt(tbstime.split(":")[2], 10))} /></h1> </div>
                    ) : (
                        <><div>
                                    <h1>Office Hours TBS reduction, you can get results once every {parseInt(tbsMessage) / 3} minutes 
                                    This is in effect for 
                                    <Countdown date={new Date().setHours(parseInt(tbstime.split(":")[0], 10), parseInt(tbstime.split(":")[1], 10), parseInt(tbstime.split(":")[2], 10))} /> more minutes! </h1> </div></> 
                    )}
            </Segment>
                <div className="countdown-box">
                <div className="countdown-info">
                </div>
            </div>
        
        </Grid.Column>
        <Grid.Column width={5}>
        {tbsUploadTime == "0" ? (
                        <div><h1>You can upload for test case results!</h1></div>
                    ) : (
                        <div><h1>You will be able to upload for test case results in <Countdown date={new Date().setHours(parseInt(tbsUploadTime.split(":")[0], 10), parseInt(tbsUploadTime.split(":")[1], 10), parseInt(tbsUploadTime.split(":")[2], 10))} /> more minutes! </h1> </div>
                    )}
        </Grid.Column>

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
                    <Dimmer active={project_id === -1}>
                        <Header as='h2' icon inverted>
                            <Icon name='ban' />
                            No active project
                        </Header>
                    </Dimmer>
                </Dimmer.Dimmable>
            </Form>

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
