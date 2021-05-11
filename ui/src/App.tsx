import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import LandingPage from './pages/Landing';
import UploadPage from './pages/UploadPage';
import ProtectedRoute from './components/ProtectedRoute';

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <Switch>
              <Route path="/login" component={LoginPage} />
              <ProtectedRoute path="/home" component={HomePage} />
              <Route exact path="/" component={LandingPage} />
              <Route exact path="/up" component={UploadPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
