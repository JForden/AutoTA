import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/Login';
import LandingPage from './pages/Landing';
import UploadPage from './pages/UploadPage';
import ProtectedRoute from './components/ProtectedRoute';
import CodePage from './pages/CodePage';
import AdminLanding from './AdminPages/AdminLanding';
import ProjectBreakdown from './AdminPages/ProjectBreakdown';
import axios from 'axios';

class App extends Component {

  render() {
    axios.interceptors.response.use(
        function(successRes) {
            return successRes;
        }, 
        function(error) {
            if(error.response.status == 422 || error.response.status == 419) {
                localStorage.removeItem("AUTOTA_AUTH_TOKEN");
                window.location.href = "/login";
            }
            return Promise.reject(error);
    });

    return (
      <BrowserRouter>
        <Switch>
              <Route path="/login" component={LoginPage} />
              <Route exact path="/" component={LandingPage} />
              <ProtectedRoute exact path="/upload" component={UploadPage} />
              <ProtectedRoute exact path="/code/:id?" component={CodePage} />
              <ProtectedRoute exact path="/admin/projects" component={AdminLanding} />
              <ProtectedRoute exact path="/admin/project/:id" component={ProjectBreakdown} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
