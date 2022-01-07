import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import AdminSettingsPageComponent from '../components/AdminSettingsPageComponent';
import { Helmet } from 'react-helmet';

class AdminSettingsPage extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Projects | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={true} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
            <Grid className="main-grid">
                <AdminSettingsPageComponent></AdminSettingsPageComponent>
            </Grid>
        </div>
        );
  }
}

export default AdminSettingsPage;