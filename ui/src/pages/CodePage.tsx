import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import SplitPane from 'react-split-pane';
import {
    Container,
    Image,
    Menu,
    Grid
  } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';
import Split from 'react-split'

class CodePage extends Component {
  render() {
    return (
        <div id="code-page">
            <Menu fixed='top' inverted>
                <Container>
                    <Menu.Item as='a' header>
                        <Image size='mini' src='/logo.png' style={{ marginRight: '1.5em' }} />
                        AutoTA
                    </Menu.Item>
                    <Menu.Item as='a'>Home</Menu.Item>
                </Container>
            </Menu>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <div className="topp">
                            <Split className="split">
                                <div id="code-container"><CodeComponent></CodeComponent></div>
                                <div>Lint Stuff</div>
                            </Split>
                        </div>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width={16}>
                        <div className="bottom">
                            <Split className="split">
                                <div id="code-container">Test Cases</div>
                                <div>Lint Stuff</div>
                            </Split>
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
  }
}

export default CodePage;
