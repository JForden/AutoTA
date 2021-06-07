import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';

class DescriptionComponent extends Component {
  render() {
    return (
    <div>
        <b>[Basic] 3. Add Zero</b><br/>
        Result: <span className="failed">FAILED</span><br/>
        Adds zero to a number (i.e. 100 + 0).  Should return the correct value.
    </div>
    );
  }
}

export default DescriptionComponent;
