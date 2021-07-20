import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import mscsimg from '../MUCS-tag.png'
import axios from 'axios';
import ErrorMessage from '../components/ErrorMessage';
import NewUserModal from '../components/NewUserModal';
import { Redirect } from 'react-router-dom'
import { Button, Form, Grid, Header, Message, Image, Segment } from 'semantic-ui-react'

interface LoginPageState {
  isLoggedIn: boolean,
  isErrorMessageHidden: boolean,
  isNewUser: boolean,
  username: string,
  password: string,
  role: number,
  error_message:string,
  isLoading: boolean
}

class Login extends Component<{}, LoginPageState> {

  constructor(props: any){
    super(props);

    this.state = {
      isLoggedIn: localStorage.getItem("AUTOTA_AUTH_TOKEN") != null,
      isErrorMessageHidden: true,
      username: '',
      password: '',
      role: -1,
      isNewUser: false,
      error_message: '',
      isLoading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  handleUsernameChange(ev: React.ChangeEvent<HTMLInputElement>){
    this.setState({ username: ev.target.value});
  }

  handlePasswordChange(ev: React.ChangeEvent<HTMLInputElement>){
    this.setState({ password: ev.target.value});
  }

  handleSubmit() {
    this.setState({ isErrorMessageHidden: true, isLoading: true });
    axios.post(process.env.REACT_APP_BASE_API_URL + `/auth/login`, { password: this.state.password, username: this.state.username })
    .then(res => {
      localStorage.setItem("AUTOTA_AUTH_TOKEN", res.data.access_token);
      if(res.data.message === "New User"){
        this.setState({isNewUser: true})
      } else {
          this.setState({ isLoggedIn: true })
          this.setState({ role: res.data.role })
      }
    })
    .catch(err => {
        this.setState({ error_message: err.response.data.message})
        this.setState({ isErrorMessageHidden: false, isLoading: false });
    })
  }

  render() {
    if (this.state.isLoggedIn && this.state.role === 0 ){
      return ( <Redirect to={{pathname: '/upload'}}/> );
    }
    if (this.state.isLoggedIn && this.state.role === 1 ){
      return ( <Redirect to={{pathname: '/admin/projects'}}/> );
    }
    return (
        <div>    <NewUserModal username={this.state.username} password={this.state.password} isOpen={this.state.isNewUser}></NewUserModal>
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 400 }}>
            <Header as='h2' color='blue' textAlign='center'>
                Login to your MSCSNet account
            </Header>
            <Form loading={this.state.isLoading} size='large' onSubmit={this.handleSubmit}>
                <Segment stacked>
                <Form.Input fluid icon='user' iconPosition='left' required placeholder='Username' onChange={this.handleUsernameChange} />
                <Form.Input fluid icon='lock' iconPosition='left' required placeholder='Password' type='password' onChange={this.handlePasswordChange} />

                <Button type="submit" color='blue' fluid size='large'>
                    Login
                </Button>
                </Segment>
            </Form>
            <ErrorMessage message={this.state.error_message} isHidden={this.state.isErrorMessageHidden} ></ErrorMessage>
            <Message>
                Forgot your MSCSNet login? Click <a href='https://drive.google.com/file/d/1ajBMt9WF104gSbsNOPKJDI1OAGTfDEi8/view?usp=sharing' target="_blank" rel="noreferrer">here</a>.
            </Message>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                <Image style={{ width: '100px' }} src={mscsimg} /> 
            </div>
            </Grid.Column>
        </Grid>
    </div>
    );
  }
}

export default Login;
