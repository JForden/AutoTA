import { Component, useEffect, useState, useReducer } from 'react';
import { Image, Grid, Tab, Dropdown, Form, Input, Radio, Button, Icon, TextArea, Label, Checkbox, Table, Header, Segment, Popup, DropdownProps, List, Modal } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { DropdownItemProps, } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import codeimg from '../codeex.png'
import axios from 'axios';
import { textSpanEnd } from 'typescript';
import AdminProjectSettingsComponent from './AdminProjectSettingsComponent';
import { useParams } from 'react-router-dom';
import { StyledIcon } from '../styled-components/StyledIcon';
import { render } from '@testing-library/react';

interface AdminProjectConfigProps {
    id: number,
    class_id: number
}


class Testcase {
    constructor() {
        this.id = 0;
        this.name = "";
        this.levelid = 0;
        this.description = "";
        this.input = "";
        this.output = "";
        this.isHidden = false;
        this.levelname = "";
        this.additionalfilepath = "";
    }

    id: number;
    name: string;
    levelid: number;
    description: string;
    input: string;
    output: string;
    isHidden: boolean;
    levelname: string;
    additionalfilepath: string;
}

const AdminProjectConfigComponent = (props: AdminProjectConfigProps) => {
    const [CreateNewState, setCreateNewState] = useState<boolean>();
    const [testcases, setTestcases] = useState<Array<Testcase>>([]);
    const [checked, setChecked] = useState<string>("Level 1");
    const [ProjectName, setProjectName] = useState<string>("");
    const [ProjectStartDate, setProjectStartDate] = useState<string>("");
    const [ProjectEndDate, setProjectEndDate] = useState<string>("");
    const [ProjectLanguage, setProjectLanguage] = useState<string>("");
    const [SubmitButton, setSubmitButton] = useState<string>("Create new assignment");
    const [SubmitJSON, setSubmitJSON] = useState<string>("Submit .JSON file");
    const [getJSON, setGetJSON] = useState<string>("Export test cases");
    const [File, setFile] = useState<File>();
    const [AssignmentDesc, setDesc] = useState<File>();
    const [edit, setEdit] = useState<boolean>(false);
    const [selectedAddFile, setSelectedAddFile] = useState<File>();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedTestCaseId, setSelectedTestCaseId] = useState<number>(-4);
    const [solutionfileName, setSolutionFileName] = useState<string>("");
    const [descfileName, setDescFileName] = useState<string>("");
    const [jsonfilename, setjsonfilename] = useState<string>("");

    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_testcases?id=${props.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var data = res.data

                var rows: Array<Testcase> = [];

                Object.entries(data).map(([key, value]) => {
                    var testcase = new Testcase();
                    var values = (value as Array<string>);


                    testcase.id = parseInt(key);
                    testcase.levelid = parseInt(values[0]);
                    testcase.name = values[1];
                    testcase.description = values[2];
                    testcase.input = values[3];
                    testcase.output = values[4];
                    testcase.isHidden = !!values[5];
                    testcase.additionalfilepath = values[6];
                    testcase.levelname = values[7]


                    rows.push(testcase);

                    return testcase;
                });

                var testcase = new Testcase();
                testcase.id = -1;
                testcase.levelid = -1;
                testcase.name = "";
                testcase.description = "";
                testcase.input = "";
                testcase.output = "";
                testcase.isHidden = false;
                testcase.additionalfilepath = "None";
                testcase.levelname = "UNKNOWN";


                rows.push(testcase);

                setTestcases(rows);
            })
            .catch(err => {
                console.log(err);
            });
        if (!CreateNewState && props.id != 0) {
            axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_project_id?id=${props.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            })
                .then(res => {
                    var data = res.data
                    if (!CreateNewState) {
                        setProjectName(data[props.id][0]);
                        setProjectStartDate(data[props.id][1]);
                        setProjectEndDate(data[props.id][2]);
                        setProjectLanguage(data[props.id][3]);
                        setSolutionFileName(data[props.id][4]);
                        setDescFileName(data[props.id][5]);
                        setEdit(true);
                        setSubmitButton("Submit changes");
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [])



    function handleNameChange(testcase_id: number, name: string) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].name = name;
                setTestcases(new_testcases);
                break;
            }
        }
    }

    function handleDescriptionChange(testcase_id: number, description: string) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].description = description;
                setTestcases(new_testcases);
                break;
            }
        }
    }

    function handleHiddenChange(testcase_id: number, checked: boolean) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].isHidden = !new_testcases[i].isHidden;
                setTestcases(new_testcases);
                break;
            }
        }
    }


    function handleLevelChange(testcase_id: number, level: string) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {

                new_testcases[i].levelname = level;
                setTestcases(new_testcases);

                break;
            }
        }

    }
    function handleInputChange(testcase_id: number, input_data: string) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].input = input_data;
                setTestcases(new_testcases);
                break;
            }
        }
    }

    function handleOutputChange(testcase_id: number, output_data: string) {
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].output = output_data;
                setTestcases(new_testcases);
                break;
            }
        }
    }



    function buttonhandleTrashClick(testcase: number) {
        //loop through testcase and return the one with the id
        var test: Testcase = new Testcase();
        for (var i = 0; i < testcases.length; i++) {
            if (testcases[i].id === testcase) {
                test = testcases[i];
                break;
            }
        }

        const formData = new FormData();
        formData.append('id', test.id.toString());

        axios.post(process.env.REACT_APP_BASE_API_URL + '/projects/remove_testcase', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(function (response) {
            reloadtests();
        }).catch(function (error) {
            console.log(error);
        });
        setModalOpen(false);
    }
    function reloadtests() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_testcases?id=${props.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var data = res.data

                var rows: Array<Testcase> = [];

                Object.entries(data).map(([key, value]) => {
                    var testcase = new Testcase();
                    var values = (value as Array<string>);

                    testcase.id = parseInt(key);
                    testcase.levelid = parseInt(values[0]);
                    testcase.name = values[1];
                    testcase.description = values[2];
                    testcase.input = values[3];
                    testcase.output = values[4];
                    testcase.isHidden = !!values[5];
                    testcase.additionalfilepath = values[6];
                    testcase.levelname = values[7];
                    rows.push(testcase);

                    return testcase;
                });

                var testcase = new Testcase();
                testcase.id = -1;
                testcase.levelid = -1;
                testcase.name = "";
                testcase.description = "";
                testcase.input = "";
                testcase.output = "";
                testcase.isHidden = false;
                testcase.levelname = "UNKNOWN";
                testcase.additionalfilepath = "None";

                rows.push(testcase);

                setTestcases(rows)
            })
            .catch(err => {
                console.log(err);
            });
    }
    function handleJsonSubmit() {
        const formData = new FormData();
        formData.append("file", File!);
        formData.append("project_id", props.id.toString());
        formData.append("class_id", props.class_id.toString());
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/json_add_testcases`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                reloadtests();
            }).catch(function (error) {
                console.log(error);
            });
    }

    function handleAutoGenerateDescription(testcase_id: number) {
        let new_testcases = [...testcases];

        var tcinput = "";
        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                tcinput = new_testcases[i].input;
                break;
            }
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}/submissions/gptDescription`, {
            params: {
                input: tcinput,
                projectId: props.id.toString(),
            },
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                handleDescriptionChange(testcase_id, res.data.description);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function handleNewSubmit() {
        const formData = new FormData();
        formData.append("file", File!);
        formData.append("assignmentdesc", AssignmentDesc!);
        formData.append("name", ProjectName);
        formData.append("start_date", ProjectStartDate);
        formData.append("end_date", ProjectEndDate);
        formData.append("language", ProjectLanguage);
        formData.append("class_id", props.class_id.toString());
        if (ProjectName === "" || ProjectStartDate === "" || ProjectEndDate === "" || ProjectLanguage === "") {
            window.alert("Please fill out all fields");
            return;
        }
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/create_project`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var data = res.data;
                window.location.href = "/admin/project/edit/" + props.class_id + "/" + data;
            }).catch(function (error) {
                console.log(error);
            });
    }
    function handleEditSubmit() {
        console.log(edit);
        const formData = new FormData();
        formData.append("id", props.id.toString());
        formData.append("file", File!);
        formData.append("assignmentdesc", AssignmentDesc!);
        formData.append("name", ProjectName);
        formData.append("start_date", ProjectStartDate);
        formData.append("end_date", ProjectEndDate);
        formData.append("language", ProjectLanguage);
        formData.append("class_id", props.class_id.toString());
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/edit_project`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var data = res.data;
                window.location.href = "/admin/project/edit/" + props.class_id + "/" + props.id;
            }).catch(function (error) {
                console.log(error);
            });
    }

    function handleOpenModal(TestCaseId: number) {
        setModalOpen(true);
        setSelectedTestCaseId(TestCaseId);
    }
    function handleCloseModal() {
        setModalOpen(false);
        setSelectedTestCaseId(-4);
    }


    function handleFileChange(event: React.FormEvent) {

        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setFile(files[0]);
            setSolutionFileName(files[0].name);
        } else {
            setFile(undefined);
        }
    };

    function handleJsonFileChange(event: React.FormEvent) {

        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setFile(files[0]);
            setjsonfilename(files[0].name);
        } else {
            setFile(undefined);
        }
    };

    function handleDescFileChange(event: React.FormEvent) {

        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setDesc(files[0]);
            setDescFileName(files[0].name);
        } else {
            setDesc(undefined);
        }
    };

    function handleAdditionalFileChange(event: React.FormEvent) {

        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setSelectedAddFile(files[0]);
        } else {
            setSelectedAddFile(undefined);
        }
    };

    function buttonhandleClick(testcase: number) {
        //loop through testcase and return the one with the id
        var test: Testcase = new Testcase();
        for (var i = 0; i < testcases.length; i++) {
            if (testcases[i].id === testcase) {
                test = testcases[i];
                break;
            }
        }

        const formData = new FormData();
        formData.append('id', test.id.toString());
        formData.append('name', test.name);
        formData.append('levelName', test.levelname.toString());
        formData.append('project_id', props.id.toString());
        formData.append('input', test.input.toString());
        formData.append('output', test.output.toString());
        formData.append('isHidden', test.isHidden.toString());
        formData.append('description', test.description.toString());
        if (selectedAddFile !== undefined) {
            formData.append('additionalFile', selectedAddFile!);
        }

        if (test.name === "" || test.levelname === "" || test.input === "" || test.description === "") {
            window.alert("Please fill out all fields");
            return;
        }
        console.log(formData);
        axios.post(process.env.REACT_APP_BASE_API_URL + '/projects/add_or_update_testcase', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(function (response) {
            reloadtests();
        }).catch(function (error) {
            console.log(error);
        });
        setModalOpen(false);
    }



    function get_testcase_json() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_testcases?id=${props.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var data = res.data

                var rows: Array<Testcase> = [];

                Object.entries(data).map(([key, value]) => {
                    var testcase = new Testcase();
                    var values = (value as Array<string>);
                    testcase.id = -1;
                    testcase.levelid = parseInt(values[0]);
                    testcase.name = values[1];
                    testcase.description = values[2];
                    testcase.input = values[3];
                    testcase.output = values[4];
                    testcase.isHidden = !!values[5];
                    testcase.levelname = values[7];
                    testcase.additionalfilepath = values[6];
                    rows.push(testcase);

                    return testcase;
                });
                const fileContent = JSON.stringify(rows, null, 2);
                const fileName = ProjectName + '.json';
                const blob = new Blob([fileContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => {
                console.error(error);
            });
    }
    function buttonhandleAdditionalFileClick(testcase: number, event: React.FormEvent) {
        //Display a popup to prompt a user for a file
        render(
            <div>
                <h1>Upload Additional File</h1>
                <Form.Input type="file" fluid required={true} onChange={handleFileChange} />
                <br></br>
            </div>
        )
    }
    const selectedTestCase = testcases.find(testcase => testcase.id === selectedTestCaseId);
    return (
        <div style={{ height: "80%" }}>
            <Tab
                style={{ width: '100%', height: '200%' }}
                menu={{ vertical: true, secondary: true, tabular: true }}
                grid={{ paneWidth: 14, tabWidth: 2 }}
                menuPosition='left'
                panes={[
                    {
                        menuItem: {
                            key: 'psettings',
                            icon: 'pencil alternate',
                            content: 'Project Settings',
                            style: {
                                color: '#007bff',
                                fontWeight: 'bold',
                                fontSize: '1.2em',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                transition: 'background-color 0.3s ease',
                                ':hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }
                        }, render: () =>
                            <Tab.Pane>
                                <Form>
                                    <Segment stacked>
                                        {edit ?
                                            <h1>Edit Assignment</h1>
                                            :
                                            <h1>Create Assignment</h1>
                                        }
                                        <Form.Field
                                            control={Input}
                                            label='Project Name'
                                            value={ProjectName}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectName(ev.target.value)}
                                            style={{
                                                fontSize: '1.2em',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                                            }}
                                        />
                                        <Form.Group widths='equal'>
                                            <Form.Field
                                                control={Input}
                                                label='Start Date'
                                                type='datetime-local'
                                                value={ProjectStartDate}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectStartDate(ev.target.value)}
                                                style={{
                                                    fontSize: '1.2em',
                                                    padding: '10px',
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                                                }}
                                            />
                                            <Form.Field
                                                control={Input}
                                                label='End Date'
                                                type='datetime-local'
                                                value={ProjectEndDate}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectEndDate(ev.target.value)}
                                                style={{
                                                    fontSize: '1.2em',
                                                    padding: '10px',
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                                                }}
                                            />
                                        </Form.Group>
                                        <Form.Group inline>
                                            <Form.Field
                                                control={Dropdown}
                                                label='Language'
                                                selection
                                                search
                                                options={[
                                                    { key: 'java', text: 'Java', value: 'java' },
                                                    { key: 'racket', text: 'Racket', value: 'racket' },
                                                    { key: 'c', text: 'C', value: 'c' },
                                                    { key: 'python', text: 'Python', value: 'python' } // Added Python
                                                ]}
                                                value={ProjectLanguage}
                                                onChange={(ev: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => setProjectLanguage(data.value as string)}
                                            />
                                        </Form.Group>
                                        {
                                            edit ?
                                                <div>
                                                    <Segment>
                                                        <Header as='h2'>Change solution files</Header>
                                                        <Button as="label" htmlFor="file" primary>
                                                            Select File
                                                            <input id="file" type="file" hidden onChange={handleFileChange} />
                                                        </Button>
                                                        {solutionfileName !== "" && <Label as='a' color='blue' tag>{"Current file: " + solutionfileName}</Label>}
                                                    </Segment>
                                                    <Segment>
                                                        <Header as='h2'>Change assignment description file</Header>
                                                        <Button as="label" htmlFor="descFile" primary>
                                                            Select File
                                                            <input id="descFile" type="file" hidden onChange={handleDescFileChange} />
                                                        </Button>
                                                        {descfileName !== "" && <Label as='a' color='blue' tag>{"Current file: " + descfileName}</Label>}
                                                    </Segment>
                                                </div>
                                                :
                                                <div>
                                                    <Segment>
                                                        <Header as='h2'>Upload solution files</Header>
                                                        <Button as="label" htmlFor="file" primary>
                                                            Select File
                                                            <input id="file" type="file" hidden onChange={handleFileChange} />
                                                        </Button>
                                                        {solutionfileName !== "" && <Label as='a' color='blue' tag>{"Current file: " + solutionfileName}</Label>}
                                                    </Segment>
                                                    <Segment>
                                                        <Header as='h2'>Upload assignment description</Header>
                                                        <Button as="label" htmlFor="descFile" primary>
                                                            Select File
                                                            <input id="descFile" type="file" hidden onChange={handleDescFileChange} />
                                                        </Button>
                                                        {descfileName !== "" && <Label as='a' color='blue' tag>{"Current file: " + descfileName}</Label>}
                                                    </Segment>
                                                </div>
                                        }
                                    </Segment>
                                    <Form.Button
                                        onClick={edit ? handleEditSubmit : handleNewSubmit}
                                        style={{
                                            backgroundColor: '#4CAF50', // Green
                                            color: 'white',
                                            padding: '14px 20px',
                                            margin: '8px 0',
                                            border: 'none',
                                            cursor: 'pointer',
                                            width: '100%',
                                            opacity: '0.9'
                                        }}
                                    >
                                        {SubmitButton}
                                    </Form.Button>
                                </Form>
                            </Tab.Pane>
                    },
                    {
                        menuItem: {
                            key: 'testcases',
                            icon: 'clipboard check',
                            content: 'Test Cases',
                            style: {
                                color: '#007bff',
                                fontWeight: 'bold',
                                fontSize: '1.2em',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                transition: 'background-color 0.3s ease',
                                ':hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }
                        }, render: () =>
                            <Tab.Pane>
                                <Form
                                    style={{
                                        fontFamily: 'Arial, sans-serif',
                                        backgroundColor: '#f4f4f4',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        boxShadow: '0px 0px 10px 2px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <h1 style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Level 1:</h1>
                                    {testcases.map(testcase => {
                                        if (testcase.levelname === 'Level 1') {
                                            return (
                                                <Button
                                                    content={testcase.name}
                                                    onClick={() => handleOpenModal(testcase.id)}
                                                    style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px' }}
                                                />
                                            );
                                        }
                                    })}
                                    <Button
                                        color='green'
                                        icon='plus square'
                                        onClick={() => handleOpenModal(-1)}
                                        style={{ backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}
                                    />

                                    <h1 style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Level 2:</h1>
                                    {testcases.map(testcase => {
                                        if (testcase.levelname === 'Level 2') {
                                            return (
                                                <Button
                                                    content={testcase.name}
                                                    onClick={() => handleOpenModal(testcase.id)}
                                                    style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px' }}
                                                />
                                            );
                                        }
                                    })}
                                    <Button
                                        color='green'
                                        icon='plus square'
                                        onClick={() => handleOpenModal(-1)}
                                        style={{ backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}
                                    />

                                    <h1 style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Level 3:</h1>
                                    {testcases.map(testcase => {
                                        if (testcase.levelname === 'Level 3') {
                                            return (
                                                <Button
                                                    content={testcase.name}
                                                    onClick={() => handleOpenModal(testcase.id)}
                                                    style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px' }}
                                                />
                                            );
                                        }
                                    })}
                                    <Button
                                        color='green'
                                        icon='plus square'
                                        onClick={() => handleOpenModal(-1)}
                                        style={{ backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}
                                    />
                                    <br />
                                    <br />
                                </Form>
                                <Form>

                                    <Modal
                                        open={modalOpen}
                                        onClose={handleCloseModal}
                                        size="small"
                                        style={{
                                            fontFamily: 'Arial, sans-serif',
                                            backgroundColor: '#f4f4f4',
                                            boxShadow: '0px 0px 10px 2px rgba(0,0,0,0.1)',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <Modal.Header style={{ borderBottom: '1px solid #ddd', fontSize: '1.5em', padding: '15px' }}>Test Case Information</Modal.Header>
                                        <Modal.Content style={{ padding: '20px' }}>
                                            <Form>
                                                <Form.Input
                                                    label='Test Case Name'
                                                    value={selectedTestCase ? selectedTestCase.name : ''}
                                                    onChange={(e) => handleNameChange(selectedTestCaseId, e.target.value)}
                                                />
                                                <Form.TextArea
                                                    label='Input'
                                                    value={selectedTestCase ? selectedTestCase.input : ''}
                                                    onChange={(e) => handleInputChange(selectedTestCaseId, e.target.value)}
                                                />
                                                <Form.TextArea
                                                    label='Output'
                                                    readOnly
                                                    value={selectedTestCase ? selectedTestCase.output : ''}
                                                    onChange={(e) => handleOutputChange(selectedTestCaseId, e.target.value)}
                                                />
                                                <Grid>
                                                    <Grid.Column width={13}>
                                                        <Form.Field>
                                                            <label>Description</label>
                                                            <Form.TextArea
                                                                value={selectedTestCase ? selectedTestCase.description : ''}
                                                                onChange={(e) => handleDescriptionChange(selectedTestCaseId, e.target.value)}
                                                            />
                                                        </Form.Field>
                                                    </Grid.Column>
                                                    <Grid.Column width={3} verticalAlign="middle">
                                                        <Button primary onClick={() => handleAutoGenerateDescription(selectedTestCaseId)}>
                                                            <Icon name='magic' /> Auto-Generate Description
                                                        </Button>
                                                    </Grid.Column>
                                                </Grid>
                                                <Form.Checkbox
                                                    label='Hidden'
                                                    checked={selectedTestCase ? selectedTestCase.isHidden : false}
                                                    onChange={(e) => handleHiddenChange(selectedTestCaseId, true)}
                                                />
                                                <Form.Group inline>
                                                    <Form.Field
                                                        control={Radio}
                                                        label='Level 1'
                                                        name={selectedTestCaseId + "RadioGroup"}
                                                        value='Level 1'
                                                        checked={selectedTestCase ? selectedTestCase.levelname === "Level 1" : false}
                                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(selectedTestCaseId, 'Level 1')}
                                                    />
                                                    <Form.Field
                                                        control={Radio}
                                                        label='Level 2'
                                                        name={selectedTestCaseId + "RadioGroup2"}
                                                        value='Level 2'
                                                        checked={selectedTestCase ? selectedTestCase.levelname === 'Level 2' : false}
                                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(selectedTestCaseId, 'Level 2')}
                                                    />
                                                    <Form.Field
                                                        control={Radio}
                                                        label='Level 3'
                                                        name={selectedTestCaseId + "RadioGroup3"}
                                                        value='Level 3'
                                                        checked={selectedTestCase ? selectedTestCase.levelname === 'Level 3' : false}
                                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(selectedTestCaseId, 'Level 3')}
                                                    />
                                                </Form.Group>
                                                <Form.Field>
                                                    <Popup
                                                        content={
                                                            <Form>
                                                                <Form.Field>
                                                                    <label>The filename must align with the expected input for the solution code.</label>
                                                                    <input type="file" required onChange={handleAdditionalFileChange} />
                                                                </Form.Field>
                                                            </Form>
                                                        }
                                                        on='click'
                                                        pinned
                                                        trigger={<Button icon='file' content="Select optional additional file" />}
                                                    />
                                                </Form.Field>
                                                <Form.Field style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Form.Button
                                                        color='green'
                                                        onClick={() => buttonhandleClick(selectedTestCaseId)}
                                                        style={{
                                                            backgroundColor: '#34D399', // Tailwind CSS Green 400
                                                            color: 'white',
                                                            borderRadius: '8px', // Increased border radius
                                                            padding: '10px 20px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Added box shadow
                                                        }}
                                                    >
                                                        {selectedTestCaseId === -1 ? 'Submit new testcase' : 'Submit changes'}
                                                    </Form.Button>
                                                    {selectedTestCaseId !== -1 && (
                                                        <Form.Button
                                                            onClick={() => buttonhandleTrashClick(selectedTestCaseId)}
                                                            style={{
                                                                backgroundColor: '#EF4444', // Tailwind CSS Red 500
                                                                color: 'white',
                                                                borderRadius: '8px', // Increased border radius
                                                                padding: '10px 20px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '1rem',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Added box shadow
                                                                marginLeft: '10px' // Added margin to separate the buttons
                                                            }}
                                                            onMouseOver={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) => {
                                                                e.currentTarget.style.backgroundColor = '#DC2626'; // Tailwind CSS Red 600
                                                            }}
                                                            onMouseOut={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) => {
                                                                e.currentTarget.style.backgroundColor = '#EF4444'; // Tailwind CSS Red 500
                                                            }}
                                                        >
                                                            Remove Test Case
                                                        </Form.Button>
                                                    )}
                                                </Form.Field>

                                            </Form>
                                        </Modal.Content>
                                    </Modal>
                                </Form>

                                <Segment stacked style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)' }}>
                                    <h1 style={{ marginBottom: '20px' }}>Upload Test Cases</h1>
                                    <Button as="label" htmlFor="file" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
                                        Select Json File
                                        <input id="file" type="file" hidden required={true} onChange={handleJsonFileChange} />
                                    </Button>
                                    {jsonfilename !== "" && <Label as='a' color='blue' tag>{"Current file: " + jsonfilename}</Label>}
                                </Segment>
                                <Button.Group>
                                    <Form.Button onClick={handleJsonSubmit}>{SubmitJSON}</Form.Button>
                                    <div style={{ marginLeft: '10px', marginRight: '10px' }}></div>
                                    <Form.Button color={'orange'} onClick={get_testcase_json}>{getJSON}</Form.Button>
                                </Button.Group>

                                <Grid style={{ marginTop: '20px' }}>
                                    <Grid.Row>
                                        <Grid.Column width={8}>
                                            <Segment>
                                                <Grid>
                                                    <Grid.Row>
                                                        <Grid.Column width={8}>
                                                            <h2>Level 1: Base Cases (Simple Cases)</h2>
                                                            <List bulleted>
                                                                <List.Item>Test basic functionality with simple inputs.</List.Item>
                                                            </List>
                                                        </Grid.Column>
                                                        <Grid.Column width={8}>
                                                            <h2>Level 3: Edge Cases (Boundary and Extreme Cases)</h2>
                                                            <List bulleted>
                                                                <List.Item>Test less common or extreme situations.</List.Item>
                                                            </List>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </Segment>
                                        </Grid.Column>

                                        <Grid.Column width={8}>
                                            <Segment>
                                                <Grid>
                                                    <Grid.Row>
                                                        <Grid.Column width={8}>
                                                            <h2>Level 2: Main Functionality Cases</h2>
                                                            <List bulleted>
                                                                <List.Item>Test core features and main tasks.</List.Item>
                                                                <List.Item>Use a variety of inputs, positive/negative scenarios.</List.Item>
                                                            </List>
                                                        </Grid.Column>
                                                        <Grid.Column width={8}>
                                                            <h2>General Best Practices for Test Cases:</h2>
                                                            <List bulleted>
                                                                <List.Item>Clear and descriptive names.</List.Item>
                                                                <List.Item>Complete coverage with representative cases.</List.Item>
                                                                <List.Item>Descriptions are robust for students</List.Item>
                                                            </List>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </Segment>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Tab.Pane>
                    }
                ]
                }
            />
        </div>
    )
}

export default AdminProjectConfigComponent;