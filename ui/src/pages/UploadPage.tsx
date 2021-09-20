import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment, Dimmer, Header, Icon } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
import React from 'react'
import { SemanticCOLORS } from 'semantic-ui-react'
import ErrorMessage from '../components/ErrorMessage';
import Countdown from 'react-countdown';

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
    is_allowed_to_submit: boolean
}
 
class UploadPage extends Component<{}, UploadPageState> {

    constructor(props: any){
        super(props);
        this.state = {
            color: 'grey',
            isLoading: false,
            error_message: '',
            isErrorMessageHidden: true,
            project_name: "",
            project_id: 0,
            end: "",
            canRedeem: false,
            points:0,
            time_until_next_submission: "",
            is_allowed_to_submit: true
        };
    
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/submissioncounter`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            this.setState({
                project_name: res.data.name,
                end: res.data.end,
                project_id: res.data.Id,
                canRedeem: res.data.can_redeem,
                points: res.data.points,
                time_until_next_submission: res.data.time_until_next_submission,
                is_allowed_to_submit: new Date() > new Date(res.data.time_until_next_submission)
            });
        })
        .catch(err => {
            this.setState({ error_message: err.response.data.message});
            this.setState({ isErrorMessageHidden: false, isLoading: false });
        });
    }

    // On file select (from the pop up)
    handleFileChange(event : React.FormEvent) {
    
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if(files != null && files.length === 1){
            // Update the state
            this.setState({ file: files[0] });
        } else {
            this.setState({ file: undefined });
        }
      
    }; 
    handleRedeem(){
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/extraday`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {            
            alert("You have now recieved an extra day of unlimited submissions!  Instead of the regular 45 minutes coolday this Wednesday, you'll only have a 5 minute cooldown between submissions!");
            window.location.reload();
        })
    }

    onTimerFinish(){
        window.location.reload();
    }

    handleSubmit() {
        if (this.state.file !== undefined) {
            this.setState({ isErrorMessageHidden: true });
            this.setState({isLoading: true});
            // Create an object of formData
            const formData = new FormData();
        
            // Update the formData object
            formData.append(
                "file",
                this.state.file,
                this.state.file.name
            );
            
            // Request made to the backend api
            // Send formData object
            axios.post(process.env.REACT_APP_BASE_API_URL + `/upload/`, formData,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
              })
            .then(res => {
                window.location.href = "/code";
            })
            .catch(err => {
                this.setState({ error_message: err.response.data.message});
                this.setState({ isErrorMessageHidden: false, isLoading: false });
            })
        }
    }
    
    render() {
        return (
        <div>
            <MenuComponent showUpload={true} showHelp={false} showCreate={false} showLast={true}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Form loading={this.state.isLoading} size='large' onSubmit={this.handleSubmit} disabled={true}>
                <Dimmer.Dimmable dimmed={true}>
                <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={this.handleFileChange} />
                <Button disabled={!this.state.is_allowed_to_submit} type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                <br></br>
                </Segment>
                <Dimmer active={this.state.project_id === -1}>
                    <Header as='h2' icon inverted>
                    <Icon name='ban' />
                    No active project
                    </Header>
                </Dimmer>
                </Dimmer.Dimmable>
                {(() => {
                    if(this.state.project_id !== -1 && !this.state.is_allowed_to_submit){
                        return (<><Icon name="clock outline"></Icon><Countdown date={new Date(this.state.time_until_next_submission)} onComplete={this.onTimerFinish} /></>);
                    } else {
                        return (<></>)
                    }
                })()}
            </Form>
            <ErrorMessage message={this.state.error_message} isHidden={this.state.isErrorMessageHidden} ></ErrorMessage>
            <Button
            basic
            color='blue'
            content='Score on last assignment'
            icon='gem'
            label={{
                as: 'a',
                basic: true,
                color: 'blue',
                pointing: 'left',
                content: this.state.points,
            }}
            />
            <br /> <br />
            <Button disabled={!this.state.canRedeem} type="submit" color='yellow' fluid size='small' onClick={this.handleRedeem}>
                Use Extra Day (Score must be above 70)
            </Button>
            </Grid.Column>
            </Grid>
        </div>
        );
  }
}

export default UploadPage;
