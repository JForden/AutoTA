import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment, Dimmer, Header, Icon } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
import React from 'react'
import { Progress, SemanticCOLORS } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

interface UploadPageState {
    file?: File,
    submissions_used: number,
    color: SemanticCOLORS,
    isLoading:boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    maxSubmissions: number,
    end: string
}
 
class UploadPage extends Component<{}, UploadPageState> {

    constructor(props: any){
        super(props);

        this.state = {
            submissions_used: 0,
            color: 'grey',
            isLoading: false,
            error_message: '',
            isErrorMessageHidden: true,
            project_name: "",
            project_id: 0,
            maxSubmissions: 0,
            end: ""
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
                submissions_used: res.data.submissions_remaining,
                project_name: res.data.name,
                end: res.data.end,
                project_id: res.data.Id,
                maxSubmissions: res.data.max_submissions
            });

            if(this.state.submissions_used > 0.5 * this.state.maxSubmissions && this.state.submissions_used <= 0.75 * this.state.maxSubmissions){
                this.setState({color: 'orange'});
            }
            if(this.state.submissions_used > 0.75 * this.state.maxSubmissions){
                this.setState({color: 'red'});
            }   
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
    handleColorChange(){  
        if(this.state.submissions_used > 0.5 * this.state.maxSubmissions && this.state.submissions_used <= 0.75 * this.state.maxSubmissions){
            this.setState({color: 'orange'});
        }
        if(this.state.submissions_used > 0.75 * this.state.maxSubmissions){
            this.setState({color: 'red'});
        }  
        return this.state.color;
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
            <MenuComponent showUpload={true} showHelp={false} showCreate={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Form loading={this.state.isLoading} size='large' onSubmit={this.handleSubmit} disabled={true}>
                <Dimmer.Dimmable dimmed={true}>
                <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={this.handleFileChange} />
                <Button type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                </Segment>
                <Dimmer active={this.state.project_id === -1}>
                    <Header as='h2' icon inverted>
                    <Icon name='ban' />
                    No active project
                    </Header>
                </Dimmer>
                </Dimmer.Dimmable>
            </Form>
            <ErrorMessage message={this.state.error_message} isHidden={this.state.isErrorMessageHidden} ></ErrorMessage>
            <div hidden={this.state.project_id === -1}>
                <Progress progress='ratio' value={this.state.submissions_used} total={this.state.maxSubmissions} color={this.state.color} />
                {(() => {
                    if(this.state.submissions_used > 0) {
                        return <Link to="/code">Go to last submission results</Link>
                    }
                    return <></>
                })()}
            </div>
            <br />
            <a href="https://drive.google.com/file/d/16TM4u3d2t1kqiVxDLakg_1nPVNqhNsbe/view?usp=sharing">Current Assignment Description</a>
            </Grid.Column>
            </Grid>
        </div>
        );
  }
}

export default UploadPage;
