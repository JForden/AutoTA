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
            <Grid>
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
                <Step.Group ordered>
                <Step completed>
                <Step.Content>
                    <Step.Title>Shipping</Step.Title>
                    <Step.Description>Choose your shipping options</Step.Description>
                </Step.Content>
                </Step>

                <Step completed>
                <Step.Content>
                    <Step.Title>Billing</Step.Title>
                    <Step.Description>Enter billing information</Step.Description>
                </Step.Content>
                </Step>

                <Step active>
                <Step.Content>
                    <Step.Title>Confirm Order</Step.Title>
                </Step.Content>
                </Step>
            </Step.Group>
            </Grid>
        </div>
    );
  }
}

export default FirstLogin;
