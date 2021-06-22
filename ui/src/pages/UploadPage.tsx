import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
interface UploadPageState {
    file?: File
  }

class UploadPage extends Component<{}, UploadPageState> {

    constructor(props: any){
        super(props);
    
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
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

    handleSubmit() {
        if (this.state.file !== undefined) {
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
            <MenuComponent showUpload={true}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Form size='large' onSubmit={this.handleSubmit}>
                <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={this.handleFileChange} />
                <Button type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                </Segment>
            </Form>
            </Grid.Column>
            </Grid>
        </div>
        );
  }
}

export default UploadPage;
