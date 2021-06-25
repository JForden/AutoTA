import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Grid, Header, Icon, Form, Step, Button } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';

class FirstLogin extends Component {
  render() {
    return (
        <div>
            <MenuComponent showUpload={false} showHelp={false} showCreate={false}></MenuComponent>
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column textAlign="center" width="4">
                <Grid.Row>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='user' circular />
                    <Header.Content>Please enter your user information</Header.Content>
                </Header>

                <Form>
                    <Form.Group widths='equal'>
                        <p style={{textAlign: 'center', width: '100%'}}><b>Class: </b>COSC 1010-101: Introduction to Software Development</p>
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Input fluid label='First name' placeholder='First name' />
                        <Form.Input fluid label='Last name' placeholder='Last name' />
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Input fluid label='School ID' placeholder='001234567' />
                        <Form.Input fluid label='School Email' placeholder='first.last@marquette.edu' />
                    </Form.Group>
                    <Form.Button type="submit">Submit</Form.Button>
                </Form>
                </Grid.Row>
                </Grid.Column>

                <Grid.Row>
                <Step.Group>
                    <Step>
                    <Icon name='pencil' />
                    <Step.Content>
                        <Step.Title>Class Selection</Step.Title>
                        <Step.Description>Choose your class</Step.Description>
                    </Step.Content>
                    </Step>

                    <Step active>
                    <Icon name='user' />
                    <Step.Content>
                        <Step.Title>User Information</Step.Title>
                        <Step.Description>Enter user information</Step.Description>
                    </Step.Content>
                    </Step>

                    <Step>
                    <Icon name='check' />
                    <Step.Content>
                        <Step.Title>Get Started!</Step.Title>
                    </Step.Content>
                    </Step>
                </Step.Group>
            </Grid.Row>
            </Grid>
        </div>
    );
  }
}

export default FirstLogin;
