import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
import React from 'react'
import { Progress, SemanticCOLORS } from 'semantic-ui-react'
import { Link } from 'react-router-dom';

interface UploadPageState {
    file?: File,
    int: number,
    color: SemanticCOLORS,
    isLoading:boolean
}
 

class UploadPage extends Component<{}, UploadPageState> {

    constructor(props: any){
        super(props);

        this.state = {
            int: 0,
            color: 'grey',
            isLoading: false
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
            this.setState({int: res.data });
            if(this.state.int>10 && this.state.int <=13){
                this.setState({color: 'orange'});
            }
            if(this.state.int>13){
                this.setState({color: 'red'});
            }   
        })
        .catch(err => {
            console.log(err);
        });
    }

    // On file select (from the pop up)
    handleFileChange(event : React.FormEvent) {
    
        const target = event.target as HTMLInputElement;
        const files = target.files;

        console.log(files)
        if(files != null && files.length === 1){
            console.log(files[0].name);
            // Update the state
            this.setState({ file: files[0] });
        } else {
            this.setState({ file: undefined });
        }
      
    };
    handleColorChange(){  
        if(this.state.int>10 && this.state.int <13){
            this.setState({color: 'orange'});
        }
        if(this.state.int>13){
            this.setState({color: 'red'});
        }   
        return this.state.color;
    }

    handleSubmit() {
        if (this.state.file !== undefined) {
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
                alert("Error in file submission");
            })
        }
    }
    

    render() {
        return (
        <div>
            <MenuComponent showUpload={true} showHelp={false} showCreate={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Form loading={this.state.isLoading} size='large' onSubmit={this.handleSubmit}>
                <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={this.handleFileChange} />
                <Button type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                </Segment>
            </Form>
            <Progress progress='value' value={this.state.int} total={15} color={this.state.color} />
            {(() => {
                if(this.state.int > 0) {
                    return <Link to="/code">Go to last submission results</Link>
                }

                return <></>
            })()}
            <h5>Total submissions for this assignment: 15</h5>
            </Grid.Column>
            </Grid>
        </div>
        );
  }
}

export default UploadPage;
