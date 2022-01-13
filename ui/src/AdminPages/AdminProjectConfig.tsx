import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import AdminProjectConfigComponent from '../components/AdminProjectConfigComponent';
import { Helmet } from 'react-helmet';

class AdminProjectConfig extends Component<{}, {}> {

    render() {
        return (
        <div style={{height: "100%"}}>
            <Helmet>
                <title>[Admin] Projects | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={true} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
            <div style={{height: "100%"}} className="main-grid">
                <AdminProjectConfigComponent></AdminProjectConfigComponent>
            </div>
        </div>
        );
  }
}

export default AdminProjectConfig;