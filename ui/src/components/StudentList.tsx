import React, { Component, FormEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Loader, Dropdown, DropdownItemProps, DropdownItem, DropdownProps } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

interface StudentListProps {
    project_id: number
}

class Row {
    constructor() {
        this.id = 0;
        this.Lname = "";
        this.Fname = "";
        this.numberOfSubmissions = 0;
        this.date = "";
        this.numberOfPylintErrors = 0;
        this.isPassing = "";
        this.subid=0;
        this.lecture_number=0;
        this.hidden = false;
    }
    
    id: number;
    Lname: string;
    Fname: string;
    numberOfSubmissions: number;
    date: string;
    numberOfPylintErrors: number;
    isPassing: string;
    subid:number;
    lecture_number:number;
    hidden: boolean;
}

interface StudentListState {
    rows: Array<Row>
    isLoading: boolean;
    lecture_numbers: Array<DropdownItemProps>
}

class StudentList extends Component<StudentListProps, StudentListState> {

    constructor(props: StudentListProps) {
        super(props);

        this.state = {
            rows: [],
            lecture_numbers: [{ key: 1, text:"None", value: 1 }],
            isLoading: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
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

            Object.entries(data).map(([key, value]) => {
                var row = new Row();
                var student_output_data = (value as Array<string>);
                row.id = parseInt(key);
                row.Lname = student_output_data[0];
                row.Fname = student_output_data[1];
                row.lecture_number=parseInt(student_output_data[2])
                if(!(this.state.lecture_numbers.some(x => x.value === row.lecture_number))){
                    this.state.lecture_numbers.push({ key: row.lecture_number, text: row.lecture_number.toString(), value: row.lecture_number })
                }
                row.numberOfSubmissions = parseInt(student_output_data[3]);
                row.date = student_output_data[4];
                row.isPassing = student_output_data[5];
                row.numberOfPylintErrors = parseInt(student_output_data[6]);
                row.subid=parseInt(student_output_data[7]);
                row.hidden = false;
                rows.push(row);    
                
                return row;
            });

            // 
            rows=rows.sort((a, b) => a.Lname.localeCompare(b.Lname))
            this.setState({ rows: rows });
        })
    }
    handleClick(){
        this.setState({isLoading: true});
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/run-moss`, { project_id: this.props.project_id }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            window.open(res.data, '_blank');
            this.setState({ isLoading: false });
        })
    }

    handleFilterChange(ev: React.SyntheticEvent<HTMLElement>, data: DropdownProps){
        var new_rows = this.state.rows.map(row => {
            if(data.value != 1){
                if(row.lecture_number==data.value){
                    row.hidden = false;
                }
                else{
                    row.hidden= true;
                }
            }
            else{
                row.hidden = false;
            }

            return row;
        });
        this.setState({ rows: new_rows });
    }
    


    render(){
        return (
            <>
                <Dropdown placeholder='Lecture Section' selection options={this.state.lecture_numbers} onChange={this.handleFilterChange} />
                <Table celled>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Student Name</Table.HeaderCell>
                        <Table.HeaderCell>Lecture Number</Table.HeaderCell>
                        <Table.HeaderCell>Number of Total Submissions</Table.HeaderCell>
                        <Table.HeaderCell>Date of most recent submission</Table.HeaderCell>
                        <Table.HeaderCell>Number of pylint errors on most recent submission</Table.HeaderCell>
                        <Table.HeaderCell>State of Last Submission</Table.HeaderCell>
                        <Table.HeaderCell button> <Loader size='massive' active={this.state.isLoading}>Loading: This process might take several minutes, please do not refresh</Loader><Label button onClick={this.handleClick}>Plagiarism Checker</Label></Table.HeaderCell>
                        
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.rows.map(row => {
                            if(row.hidden == true){
                                return (<></>);
                            }

                            if(row.subid === -1 && row.hidden == false){
                                return (
                                    <Table.Row>
                                        <Table.Cell>{row.Fname + " " + row.Lname}</Table.Cell>
                                        <Table.Cell className="table-width">{row.lecture_number}</Table.Cell>
                                        <Table.Cell>N/A</Table.Cell>
                                        <Table.Cell>N/A</Table.Cell>
                                        <Table.Cell>N/A</Table.Cell>
                                        <Table.Cell>N/A</Table.Cell>
                                        <Table.Cell></Table.Cell>
                                    </Table.Row>
                                )
                            }
                            return (
                                <Table.Row>
                                    <Table.Cell>{row.Fname + " " + row.Lname}</Table.Cell>
                                    <Table.Cell>{row.lecture_number}</Table.Cell>
                                    <Table.Cell>{row.numberOfSubmissions}</Table.Cell>
                                    <Table.Cell>{row.date}</Table.Cell>
                                    <Table.Cell>{row.numberOfPylintErrors}</Table.Cell>
                                    <Table.Cell>{row.isPassing ? "PASSED" : "FAILED"}</Table.Cell>
                                    <Table.Cell button><Link target="_blank" to={ "/code/" + row.subid }><Label button >View</Label></Link></Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </>
        );
    }
}

export default StudentList;