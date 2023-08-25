import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Redirect } from 'react-router-dom'
import OfficeHoursComponent from '../components/OfficeHoursComponent';
import { Helmet } from 'react-helmet';
import MenuComponent from '../components/MenuComponent';

class OfficeHoursPage extends Component {
    render() {
        return (
            <div id="code-page">
                <Helmet>
                    <title>Office Hours | TA-Bot</title>
                </Helmet>
                <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
                <OfficeHoursComponent question="Enter your question here"></OfficeHoursComponent>
            </div>
        );
    }
}

export default OfficeHoursPage;
