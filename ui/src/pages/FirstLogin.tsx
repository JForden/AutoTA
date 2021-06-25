import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Grid, Header, Icon, Form, Step } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';

class FirstLogin extends Component {
  render() {
    return (
        <div>
            <MenuComponent showUpload={false} showHelp={false} showCreate={false}></MenuComponent>
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Row>
                <Grid.Column textAlign="center">
                <Header as='h2' icon textAlign='center'>
                    <Icon name='users' circular />
                    <Header.Content>Please enter your class code</Header.Content>
                </Header>

                <Form>
                    <Form.Group widths='4'>
                        <Form.Input fluid id='form-subcomponent-shorthand-input-first-name' placeholder='Class Code' />
                    </Form.Group>
                </Form>
                </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                <Step.Group>
                    <Step active>
                    <Icon name='pencil' />
                    <Step.Content>
                        <Step.Title>Class Selection</Step.Title>
                        <Step.Description>Choose your class</Step.Description>
                    </Step.Content>
                    </Step>

                    <Step>
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
