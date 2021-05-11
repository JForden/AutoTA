import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Form, Grid, Input, Step, Icon, Card, Button } from 'semantic-ui-react';
import '../css/FirstLogin.scss';

class FirstLoginPage extends Component {
  render() {
    return (
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 800 }}>
          <h1>Welcome Alexander Gebhard!</h1>
          <Form size='large'>
                <Card className="firstLoginCard">
                    <Card.Content header='MSCS Database Information' />
                    <Card.Content description="If any of this information is incorrect, please contact the Systems Administrator." />
                    <Card.Content>
                        <Form.Field>
                            <label htmlFor="firstname">
                                First name:
                            </label>
                            <Input className="firstLoginInputs" id="firstname" disabled value="Alexander" />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="lastname">
                                Last name:
                            </label>
                            <Input className="firstLoginInputs" id="lastname" disabled value="Gebhard" />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="studentid">
                                Student ID:
                            </label>
                            <Input className="firstLoginInputs" id="studentid" disabled value="006147884" />
                        </Form.Field>
                    </Card.Content>
                </Card>
                <Form.Field>
                    <label htmlFor="email">
                        Email:
                    </label>
                    <Input type="email" className="firstLoginInputs" id="email" required placeholder="first.last@marquette.edu" label={{ icon: 'asterisk' }} labelPosition='right corner' />
                </Form.Field>
                <Button type="submit" color='blue' fluid size='large'>
                    Next &gt;
                </Button>
            </Form>
            <Step.Group>
                <Step active>
                <Icon name='address card outline' />
                <Step.Content>
                    <Step.Title>User Information</Step.Title>
                    <Step.Description>Enter basic user information</Step.Description>
                </Step.Content>
                </Step>

                <Step>
                <Icon name='users' />
                <Step.Content>
                    <Step.Title>Classes</Step.Title>
                    <Step.Description>Select classes enrolled in</Step.Description>
                </Step.Content>
                </Step>

                <Step disabled>
                <Icon name='thumbs up outline' />
                <Step.Content>
                    <Step.Title>Get Started!</Step.Title>
                </Step.Content>
                </Step>
            </Step.Group>
        </Grid.Column>
      </Grid>
        );
    }
}

export default FirstLoginPage;
