import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import '../css/AdminComponent.scss'
import { Helmet } from 'react-helmet';
import AdminComponent from '../components/AdminComponent';
import { Route, RouteComponentProps } from 'react-router-dom';

interface AdminProjectProps extends RouteComponentProps<{ id: string }> {}

class AdminProject extends Component<AdminProjectProps, {}> {

    render() {
        return (
        <div>
            <div>hi</div>
            <Helmet>
                <title>[Admin] Projects | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={true} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} ></MenuComponent>
            <Grid className="main-grid">
            <Route path="/admin/projects/:id" component={AdminComponent} />
            </Grid>
        </div>
        );
  }
}

export default AdminProject;