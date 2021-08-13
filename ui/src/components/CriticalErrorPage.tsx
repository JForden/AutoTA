import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Grid } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';

class CriticalErrorPage extends Component {
    render(){
        return (<div>
            <MenuComponent showUpload={false} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign="middle" >
            <Grid.Column style={{ maxWidth: 600 }}>
            <img src="https://i.ytimg.com/vi/AY-rnBoaiY8/maxresdefault.jpg" alt="Sad robot" height="200px" width="300px"></img>
                <h1>We're sorry. AutoTA failed this test.</h1>
                <p>A critical error occured when rendering the page.</p>
                <p>If this continues to occur, please contact us.</p>
            </Grid.Column>
            </Grid>
        </div>)
    }
}

export default CriticalErrorPage