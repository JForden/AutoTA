import { Component } from 'react';
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { Grid, Progress } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import axios from 'axios';


interface AdminAnalyticsProps {
    id: string,
}



class AdminAnalyticsComponent extends Component<AdminAnalyticsProps> {
    state = {
        totalNumber: null,
        uniqueSubmissions: null
    };

    componentDidMount() {
        let project_id = this.props.id;
        console.log("this is project id", project_id);
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/getUniqueSubmissions?id=${project_id}`, {
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
          }
      })
          .then((res) => {
            let data = res.data.data;
            console.log(data[0]);
            this.setState({uniqueSubmissions: data[0]});
            this.setState({totalNumber: data[1]});
          })
          .catch((err) => {
            console.log(err);
          });
      }
    render() {
      return (
        <div>
          <Helmet>
            <title>404 Error | TA-Bot</title>
          </Helmet>
          <MenuComponent showAdminUpload={false} showUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
          
          {/* Center the progress bar */}
          <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign="middle">
            <Grid.Column style={{ maxWidth: 600 }}>
              <h2>Percent Total Student Submissions</h2>
              <Progress 
                value={this.state.uniqueSubmissions || 0} 
                total={this.state.totalNumber || 1} 
                progress='ratio' 
                indicating 
              />
            </Grid.Column>
          </Grid>

          <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign="middle">
            <Grid.Column style={{ maxWidth: 600 }}>
              <img src="https://i.ytimg.com/vi/AY-rnBoaiY8/maxresdefault.jpg" alt="Sad robot" height="200px" width="300px"></img>
              <h1>We're sorry. AutoTA failed this test.</h1>
              <p>Sorry we couldn't find the page you were looking for.</p>
              <p>Perhaps you can return back to the homepage and see if you can find what you're looking for.  If you believe this is a mistake, please contact us.</p>
            </Grid.Column>
          </Grid>
        </div>
      );
    }
}

export default AdminAnalyticsComponent