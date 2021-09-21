import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import AdminComponent from '../components/AdminComponent';
import '../css/AdminComponent.scss'
import { Helmet } from 'react-helmet';

class AdminLanding extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Projects | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
            <Grid className="main-grid">
                <AdminComponent></AdminComponent>
            </Grid>
        </div>
        );
  }
}

export default AdminLanding;