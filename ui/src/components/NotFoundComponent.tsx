import { Component } from 'react';
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { Grid } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';

class NotFoundComponent extends Component {
    render(){
        return (<div>
            <Helmet>
                <title>404 Error | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign="middle" >
            <Grid.Column style={{ maxWidth: 600 }}>
            <img src="https://i.ytimg.com/vi/AY-rnBoaiY8/maxresdefault.jpg" alt="Sad robot" height="200px" width="300px"></img>
                <h1>We're sorry. AutoTA failed this test.</h1>
                <p>Sorry we couldn't find the page you were looking for.</p>
                <p>Perhaps you can return back to the homepage and see if you can find what you're looking for.  If you believe this is a mistake, please contact us.</p>
            </Grid.Column>
            </Grid>
        </div>)
    }
}

export default NotFoundComponent