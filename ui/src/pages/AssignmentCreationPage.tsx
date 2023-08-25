import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Redirect } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import MenuComponent from '../components/MenuComponent';
import ClassSelectionPageComponent from '../components/ClassSelectionPageComponent';

class AssignmentCreationPage extends Component {
    render() {
        return (
            <div id="code-page">
                <Helmet>
                    <title>Select A Class | TA-Bot</title>
                </Helmet>
                <MenuComponent showUpload={true} showAdminUpload={false} showHelp={true} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
                <ClassSelectionPageComponent></ClassSelectionPageComponent>
            </div>
        );
    }
}

export default AssignmentCreationPage;