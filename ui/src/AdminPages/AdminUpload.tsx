import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import AdminComponent from '../components/AdminComponent';
import '../css/AdminComponent.scss'
import { Helmet } from 'react-helmet';
import AdminUploadPage from '../components/AdminUploadPage';

class AdminUpload extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Student Upload | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showAdminUpload={true} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle' className="main-grid">
                <AdminUploadPage></AdminUploadPage> 
            </Grid>
        </div>
        );
  }
}

export default AdminUpload;