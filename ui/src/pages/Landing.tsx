import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Redirect } from 'react-router-dom'

class LandingPage extends Component {
  render() {
    if (localStorage.getItem("AUTOTA_AUTH_TOKEN") != null) {
        return ( <Redirect to={{pathname: '/class/1/upload'}}/> );
    } else {
        return ( <Redirect to={{pathname: '/login'}}/> );
    }
  }
}

export default LandingPage;
