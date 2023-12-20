import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import '../css/AdminComponent.scss'
import { Helmet } from 'react-helmet';
import AdminAnalyticsComponent from '../components/AdminAnalyticsComponent';

class ProjectAnalytics extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Project Analytics | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} ></MenuComponent>
            <Grid className="main-grid">
                <AdminAnalyticsComponent></AdminAnalyticsComponent>
            </Grid>
        </div>
        );
  }
}

export default ProjectAnalytics;