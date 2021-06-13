import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import {
    Container,
    Image,
    Menu,
    Grid
  } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';

class CodePage extends Component {
  render() {
    return (
        <div id="code-page">
            <Menu fixed='top' inverted>
                <Container>
                    <Menu.Item as='a' header>
                        <Image size='mini' src='/AutoTaPH.png' style={{ marginRight: '1.5em' }} />
                        AutoTA
                    </Menu.Item>
                    <Menu.Item><a href="/upload" >Upload</a></Menu.Item>
                </Container>
            </Menu>
            <Grid>
                <Grid.Column>
                    <Grid.Row width={16} className="top-row full-height">
                        <CodeComponent></CodeComponent>
                    </Grid.Row>

                    <Grid.Row width={16}>
                        <TestResultsComponent></TestResultsComponent>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        </div>
    );
  }
}

export default CodePage;
