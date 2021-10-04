import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab } from 'semantic-ui-react'
import '../css/AdminCodePageComponent.scss';
import { StyledIcon } from '../styled-components/StyledIcon';
import Split from 'react-split';

class AdminCodePageComponent extends Component<{}, {}> {

    render() {
        const panes1 = [
            { menuItem: 'main.py', render: () => <Tab.Pane>main.py</Tab.Pane> },
            { menuItem: 'test.py', render: () => <Tab.Pane>test.py</Tab.Pane> }
        ]
        
        const panes = [
            { menuItem: 'Files', render: () => <Tab.Pane><Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes1} /></Tab.Pane> },
            { menuItem: 'Testcases', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> }
        ]

    return (
        <div className="bottom">
            <Tab panes={panes} />
        </div>
    );
  }
}

export default AdminCodePageComponent;
