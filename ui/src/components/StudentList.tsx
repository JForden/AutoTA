import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label } from 'semantic-ui-react'


class StudentList extends Component<{}, {}> {

    constructor(props: {}) {
        super(props);
        this.state = {
            projects: []
        }
    }
    componentDidMount() {
    }
    handleClassClick(){
        window.location.replace("/upload");
    }

    render(){
        return (
            <Table celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Student Name</Table.HeaderCell>
                    <Table.HeaderCell>Number of Total Submissions</Table.HeaderCell>
                    <Table.HeaderCell>Date of most recent submission</Table.HeaderCell>
                    <Table.HeaderCell>Number of pylint errors on most recent submission</Table.HeaderCell>
                    <Table.HeaderCell>State of Last Submission</Table.HeaderCell>
                    <Table.HeaderCell button>Link</Table.HeaderCell>
                    
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Alexander Gebhard</Table.Cell>
                        <Table.Cell>14</Table.Cell>
                        <Table.Cell>1/14/2021 1:50 PM</Table.Cell>
                        <Table.Cell>23</Table.Cell>
                        <Table.Cell>PASSED</Table.Cell>
                        <Table.Cell>Link</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Jack Forden</Table.Cell>
                        <Table.Cell>14</Table.Cell>
                        <Table.Cell>1/14/2021 1:50 PM</Table.Cell>
                        <Table.Cell>23</Table.Cell>
                        <Table.Cell>PASSED</Table.Cell>
                        <Table.Cell>Link</Table.Cell>
                    </Table.Row>
                
                </Table.Body>
            </Table>
        );
    }
}

export default StudentList;