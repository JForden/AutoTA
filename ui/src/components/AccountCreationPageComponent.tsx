import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Button, Form, Grid, Header, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';


class AdminComponent extends Component  {
    state = { password: '', email: '', checkpassword: '', submittedName: '', submittedEmail: '' }

    handleChange = (e: any, { name, value }: any) => this.setState({ [name]: value })

    handleSubmit = () => {
        const { email, password, checkpassword } = this.state
        this.setState({ submittedName: password, submittedEmail: email })
      }

    componentDidMount() {
        
    }

    render() {
        const { password, email, checkpassword, submittedName, submittedEmail } = this.state;
        
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Grid textAlign='center' style={{ maxWidth: 800 }}>
              <Grid.Column>
                <Header as='h2' color='blue' textAlign='center'>
                  Create TA-BOT Account
                </Header>
                <Form onSubmit={this.handleSubmit}>
                  <Segment>
                    <Form.Input
                      fluid 
                      icon='user' 
                      iconPosition='left'
                      placeholder='email'
                      name='email'
                      value={email}
                      onChange={this.handleChange}
                      style={{ width: '100%' }}
                    />
                    <Form.Input
                      fluid 
                      placeholder='password'
                      icon='lock' 
                      iconPosition='left'
                      name='password'
                      value={password}
                      onChange={this.handleChange}
                      style={{ width: '100%' }}
                    />
                    <Form.Input
                      fluid 
                      placeholder='retype password'
                      icon='lock' 
                      iconPosition='left'
                      name='checkpassword'
                      value={checkpassword}
                      onChange={this.handleChange}
                      style={{ width: '100%' }}
                    />
                    <Form.Button type="submit" color="blue" fluid size="large" content='Submit' style={{ marginTop: '20px' }} />
                  </Segment>
                </Form>
              </Grid.Column>
            </Grid>
          </div>
        )
      }
      
    
}

export default AdminComponent;