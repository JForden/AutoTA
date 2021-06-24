import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../css/CodePage.scss';
import { Grid } from 'semantic-ui-react'
import CodeComponent from '../components/CodeComponent';
import TestResultsComponent from '../components/TestResultsComponent';
import MenuComponent from '../components/MenuComponent';

class CodePage extends Component {
  render() {
    return (
        <div id="code-page">
            <MenuComponent showUpload={true} showHelp={true} showCreate={false}></MenuComponent>
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
