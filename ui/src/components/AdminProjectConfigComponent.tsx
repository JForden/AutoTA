import { Component, useEffect, useState, useReducer } from 'react';
import { Image, Grid, Tab, Dropdown, Form, Input, Radio, Button, Icon, TextArea, Label, Checkbox, Table, Header, Segment, Popup } from 'semantic-ui-react'
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
    class_id : number
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
    }

    id: number;
    name: string;
    levelid: number;
    description: string;
    input: string;
    output: string;
    isHidden: boolean;
    levelname: string
}

const AdminProjectConfigComponent = (props: AdminProjectConfigProps) => {
    const [CreateNewState, setCreateNewState] = useState<boolean>();
    const [testcases, setTestcases] = useState<Array<Testcase>>([]);
    const [checked, setChecked] = useState<string>("Level 1");
    const [ProjectName,setProjectName] = useState<string>("");
    const [ProjectStartDate,setProjectStartDate] = useState<string>("");
    const [ProjectEndDate,setProjectEndDate] = useState<string>("");
    const [ProjectLanguage,setProjectLanguage] = useState<string>("");
    const [SubmitButton,setSubmitButton] = useState<string>("Create new assignment");
    const [SubmitJSON, setSubmitJSON] = useState<string>("Submit .JSON file");
    const [getJSON, setGetJSON] = useState<string>("Export test cases");
    const [File, setFile] = useState<File>();
    const [AssignmentDesc, setDesc] = useState<File>();
    const [edit, setEdit] =useState<boolean>(false);
    const [selectedAddFile, setSelectedAddFile] = useState<File>();

   
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
                    testcase.levelname = values[6]

                    
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

                rows.push(testcase);

                setTestcases(rows);
            })
            .catch(err => {
                console.log(err);
            });
        if(!CreateNewState && props.id!=0 ) {
            axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_project_id?id=${props.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
            })
            .then(res => {
                var data = res.data
                console.log(data);
                if(!CreateNewState){
                setProjectName(data[props.id][0]);
                setProjectStartDate(data[props.id][1]);
                setProjectEndDate(data[props.id][2]);
                setProjectLanguage(data[props.id][3]);
                setEdit(true);
                setSubmitButton("Submit changes");
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
    }, [])



    function handleNameChange(testcase_id:number, name: string){
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].name = name;
                setTestcases(new_testcases);
                break;
            }
        }   
    }

    function handleDescriptionChange(testcase_id:number, description: string){
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].description = description;
                setTestcases(new_testcases);
                break;
            }
        }   
    }

    function handleHiddenChange(testcase_id:number, checked: boolean){
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].isHidden = !new_testcases[i].isHidden;
                setTestcases(new_testcases);
                break;
            }
        }   
    }

    
    function handleLevelChange(testcase_id:number, level: string){
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                
                new_testcases[i].levelname = level;
                setTestcases(new_testcases);
                
                break;
            }
        }
        
    }
    function handleInputChange(testcase_id:number, input_data: string){
        let new_testcases = [...testcases];

        for (var i = 0; i < new_testcases.length; i++) {
            if (new_testcases[i].id === testcase_id) {
                new_testcases[i].input = input_data;
                setTestcases(new_testcases);
                break;
            }
        }
    }

    function handleOutputChange(testcase_id:number, output_data: string){
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
    }

    function handlesubmit(){
        console.log(ProjectStartDate);
        console.log(ProjectEndDate);
    }

    function reloadtests(){
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
                    testcase.levelname = values[6]
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

                rows.push(testcase);

                setTestcases(rows)
            })
            .catch(err => {
                console.log(err);
            });
    }
    function handleJsonSubmit(){
        const formData = new FormData();
        formData.append("file",File!);
        formData.append("project_id",props.id.toString());
        formData.append("class_id",props.class_id.toString());
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

    function handleNewSubmit(){
        console.log("in new submit");
        const formData = new FormData();
        formData.append("file",File!);
        formData.append("assignmentdesc", AssignmentDesc!);
        formData.append("name",ProjectName);
        formData.append("start_date",ProjectStartDate);
        formData.append("end_date",ProjectEndDate);
        formData.append("language",ProjectLanguage);
        formData.append("class_id",props.class_id.toString());
        if(ProjectName === "" || ProjectStartDate === "" || ProjectEndDate === "" || ProjectLanguage === ""){
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
            console.log(data[0]);
            console.log("/admin/project/edit/"+data);
            window.location.href ="/admin/project/edit/"+props.class_id+"/"+data;
        }).catch(function (error) {
            console.log(error);
        });
    }
    function handleEditSubmit(){
        console.log(edit);
        const formData = new FormData();
        formData.append("id",props.id.toString());
        formData.append("file",File!);
        formData.append("assignmentdesc", AssignmentDesc!);
        formData.append("name",ProjectName);
        formData.append("start_date",ProjectStartDate);
        formData.append("end_date",ProjectEndDate);
        formData.append("language",ProjectLanguage);
        formData.append("class_id",props.class_id.toString());
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/edit_project`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
        .then(res => {
            var data = res.data;
            window.location.href ="/admin/project/edit/"+props.class_id+"/"+props.id;
        }).catch(function (error) {
            console.log(error);
        });
    }



    function handleFileChange(event : React.FormEvent) {
    
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if(files != null && files.length === 1){
            // Update the state
            setFile(files[0]);
        } else {
            setFile(undefined);
        }
    }; 

    function handleDescFileChange(event : React.FormEvent) {
    
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if(files != null && files.length === 1){
            // Update the state
            setDesc(files[0]);
        } else {
            setDesc(undefined);
        }
    };

    function handleAdditionalFileChange(event : React.FormEvent) {
        
            const target = event.target as HTMLInputElement;
            const files = target.files;
    
            if(files != null && files.length === 1){
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
        if (selectedAddFile !== undefined){
            formData.append('additionalFile', selectedAddFile!);
        }
    
        if(test.name === "" || test.levelname === "" || test.input === "" ||  test.description === ""){
            window.alert("Please fill out all fields");
            return;
        } 
        axios.post(process.env.REACT_APP_BASE_API_URL + '/projects/add_or_update_testcase', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        }).then(function (response) {
            reloadtests();
        }).catch(function (error) {
            console.log(error);
        });
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
              testcase.levelname = values[6]
      
              rows.push(testcase);
      
              return testcase;
            });
            const fileContent = JSON.stringify(rows, null, 2);
            const fileName = ProjectName+'.json';
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
    
    return (
    <div style={{ height: "80%" }}>
            <Tab
                style={{ width: '100%', height: '200%' }}
                menu={{ vertical: true, secondary: true, tabular: true }}
                grid={{ paneWidth: 14, tabWidth: 2 }}
                menuPosition='left'
                panes={[
                    {
                        menuItem: { key: 'psettings', icon: 'pencil alternate', content: 'Project Settings', }, render: () =>
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
                                >
                                </Form.Field>
                                <Form.Group widths={'equal'}>
                                    <Form.Field
                                    control={Input}
                                    label='Start Date'
                                    type='string'
                                    placeholder= "2022-08-25 08:01:00"
                                    value={ProjectStartDate}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectStartDate(ev.target.value)}
                                    >
                                    </Form.Field>
                                    <Form.Field
                                    control={Input}
                                    label='End Date'
                                    placeholder = "2022-08-25 08:01:00"
                                    type='string'
                                    value={ProjectEndDate}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectEndDate(ev.target.value)}
                                    >
                                    </Form.Field>
                                </Form.Group>
                                <Form.Group inline>
                                <label>Language</label>
                                <Form.Field
                                    label='Python'
                                    control='input'
                                    type='radio'
                                    name='htmlRadios'
                                    value='python'
                                    checked={ProjectLanguage === 'python'}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectLanguage(ev.target.value)}
                                />
                                <Form.Field
                                    label='Java'
                                    control='input'
                                    type='radio'
                                    name='htmlRadios'
                                    value='java'
                                    checked={ProjectLanguage === 'java'}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectLanguage(ev.target.value)}
                                />
                                <Form.Field
                                    label='Racket'
                                    control='input'
                                    type='radio'
                                    name='htmlRadios'
                                    value='racket'
                                    checked={ProjectLanguage === 'racket'}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectLanguage(ev.target.value)}
                                />
                                <Form.Field
                                    label='C'
                                    control='input'
                                    type='radio'
                                    name='htmlRadios'
                                    value='c'
                                    checked={ProjectLanguage === 'c'}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectLanguage(ev.target.value)}
                                />
                                </Form.Group>
                                    {
                                        edit ?
                                        <div>
                                        <h1>change solution files</h1>
                                        <Form.Input type="file" fluid onChange={handleFileChange} />
                                        <br></br>
                                        <h1>change assignment description file</h1>
                                        <Form.Input type="file" fluid onChange={handleDescFileChange} />
                                        <br></br>
                                        </div>
                                        :
                                        <div>
                                            <h1>upload solution files</h1>
                                            <Form.Input type="file" fluid onChange={handleFileChange} />
                                            <br></br>
                                            <h1>upload assignment description</h1>
                                            <Form.Input type="file" fluid onChange={handleDescFileChange} />
                                            <br></br>

                                        </div>
                                    }
                                </Segment>
                                <Form.Button onClick={edit ?  handleEditSubmit  : handleNewSubmit}>{SubmitButton}</Form.Button>
                            </Form>
                            </Tab.Pane>
                    },
                    {
                        menuItem: { key: 'testcases', icon: 'clipboard check', content: 'Test Cases' }, render: () => 
                        <Tab.Pane>
                            <Form>
                            {testcases.map(testcase => {
                                return (
                                    <Form.Group inline>
                                        <Form.Field
                                            control={Input}
                                            label='Test Case Name'
                                            placeholder="Please Enter Name"
                                            value={testcase.name}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleNameChange(testcase.id, ev.target.value)}
                                        >
                                        </Form.Field>
                                        {/*<h5 style={{ height: '3.5vh' }}>Input:  </h5>*/}
                                        <Form.Field
                                            control={TextArea}
                                            label='Input'
                                            rows={1}
                                            placeholder="Please Enter Input"
                                            value={testcase.input}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(testcase.id, ev.target.value)}
                                        >
                                        </Form.Field>
                                        <Form.Field
                                            control={TextArea}
                                            label='Output'
                                            rows={1}
                                            placeholder="Add test case to see output"
                                            value={testcase.output}
                                            style={testcase.output === "" ? {backgroundColor: "lightgray"} : {}}
                                            readOnly={true}
                                            //onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleOutputChange(testcase.id, ev.target.value)}
                                        >
                                        </Form.Field>
                                        <Form.Field
                                            control={Input}
                                            label='Description'
                                            placeholder="Please Enter Description"
                                            value={testcase.description}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleDescriptionChange(testcase.id, ev.target.value)}
                                        />
                                        <Form.Field
                                        control={Checkbox}
                                        name= {testcase.id  + "RadioGroup4"}
                                        label='Hidden'
                                        checked={testcase.isHidden}
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleHiddenChange(testcase.id, true)}
                                        />
                                        <Form.Group inline>
                                            <Form.Field
                                                control={Radio}
                                                label='Level 1'
                                                name= {testcase.id  + "RadioGroup"}
                                                value='Level 1'
                                                checked={testcase.levelname === "Level 1"}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(testcase.id, 'Level 1')}
                                            />
                                            <Form.Field
                                                control={Radio}
                                                label='Level 2'
                                                name={testcase.id  + "RadioGroup2"}
                                                value='Level 2'
                                                checked={testcase.levelname === 'Level 2'}                                             
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(testcase.id, 'Level 2')}
                                            />
                                            <Form.Field
                                                control={Radio}
                                                label='Level 3'
                                                name={testcase.id  + "RadioGroup3"}
                                                value='Level 3'
                                                checked={testcase.levelname === 'Level 3'}                                              
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleLevelChange(testcase.id, 'Level 3')}
                                            />
                                        </Form.Group>
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
                                        <Form.Button onClick={() => buttonhandleClick(testcase.id)}>Submit testcase</Form.Button>
                                        <Form.Button onClick={() => buttonhandleTrashClick(testcase.id)}>Remove Test Case</Form.Button>
                                    </Form.Group>
                                );  
                            })}
                            </Form>
                            <Segment stacked>
                                    <h1>Upload Test Cases</h1>
                                    <Form.Input type="file" fluid required={true} onChange={handleFileChange} />
                                    <br></br>
                            </Segment>
                            <Button.Group>
                            <Form.Button onClick={handleJsonSubmit}>{SubmitJSON}</Form.Button>
                            <div style={{ marginLeft: '10px', marginRight: '10px' }}></div>
                            <Form.Button color={'green'} onClick={get_testcase_json}>{getJSON}</Form.Button>
                            </Button.Group>
                            <Grid>
                            <Grid.Row>
                            <Grid.Column width={8}>
                                <h2>Level 1: Base Cases (Simple Cases)</h2>
                                <ul>
                                <li>Test basic functionality with simple inputs.</li>
                                </ul>
                                <h2>Level 2: Main Functionality Cases</h2>
                                <ul>
                                <li>Test core features and main tasks.</li>
                                <li>Use a variety of inputs, positive/negative scenarios.</li>
                                </ul>
                            </Grid.Column>

                            <Grid.Column width={8}>
                                <h2>Level 3: Edge Cases (Boundary and Extreme Cases)</h2>
                                <ul>
                                <li>Test less common or extreme situations.</li>
                                </ul>
                                <h2>General Best Practices for Test Cases:</h2>
                                <ul>
                                <li>Clear and descriptive names.</li>
                                <li>Complete coverage with representative cases.</li>
                                <li>Descriptions are robust for students</li>
                                </ul>
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