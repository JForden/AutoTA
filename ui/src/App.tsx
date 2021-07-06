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

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <Switch>
              <Route path="/login" component={LoginPage} />
              <Route exact path="/" component={LandingPage} />
              <ProtectedRoute exact path="/upload" component={UploadPage} />
              <ProtectedRoute exact path="/code" component={CodePage} />
              <ProtectedRoute exact path="/admin/projects" component={AdminLanding} />
              <ProtectedRoute exact path="/admin/project-view/:id" component={ProjectBreakdown} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
