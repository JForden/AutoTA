import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/Login';
import LandingPage from './pages/Landing';
import UploadPage from './pages/UploadPage';
import ProtectedRoute from './components/ProtectedRoute';
import PastSubmissionPage from "./components/PastSubmissionPage";
import CodePage from './pages/CodePage';
import AdminLanding from './AdminPages/AdminLanding';
import ProjectBreakdown from './AdminPages/ProjectBreakdown';
import axios from 'axios';
import NotFoundComponent from './components/NotFoundComponent';
import AdminUpload from './AdminPages/AdminUpload';
import AdminSettingsPage from './AdminPages/AdminSettingsPage';
import ClassSelectionPage from './pages/ClassSelectionPage';
import AdminProjectConfig from './AdminPages/AdminProjectConfig';
import CodeHelpComponent from './components/CodeHelpComponent';
import CodeHelpPage from './pages/CodeHelpPage';
import AdminLandingComponent from './components/AdminLandingComponent';
import AdminProject from './AdminPages/AdminProject';
import AdminComponent from './components/AdminLandingComponent';
import CreateAccountPage from './pages/AccountCreationPage';
import TaLanding from './AdminPages/TaLanding';
import OfficeHoursPage from './pages/OfficeHoursPage';
import AdminAnalyticsComponent from './components/AdminAnalyticsComponent';
import ProjectAnalytics from './AdminPages/ProjectAnalitics';

class App extends Component {

    render() {
        axios.interceptors.response.use(
            function (successRes) {
                return successRes;
            },
            function (error) {
                if (error.response && (error.response.status === 401 || error.response.status === 422 || error.response.status === 419)) {
                    localStorage.removeItem("AUTOTA_AUTH_TOKEN");
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            });

        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/login">
                        <LoginPage></LoginPage>
                    </Route>
                    <Route exact path="/">
                        <LandingPage></LandingPage>
                    </Route>
                    <ProtectedRoute exact path="/submissions" component={PastSubmissionPage} />
                    <ProtectedRoute exact path="/class/:class_id/upload" component={UploadPage} />
                    <ProtectedRoute exact path="/class/:class_id/code/:id?" component={CodePage} />
                    <ProtectedRoute exact path="/class/classes" component={ClassSelectionPage} />
                    <ProtectedRoute exact path="/admin/classes" component={AdminLanding} />
                    <ProtectedRoute exact path="/admin/TaLanding" component={TaLanding} />
                    <ProtectedRoute exact path="/admin/projects/:id" component={AdminProject} />
                    <ProtectedRoute exact path="/admin/project/:id" component={ProjectBreakdown} />
                    <ProtectedRoute exact path="/admin/upload" component={AdminUpload} />
                    <ProtectedRoute exact path="/admin/settings" component={AdminSettingsPage} />
                    <ProtectedRoute exact path="/admin/project/edit/:class_id/:id" component={AdminProjectConfig} />
                    <ProtectedRoute exact path="/class/:class_id/codeHelp" component={CodeHelpPage} />
                    <ProtectedRoute exact path="/class/OfficeHours/:id" component={OfficeHoursPage} />
                    <ProtectedRoute exact path="/user/createAccount" component={CreateAccountPage} />
                    <ProtectedRoute exact path="/admin/AdminAnalytics/:id" component={ProjectAnalytics} />

                    <Route>
                        <NotFoundComponent></NotFoundComponent>
                    </Route>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
