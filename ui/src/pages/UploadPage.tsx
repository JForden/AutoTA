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

        axios.get(process.env.REACT_APP_BASE_API_URL + `/settings/config`,  {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            },
            params: {
                class_id: cid
            }
        }).then(res => {
            var data = res.data;
            setHasScoreEnabled(data.HasScoreEnabled);
            setHasUnlockEnabled(data.HasUnlockEnabled);
            setHasTbsEnabled(data.HasTBSEnabled);
        });
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
                window.location.href = "/code";
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
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={true}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Form loading={isLoading} size='large' onSubmit={handleSubmit} disabled={true}>
                <Dimmer.Dimmable dimmed={true}>
                <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={handleFileChange} />
                <Button disabled={!is_allowed_to_submit} type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                <br></br>
                </Segment>
                <Dimmer active={project_id === -1}>
                    <Header as='h2' icon inverted>
                    <Icon name='ban' />
                    No active project
                    </Header>
                </Dimmer>
                </Dimmer.Dimmable>
                {(() => {
                    if(hasTbsEnabled){
                        if(project_id !== -1 && !is_allowed_to_submit){
                            return (<><Icon name="clock outline"></Icon><Countdown date={new Date(time_until_next_submission)} onComplete={onTimerFinish} /></>);
                        } else {
                            return (<></>)
                        }
                    }
                    return (<></>);
                })()}
            </Form>
            <ErrorMessage message={error_message} isHidden={isErrorMessageHidden}></ErrorMessage>
            {(() => {
                if(hasScoreEnabled){
                    return (<Button basic color='blue' content='Score on last assignment' icon='gem'
                    label={{ as: 'a', basic: true, color: 'blue', pointing: 'left', content: points, }}/>);
                }
                return (<></>);
            })()}
            <br /> <br />
            {(() => {
                if(hasUnlockEnabled){
                    return (<Button disabled={!canRedeem} type="submit" color='yellow' fluid size='small' onClick={handleRedeem}>
                    Use Extra Day (Score must be above 75)
                </Button>);
                } else {
                    return (<></>)
                }
            })()}
            <div>&nbsp;</div>
            <div><Icon name="paper plane" color="red"></Icon><a href="https://docs.google.com/document/d/1Ig15zUygy85cNyPTg7_VYjW7WcgasvijmXGiNDjZssA/edit?usp=sharing" target="_blank">TA-Bot Patch Notes!</a></div>
            </Grid.Column>
            </Grid>
        </div>
    );
}

export default UploadPage;
