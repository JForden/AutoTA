import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import mscsimg from '../MUCS-tag.png'
import axios from 'axios';
import ErrorMessage from '../components/ErrorMessage';
import { Redirect } from 'react-router-dom'
import { Button, Form, Grid, Header, Message, Image, Segment } from 'semantic-ui-react'

interface LoginPageState {
  isLoggedIn: boolean,
  isErrorMessageHidden: boolean,
  username: string,
  password: string
}

class Login extends Component<{}, LoginPageState> {

  constructor(props: any){
    super(props);

    this.state = {
      isLoggedIn: localStorage.getItem("AUTOTA_AUTH_TOKEN") != null,
      isErrorMessageHidden: true,
      username: '',
      password: ''
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
    axios.post(process.env.REACT_APP_BASE_API_URL + `/auth/login`, { password: this.state.password, username: this.state.username })
    .then(res => {
      this.setState({ isErrorMessageHidden: true });
      localStorage.setItem("AUTOTA_AUTH_TOKEN", "1");
      this.setState({ isLoggedIn: true })
    })
    .catch(err => {
      this.setState({ isErrorMessageHidden: false });
    })
  }

  render() {
    if (this.state.isLoggedIn){
      return ( <Redirect to={{pathname: '/home'}}/> );
    }

    return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 400 }}>
      <Header as='h2' color='blue' textAlign='center'>
        Login to your MSCSNet account
      </Header>
      <Form size='large' onSubmit={this.handleSubmit}>
        <Segment stacked>
          <Form.Input fluid icon='user' iconPosition='left' required placeholder='Username' onChange={this.handleUsernameChange} />
          <Form.Input fluid icon='lock' iconPosition='left' required placeholder='Password' type='password' onChange={this.handlePasswordChange} />

          <Button type="submit" color='blue' fluid size='large'>
            Login
          </Button>
        </Segment>
      </Form>
      <ErrorMessage message="Invalid username or password!  Please try again!" isHidden={this.state.isErrorMessageHidden} ></ErrorMessage>
      <Message>
        Forgot your MSCSNet login? Click <a href='#'>here</a>.
      </Message>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
        <Image style={{ width: '100px' }} src={mscsimg} /> 
      </div>
    </Grid.Column>
  </Grid>
    );
  }
}

export default Login;
