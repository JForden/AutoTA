import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Redirect } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import AccountCreationPageComponent from '../components/AccountCreationPageComponent';

class AccountCreationPage extends Component {
    render() {
        return (
            <div id="AccountCreationPage">
                <AccountCreationPageComponent></AccountCreationPageComponent>
            </div>
        );
    }
}

export default AccountCreationPage;