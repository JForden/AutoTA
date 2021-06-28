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
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/all_projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            res.data.forEach((str: any) => {
                arr.push(JSON.parse(str) as ProjectObject);
            });
            this.setState({projects: arr });
        })
        .catch(err => {
            console.log(err);
        });
    }
    handleClassClick(){
        window.location.replace("/upload");
    }

    render(){
        return (
            <Table celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Project Name</Table.HeaderCell>
                    <Table.HeaderCell>Project Start Date</Table.HeaderCell>
                    <Table.HeaderCell>Project End Date</Table.HeaderCell>
                    <Table.HeaderCell>Total Submissions</Table.HeaderCell>.
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {(() => {
                    const holder = [];
                    for (let index = this.state.projects.length-1; index >= 0; index--) {
                        holder[index] = ( 
                                <Table.Row>
                                    <Table.Cell onClick={this.handleClassClick}><Label button>{this.state.projects[index].Name}</Label> </Table.Cell>
                                    <Table.Cell>{this.state.projects[index].Start}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].End}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].TotalSubmissions}</Table.Cell>
                                </Table.Row>
                                );
                    }

                    return holder;
                })()}
                
                </Table.Body>

                
            </Table>
        );
    }
}

export default StudentList;