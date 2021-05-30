import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import SplitPane from 'react-split-pane';
import {
    Container,
    Image,
    Menu,
  } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';

class CodePage extends Component {
  render() {
    return (
        <div>
            <Menu fixed='top' inverted>
                <Container>
                    <Menu.Item as='a' header>
                        <Image size='mini' src='/logo.png' style={{ marginRight: '1.5em' }} />
                        AutoTA
                    </Menu.Item>
                    <Menu.Item as='a'>Home</Menu.Item>
                </Container>
            </Menu>
            <div>
                <div className="topp">
                    <SplitPane split="vertical" defaultSize={957}>
                        <div><CodeComponent></CodeComponent></div>
                        <div>Lint Stuff</div>
                    </SplitPane>
                </div>
                <div className="bottom">
                    <SplitPane split="vertical" defaultSize={957}>
                        <div>Test Cases</div>
                        <div>Possible Output</div>
                    </SplitPane>
                </div>
            </div>
        </div>
    );
  }
}

export default CodePage;
