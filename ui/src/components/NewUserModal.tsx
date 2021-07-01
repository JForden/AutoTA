import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Form, Modal } from 'semantic-ui-react'
import axios from 'axios';
import * as React from "react";


interface NewUserModalProps {
    username: string,
    password: string,
    isOpen: boolean
}

interface NewUserModalState{
    FirstName: string,
    LastName: string,
    StudentNumber: string,
    Email: string,
    ClassName:string,
    ClassNumber:string,
    isOpen: boolean
}


const Coptions = [
    { key: 1, text: '1010', value: 1010 },
]

const Loptions = [
    { key: 1, text: '401', value: 401 },
    { key: 2, text: '402', value: 402 },
    { key: 3, text: '403', value: 403 },
    { key: 4, text: '404', value: 404 },
    { key: 5, text: '405', value: 405 },
]

class NewUserModal extends Component<NewUserModalProps, NewUserModalState> {

    constructor(props: any){
        super(props);
    
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleStudentNumberChange = this.handleStudentNumberChange.bind(this);
        this.handleClassNameChange = this.handleClassNameChange.bind(this);
        this.handleClassNumberChange = this.handleClassNumberChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
      }

    handleFirstNameChange(ev: React.ChangeEvent<HTMLInputElement>){
        this.setState({ FirstName: ev.target.value});
    }
    handleLastNameChange(ev: React.ChangeEvent<HTMLInputElement>){
        this.setState({ LastName: ev.target.value});
    }
    handleEmailChange(ev: React.ChangeEvent<HTMLInputElement>){
        this.setState({ Email: ev.target.value});
    }
    handleStudentNumberChange(ev: React.ChangeEvent<HTMLInputElement>){
        this.setState({ StudentNumber: ev.target.value});
    }
    handleClassNameChange(ev: string){
        this.setState({ ClassName: ev});
    }
    handleClassNumberChange(ev: string){
        this.setState({ ClassNumber: ev});
    }
    
    handleClick(){
        axios.post(process.env.REACT_APP_BASE_API_URL + `/auth/create`, { password: this.props.password, username: this.props.username, fname: this.state.FirstName, lname: this.state.LastName, id: this.state.StudentNumber, email: this.state.Email, class_name: this.state.ClassName, lab_number: this.state.ClassNumber })
        .then(res => {    
            localStorage.setItem("AUTOTA_AUTH_TOKEN", res.data.access_token);
            window.location.href = "/upload";   
        })
        .catch(err => {
            console.log(err);
        });
    }

  render() {
    return (
        <Modal open={this.props.isOpen}>
            <Modal.Header>New User Registration</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input fluid label='First name' placeholder='First name' onChange={this.handleFirstNameChange} />
                        <Form.Input fluid label='Last name' placeholder='Last name' onChange={this.handleLastNameChange} />
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Input fluid label='School ID' placeholder='001234567' onChange={this.handleStudentNumberChange} />
                        <Form.Input fluid label='School Email' placeholder='first.last@marquette.edu' onChange={this.handleEmailChange} />
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Select fluid label='Class Name' options={Coptions} placeholder='Class' onChange={e => this.handleClassNameChange(e.currentTarget.nodeValue || "")} />
                        <Form.Select fluid label='Lab Number' options={Loptions} placeholder='Class' onChange={e => this.handleClassNumberChange(e.currentTarget.nodeValue || "")}  />
                    </Form.Group>

                    <Form.Button type="submit" onClick={this.handleClick}>Submit</Form.Button>
                </Form>
            </Modal.Content>
        </Modal>
    );
  }
}

export default NewUserModal;
