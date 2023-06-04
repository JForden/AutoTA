import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import '../css/AdminComponent.scss'
import { Helmet } from 'react-helmet';
import AdminLandingComponent from '../components/AdminLandingComponent';

class AdminLanding extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Projects | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} ></MenuComponent>
            <Grid className="main-grid">
                <AdminLandingComponent></AdminLandingComponent>
            </Grid>
        </div>
        );
  }
}

export default AdminLanding;