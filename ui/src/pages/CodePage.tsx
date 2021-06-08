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
import Split from 'react-split'
import TestResultsComponent from '../components/TestResultsComponent';
import DescriptionComponent from '../components/DescriptionComponent';
import { StyledIcon } from '../styled-components/StyledIcon';

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
                    <Menu.Item as='a'>Home</Menu.Item>
                    <Menu.Item as='a'><StyledIcon name='upload'/>23</Menu.Item>
                </Container>
            </Menu>
            <Grid>
                <Grid.Column>
                    <Grid.Row width={16} className="top-row full-height">
                        <div className="full-height">
                            <Split className="split">
                                <div id="code-container"><CodeComponent></CodeComponent></div>
                                <div>Lint Stuff</div>
                            </Split>
                        </div>
                    </Grid.Row>

                    <Grid.Row width={16}>
                        <div className="bottom">
                            <Split className="split">
                                <div id="code-container"><TestResultsComponent></TestResultsComponent></div>
                                <div><DescriptionComponent></DescriptionComponent></div>
                            </Split>
                        </div>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        </div>
    );
  }
}

export default CodePage;
