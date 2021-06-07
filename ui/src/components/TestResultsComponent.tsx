import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab } from 'semantic-ui-react'
import '../css/TestResultComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';

class TestResultsComponent extends Component {
  render() {
    const panes = [
        {
            menuItem: 'Basic',
            render: () => 
            <Tab.Pane attached={false}>
                <div id="testresults-container">
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='close' className="failed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                </div>
            </Tab.Pane>,
        },
        {
            menuItem: 'Subtraction',
            render: () => 
            <Tab.Pane attached={false}>
                <div id="testresults-container">
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                </div>
            </Tab.Pane>,
        },
        {
            menuItem: 'Addition',
            render: () =>
            <Tab.Pane attached={false}>
                <div id="testresults-container">
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                    <span className="testcase">
                        <StyledIcon name='check' className="passed" />
                    </span>
                </div>
            </Tab.Pane>,
        },
    ]


    return (
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    );
  }
}

export default TestResultsComponent;
