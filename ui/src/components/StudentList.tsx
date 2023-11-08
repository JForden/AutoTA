import React, { Component, FormEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Loader, Dropdown, DropdownItemProps, DropdownItem, DropdownProps, Input, Button } from 'semantic-ui-react';
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
        this.classId= "";
        this.grade=0;
        this.StudentNumber=0;
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
    classId: string;
    grade: number;
    StudentNumber: number;
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
                row.classId = student_output_data[8];
                row.grade = parseInt(student_output_data[9]);
                row.StudentNumber = parseInt(student_output_data[10]);
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
            window.alert(res.data);
            this.setState({ isLoading: false });
        }).catch( exc => {
            window.alert("Error running MOSS.  Please try again");
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
    
    handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>, row: Row) => {
        const newValue = parseFloat(e.target.value);
        if (!isNaN(newValue)) {
          const updatedRows = this.state.rows.map((r) =>
            r.id === row.id ? { ...r, grade: newValue } : r
          );
    
          this.setState({
            rows: updatedRows,
          });
        }
    };
    submitgrades(){
        //loop through rows
        this.setState({ isLoading: false });
        let temp: {[key: string]: string} = {};
        for(const value of this.state.rows){
            temp[value.id.toString()] = value.grade.toString();
        }
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/submitgrades`, 
            {studentgrades: temp, projectID: this.props.project_id},
            {headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            window.alert("Grades submitted successfully");
        }).catch( exc => {
            window.alert("Error submitting grades, please fillout bug report form");
            this.setState({ isLoading: false });
        })
    }
    exportGrades(){
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/getprojectname?projectID=${this.props.project_id}`,
        {headers: {
            'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
        }
        }).then(res => {
            let projectname = res.data;
            let csvContent = [] as String[][];
            
            csvContent.push(["OrgDefinedId", "Username", projectname]);

            for(const value of this.state.rows){
                csvContent.push([value.StudentNumber.toString(), value.Fname+"."+value.Lname, value.grade.toString()]);
            }
            const csvRows = csvContent.map(row => row.join(',')); // Convert each row to a string
            const csvString = csvRows.join('\n'); // Join rows with newline character
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.csv';
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }).catch( exc => {
            window.alert("Error exporting project grades, please fillout bug report form");
        })


        //Get project name
        //format CSV
        //
    }

    

    render(){
        return (
            <>
                <Dropdown placeholder='Lecture Section' selection options={this.state.lecture_numbers} onChange={this.handleFilterChange} />
                <Table celled style={{ 
                    borderRadius: '10px', 
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)' // Kept only the darkest shadow
                    }}>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Student Name</Table.HeaderCell>
                        <Table.HeaderCell>Lecture Number</Table.HeaderCell>
                        <Table.HeaderCell>Number of Total Submissions</Table.HeaderCell>
                        <Table.HeaderCell>Date of most recent submission</Table.HeaderCell>
                        <Table.HeaderCell>Number of pylint errors on most recent submission</Table.HeaderCell>
                        <Table.HeaderCell>State of Last Submission</Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button 
                                onClick={() => { this.handleClick() }} 
                                style={{ 
                                    backgroundColor: 'red', 
                                    color: 'white', 
                                    borderRadius: '5px', 
                                    padding: '10px', 
                                    margin: '5px'
                                }}
                            >
                                Plagiarism Checker
                            </Button>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button 
                                onClick={() => { this.submitgrades() }} 
                                style={{ 
                                    backgroundColor: 'green', 
                                    color: 'white', 
                                    borderRadius: '5px', 
                                    padding: '10px', 
                                    margin: '5px'
                                }}
                            >
                                Submit Grades
                            </Button>
                            <Button 
                                onClick={() => { this.exportGrades() }} 
                                style={{ 
                                    backgroundColor: 'blue', 
                                    color: 'white', 
                                    borderRadius: '5px', 
                                    padding: '10px', 
                                    margin: '5px'
                                }}
                            >
                                Export Grades
                            </Button>
                        </Table.HeaderCell>
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
                                        <Table.Cell>N/A</Table.Cell>
                                        <Table.Cell>
                                       <Input
                                        type="text"
                                        placeholder="optional"
                                        value={row.grade} // Set the initial value of the input to row.grade
                                        onChange={(e) => this.handleGradeChange(e, row)} // Pass the row object to the function so we can update the state of the row
                                        style={{ 
                                            borderRadius: '5px', 
                                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', 
                                            padding: '10px'
                                        }}
                                    />
                                    </Table.Cell>
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
                                    <Table.Cell style={{ color: row.isPassing ? 'green' : 'red' }}>
                                        {row.isPassing ? "PASSED" : "FAILED"}
                                    </Table.Cell>
                                    <Table.Cell style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Button 
                                            as={Link} 
                                            target="_blank" 
                                            to={"/class/"+ row.classId +"/code/" + row.subid} 
                                            style={{ 
                                                backgroundColor: 'orange', 
                                                color: 'white', 
                                                borderRadius: '5px', 
                                                padding: '10px', 
                                                margin: '5px',
                                                width: '150px' // Added width
                                            }}
                                        >
                                            View
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell>
                                    <Input
                                        type="text"
                                        placeholder="optional"
                                        value={row.grade} // Set the initial value of the input to row.grade
                                        onChange={(e) => this.handleGradeChange(e, row)} // Pass the row object to the function so we can update the state of the row
                                        style={{ 
                                            borderRadius: '5px', 
                                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', 
                                            padding: '10px'
                                        }}
                                    />
                                    </Table.Cell>
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