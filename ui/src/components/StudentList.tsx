import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label } from 'semantic-ui-react'

interface StudentListProps {
    project_id: number
}

class Row {
    constructor() {
        this.id = 0;
        this.name = "";
        this.numberOfSubmissions = 0;
        this.date = "";
        this.numberOfPylintErrors = 0;
        this.isPassing = "";
        this.subid=0;
    }
    
    id: number;
    name: string;
    numberOfSubmissions: number;
    date: string;
    numberOfPylintErrors: number;
    isPassing: string;
    subid:number;
}

interface StudentListState {
    rows: Array<Row>
}
//element[ yourKey ] = yourValue;

class StudentList extends Component<StudentListProps, StudentListState> {

    constructor(props: StudentListProps) {
        super(props);

        this.state = {
            rows: []
        }
    }


    handleClick(id: number){
        var url=`/code/${id}`
        window.location.replace(url);
    }


    componentDidMount() {
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/recentsubproject`, { project_id: this.props.project_id }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
          })
        .then(res => {
            var data = res.data
            // Read it
            var rows: Array<Row> = [];
            Object.entries(data).map( ([key, value]) => {
                var row = new Row();
                var test = (value as Array<string>);
                row.id = parseInt(key);
                row.name = test[0];
                row.numberOfSubmissions = parseInt(test[1]);
                row.date = test[2];
                row.isPassing = test[3];
                row.numberOfPylintErrors = parseInt(test[4]);
                row.subid=parseInt(test[5]);
                rows.push(row);    
                console.log(row);
                console.log(row.isPassing)
            });

            this.setState({ rows: rows });
        })
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
                    <Table.HeaderCell>Link</Table.HeaderCell>
                    
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.rows.map(row => {
                        return (
                            <Table.Row>
                                <Table.Cell>{row.name}</Table.Cell>
                                <Table.Cell>{row.numberOfSubmissions}</Table.Cell>
                                <Table.Cell>{row.date}</Table.Cell>
                                <Table.Cell>{row.numberOfPylintErrors}</Table.Cell>
                                <Table.Cell>{row.isPassing ? "PASSED" : "FAILED"}</Table.Cell>
                                <Table.Cell onClick={() => {this.handleClick(row.subid)}}>{row.subid}</Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        );
    }
}

export default StudentList;