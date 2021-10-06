import { Component } from 'react';
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css'
import { SemanticCOLORS } from 'semantic-ui-react'
import AdminCodePageComponent from '../components/AdminCodePageComponent';
import MenuComponent from '../components/MenuComponent';

interface AdminPageState {
    file?: File,
    color: SemanticCOLORS,
    isLoading:boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    end: string,
    canRedeem:boolean,
    points:number
    time_until_next_submission: string,
    is_allowed_to_submit: boolean
}
 
class AdminCodePage extends Component<{}, {}> {

    render() {
        return (
        <div>
            <Helmet>
                <title>[Admin] Student Submission | TA-Bot</title>
            </Helmet>
            
            <AdminCodePageComponent></AdminCodePageComponent>
        </div>
        );
  }
}

export default AdminCodePage;
