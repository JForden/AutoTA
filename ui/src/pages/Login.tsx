import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import mscsimg from '../MUCS-tag.png'
import axios from 'axios';
import ErrorMessage from '../components/ErrorMessage';
import NewUserModal from '../components/NewUserModal';
import { Redirect } from 'react-router-dom'
import { Button, Form, Grid, Header, Message, Image, Segment } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';

interface LoginPageState {
  isLoggedIn: boolean,
  isErrorMessageHidden: boolean,
  isNewUser: boolean,
  username: string,
  password: string,
  role: number,
  error_message: string,
  isLoading: boolean
}

class Login extends Component<{}, LoginPageState> {

  constructor(props: any) {
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

  handleUsernameChange(ev: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: ev.target.value });
  }

  handlePasswordChange(ev: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: ev.target.value });
  }

  handleSubmit() {
    console.log("Handle submit");
    console.log(process.env.REACT_APP_BASE_API_URL);
    this.setState({ isErrorMessageHidden: true, isLoading: true });
    console.log(process.env.REACT_APP_BASE_API_URL + `/auth/login`);
    axios.post(process.env.REACT_APP_BASE_API_URL + `/auth/login`, { password: this.state.password, username: this.state.username })
      .then(res => {
        localStorage.setItem("AUTOTA_AUTH_TOKEN", res.data.access_token);
        if (res.data.message === "New User") {
          this.setState({ isNewUser: true })
        } else {
          this.setState({ isLoggedIn: true })
          this.setState({ role: res.data.role })
        }
      })
      .catch(err => {
        var msg = ""
        if (err.response && err.response.data.message) {
          msg = err.response.data.message
        }
        this.setState({ error_message: msg })
        this.setState({ isErrorMessageHidden: false, isLoading: false });
      })
  }

  render() {
    if (this.state.isLoggedIn && this.state.role === 0) {
      return (<Redirect to={{ pathname: '/class/classes' }} />);
    }
    if (this.state.isLoggedIn && this.state.role === 1) {
      return (<Redirect to={{ pathname: '/admin/classes' }} />);
    }
    if (this.state.isLoggedIn && this.state.role === 2) {
      return (<Redirect to={{ pathname: '/admin/TaLanding' }} />);
    }
    return (
      <div>
        <Helmet>
          <title>Login | TA-Bot</title>
        </Helmet>
        <NewUserModal username={this.state.username} password={this.state.password} isOpen={this.state.isNewUser}></NewUserModal>
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
              Create an account <a href='https://drive.google.com/file/d/1VlA4wRcizy4VpFZuMQQ0V9Fnmq-l5vcm/view?usp=sharing' target="_blank" rel="noreferrer">here</a>.
            </Message>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Image style={{ width: '100px' }} src={mscsimg} />
            </div>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Login;
