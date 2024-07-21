import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Redirect, useParams } from 'react-router-dom'
import OfficeHoursComponent from '../components/OfficeHoursComponent';
import { Helmet } from 'react-helmet';
import MenuComponent from '../components/MenuComponent';

interface OfficeHoursProps {
    question: string,
    id: string
}

const OfficeHoursPage = () => {
    let { id } = useParams<OfficeHoursProps>();
    console.log("This is the project id", id);

    return (
        <div>
            <Helmet>
                <title>[Admin] Students | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
            <OfficeHoursComponent project_id={id} question="Enter your question here"></OfficeHoursComponent>
        </div>
    )
}


export default OfficeHoursPage;
