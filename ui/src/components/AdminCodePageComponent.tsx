import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Tab,Icon,Table,Form } from 'semantic-ui-react'
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
            { menuItem: 'Testcases', render: () => <Tab.Pane><Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes2} /></Tab.Pane> }
        ]
        const panes2 = [
            { menuItem: 'Level 1', render: () => <Tab.Pane>main.py</Tab.Pane> },
            { menuItem: 'Level 2', render: () => <Tab.Pane>test.py</Tab.Pane> },
        ]

    return (
        <div>
        <Table celled structured>
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell rowSpan='2'>Student Name</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Date Submitted</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Number of Files Submitted</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Submission Score</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Test Cases Failed</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Assign Grade Col</Table.HeaderCell>
                
                </Table.Row>
            </Table.Header>
  
        <Table.Body>
            <Table.Row>
            <Table.Cell textAlign='center'>Jack Forden</Table.Cell>
            <Table.Cell textAlign='center' >10-6-2021 14:14:56</Table.Cell>
            <Table.Cell textAlign='center'>2</Table.Cell>
            <Table.Cell textAlign='center'>100</Table.Cell> 
            <Table.Cell textAlign='center'>50/100</Table.Cell>
            <Table.Cell textAlign='center'><Form.Field control='input' /><Form.Field control='button'>
                Submit
                </Form.Field>
            </Table.Cell>
            </Table.Row>
        </Table.Body>
        </Table>
        <div className="bottom">
            <Tab panes={panes} />
        </div>
        </div>
    );
  }
}

export default AdminCodePageComponent;
