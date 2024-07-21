import React, { Component, FormEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/TestResultComponent.scss';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Loader, Dropdown, DropdownItemProps, DropdownItem, DropdownProps, Input, Button, Icon, Modal, Accordion, Tab } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { parse } from 'path';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// If you're using highlight.js, import from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
        this.subid = 0;
        this.lecture_number = 0;
        this.hidden = false;
        this.classId = "";
        this.grade = 0;
        this.StudentNumber = 0;
        this.IsLocked = false;
    }

    id: number;
    Lname: string;
    Fname: string;
    numberOfSubmissions: number;
    date: string;
    numberOfPylintErrors: number;
    isPassing: string;
    subid: number;
    lecture_number: number;
    hidden: boolean;
    classId: string;
    grade: number;
    StudentNumber: number;
    IsLocked: boolean;
}

interface StudentListState {
    rows: Array<Row>
    isLoading: boolean;
    lecture_numbers: Array<DropdownItemProps>;
    selectedStudent: number;
    modalIsLoading: boolean;
    modalIsOpen: boolean;
    selectedStudentData: any[];
    selectedStudentCode: string;
    selectedStudentTestResults: any[];
    selectedStudentName: string;
    selectedStudentGrade: number;
    exportModalIsOpen: boolean;
    selectedLecture: number;
    projectLanguage: string;
}

class StudentList extends Component<StudentListProps, StudentListState> {

    constructor(props: StudentListProps) {
        super(props);

        this.state = {
            rows: [],
            lecture_numbers: [{ key: 1, text: "All", value: 1 }],
            isLoading: false,
            selectedStudent: -1,
            modalIsLoading: false,
            modalIsOpen: false,
            selectedStudentData: [],
            selectedStudentCode: "",
            selectedStudentTestResults: [],
            selectedStudentName: "",
            selectedStudentGrade: 0,
            exportModalIsOpen: false,
            selectedLecture: -1,
            projectLanguage: ""

        }
        this.handleClick = this.handleClick.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleUnlockClick = this.handleUnlockClick.bind(this);
        this.submitGrades = this.submitGrades.bind(this);
        this.exportGrades = this.exportGrades.bind(this);
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
                    row.lecture_number = parseInt(student_output_data[2]);
                    if (!(this.state.lecture_numbers.some(x => x.value === row.lecture_number))) {
                        this.state.lecture_numbers.push({ key: row.lecture_number, text: row.lecture_number.toString(), value: row.lecture_number })
                    }
                    row.numberOfSubmissions = parseInt(student_output_data[3]);
                    row.date = student_output_data[4];
                    row.isPassing = student_output_data[5];
                    row.numberOfPylintErrors = parseInt(student_output_data[6]);
                    row.subid = parseInt(student_output_data[7]);
                    row.hidden = false;
                    row.classId = student_output_data[8];
                    row.grade = parseInt(student_output_data[9]);
                    row.StudentNumber = parseInt(student_output_data[10]);
                    row.IsLocked = Boolean(student_output_data[11]);
                    rows.push(row);
                    return row;
                });

                // 
                rows = rows.sort((a, b) => a.Lname.localeCompare(b.Lname))
                this.setState({ rows: rows });
            })
    }

    // This function submits 
    handleClick() {
        this.setState({ isLoading: true });
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/run-moss`, { project_id: this.props.project_id }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                window.alert(res.data);
                this.setState({ isLoading: false });
            }).catch(exc => {
                window.alert("Error running MOSS.  Please try again");
                this.setState({ isLoading: false });
            })
    }

    handleFilterChange(ev: React.SyntheticEvent<HTMLElement>, data: DropdownProps) {
        var new_rows = this.state.rows.map(row => {
            if (data.value != 1) {
                if (row.lecture_number == data.value) {
                    row.hidden = false;
                }
                else {
                    row.hidden = true;
                }
            }
            else {
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

    // This function unlocks a student account when they have entered their password incorrectly too many times
    handleUnlockClick = (UserId: number) => {
        console.log(UserId);
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/unlockStudentAccount`, { UserId: UserId }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                window.location.reload();
            })
    };
    submitGrades(UserId: number, grade: string) {
        //loop through rows
        let intGrade = parseInt(grade);
        this.setState({ isLoading: false });
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/submitgrades`,
            { userId: UserId, grade: intGrade, projectID: this.props.project_id },
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            })
            .then(res => {
                this.openGradingModule(UserId + 1);
            }).catch(exc => {
                window.alert("Error submitting grades, please fillout bug report form");
                this.setState({ isLoading: false });
            })
    }

    exportGrades() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/getprojectscores?projectID=${this.props.project_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            }).then(res => {
                console.log(res.data.studentData);
                console.log(this.state.selectedLecture);

                let projectname = res.data.projectName;
                let csvContent = [] as String[][];
                let selectedRow: any;

                csvContent.push(["OrgDefinedId", projectname + " Points Grade", "End-of-Line Indicator"]);

                for (const value of res.data.studentData) {
                    selectedRow = this.state.rows.find(row => row.id === value[2]);
                    console.log("Selected lecture: ", this.state.selectedLecture)
                    console.log("Selected row", selectedRow?.lecture_number);
                    if (this.state.selectedLecture == -1) {
                        csvContent.push([value[0].toString(), value[1].toString(), "#"]);
                    }
                    else {
                        if (selectedRow.lecture_number == this.state.selectedLecture) {
                            csvContent.push([value[0].toString(), value[1].toString(), "#"]);
                        }
                    }
                }

                const csvRows = csvContent.map(row => row.join(',')); // Convert each row to a string
                const csvString = csvRows.join('\n'); // Join rows with newline character
                const blob = new Blob([csvString], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectname}.csv`;
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.setState({ exportModalIsOpen: false });
            }).catch(exc => {
                window.alert("Error exporting project grades, please fillout bug report form");
            })
    }

    openGradingModule(UserId: number) {
        this.setState({ modalIsLoading: true });
        if (UserId == -1) {
            UserId = this.state.rows[0].id;
            this.setState({ selectedStudentName: this.state.rows[0].Fname + " " + this.state.rows[0].Lname });
            this.setState({ selectedStudent: UserId });
            this.setState({ selectedStudentGrade: this.state.rows[0].grade })
        }
        else {
            const selectedRow = this.state.rows.find(row => row.id === UserId);
            if (selectedRow == undefined) {
                this.setState({ modalIsOpen: false });
                window.alert("No more Students to grade!");
                return;
            }
            this.setState({ selectedStudentName: selectedRow.Fname + " " + selectedRow.Lname });
            this.setState({ selectedStudent: UserId })
            this.setState({ selectedStudentGrade: selectedRow.grade })
        }
        console.log(UserId);
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/ProjectGrading`, { userID: UserId, ProjectId: this.props.project_id }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                this.setState({ selectedStudentData: res.data.GradingData, modalIsLoading: false, modalIsOpen: true });
                this.setState({ selectedStudentCode: res.data.Code });
                this.setState({ selectedStudentTestResults: res.data.TestResults });
                this.setState({ projectLanguage: res.data.Language });
            }).catch(exc => {
                window.alert("Error opening grading module, please fillout bug report form");
                this.setState({ modalIsLoading: false });
            }
            )
    }

    render() {
        const levels = ['Level 1', 'Level 2', 'Level 3'];
        const customStyle = {
            ...vs, // Spread the vs style
            borderRadius: '5px',
            padding: '10px',
            color: '#ff0000', // Custom color
        };
        const panels = levels.map(level => ({
            menuItem: level,
            render: () => (
                <Tab.Pane>
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>TestCase Name</Table.HeaderCell>
                                <Table.HeaderCell>Output</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.state.selectedStudentTestResults.map((testCase, index) => {
                                if (testCase.level === level) {
                                    return (
                                        <Table.Row key={index}>
                                            <Table.Cell positive={testCase.State} negative={!testCase.State}>{testCase.name}</Table.Cell>
                                            <Table.Cell positive={testCase.output === "      - ''"}>
                                                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                    {testCase.output === "      - ''" ? 'Passed' : testCase.output}
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                }
                            })}
                        </Table.Body>
                    </Table>
                </Tab.Pane>
            ),
        }));
        return (

            <>
                <Modal
                    open={this.state.exportModalIsOpen}
                    onClose={() => this.setState({ exportModalIsOpen: false })}
                    onOpen={() => this.setState({ exportModalIsOpen: true })}
                    size="mini"
                >
                    <Modal.Header>Data Exporter</Modal.Header>
                    <Modal.Content>
                        <p>Select a lecture section to export data:</p>
                        <Dropdown
                            placeholder='Lecture Section'
                            selection
                            options={this.state.lecture_numbers}
                            onChange={(event, data) => {
                                if (typeof data.value === 'number') {
                                    this.setState({ selectedLecture: data.value });
                                }
                            }}
                        />
                        <p>After selecting, click the export button to download the data.</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='green' onClick={this.exportGrades}>Export</Button>
                    </Modal.Actions>
                </Modal>
                <Modal
                    open={this.state.modalIsOpen}
                    onClose={() => this.setState({ modalIsOpen: false })}
                    onOpen={() => this.setState({ modalIsOpen: true })}
                    size="fullscreen"
                >
                    <Modal.Header>Student Name: {this.state.selectedStudentName}</Modal.Header>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div id="code-container" style={{
                            borderRadius: '5px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                            backgroundColor: '#f5f5f5', // Lighter gray
                            padding: '20px',
                            fontFamily: 'Courier New, monospace',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: '#333',
                            overflow: 'auto',
                            marginTop: '20px',
                            border: 'none', // Remove border
                            maxHeight: '600px', // Set max height to fit ~30 lines
                            flex: 1, // Take up half the space
                        }}>
                            <SyntaxHighlighter
                                language={this.state.projectLanguage}
                                style={customStyle}
                                showLineNumbers={true}
                            >
                                {this.state.selectedStudentCode}
                            </SyntaxHighlighter>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', marginTop: '20px' }}>
                            <Tab panes={panels} styled />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', }}>
                            <div style={{ marginRight: '10px', marginTop: '20px' }}>
                                <input
                                    id="gradeInput"
                                    type="text"
                                    placeholder="0"
                                    defaultValue="0"
                                    style={{
                                        padding: '10px',
                                        fontSize: '16px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#f5f5f5', // Lighter gray to match the model
                                        fontFamily: 'Courier New, monospace', // Match the font of the model
                                        color: '#333', // Match the color of the model
                                    }}
                                />
                            </div>
                            <Button
                                primary
                                style={{
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '10px 20px',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                    fontFamily: 'Courier New, monospace'
                                }}
                                onClick={() => {
                                    const gradeInput = document.getElementById('gradeInput') as HTMLInputElement;
                                    if (gradeInput) {
                                        this.submitGrades(this.state.selectedStudent, gradeInput.value);
                                    }
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>

                </Modal >
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
                                    onClick={() => this.setState({ exportModalIsOpen: true })}
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
                                <Button
                                    onClick={() => { this.openGradingModule(-1) }}
                                    style={{
                                        backgroundColor: 'blue',
                                        color: 'white',
                                        borderRadius: '5px',
                                        padding: '10px',
                                        margin: '5px'
                                    }}
                                >
                                    Start Grading
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.rows.map(row => {
                            if (row.hidden == true) {
                                return (<></>);
                            }

                            if (row.subid === -1 && row.hidden == false) {
                                return (
                                    <Table.Row>
                                        <Table.Cell>
                                            {row.Fname + " " + row.Lname}
                                            {row.IsLocked === true && (
                                                <Button color='blue' icon size='mini' style={{ marginLeft: '10px' }} onClick={() => this.handleUnlockClick(row.id)}>
                                                    <Icon name='unlock' />
                                                </Button>
                                            )}
                                        </Table.Cell>
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
                                                disabled
                                            />
                                            <Button
                                                onClick={() => { this.openGradingModule(row.id) }}
                                                style={{
                                                    backgroundColor: 'blue',
                                                    color: 'white',
                                                    borderRadius: '5px',
                                                    padding: '10px',
                                                    margin: '5px'
                                                }}
                                            >
                                                Grade
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            }
                            return (
                                <Table.Row>
                                    <Table.Cell>
                                        {row.Fname + " " + row.Lname}
                                        {row.IsLocked === true && (
                                            <Button color='blue' icon size='mini' style={{ marginLeft: '10px' }} onClick={() => this.handleUnlockClick(row.id)}>
                                                <Icon name='unlock' />
                                            </Button>
                                        )}
                                    </Table.Cell>
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
                                            to={"/class/" + row.classId + "/code/" + row.subid}
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
                                            disabled
                                        />
                                        <Button
                                            onClick={() => { this.openGradingModule(row.id) }}
                                            style={{
                                                backgroundColor: 'blue',
                                                color: 'white',
                                                borderRadius: '5px',
                                                padding: '10px',
                                                margin: '5px'
                                            }}
                                        >
                                            Grade
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table >

            </>

        );
    }
}

export default StudentList;