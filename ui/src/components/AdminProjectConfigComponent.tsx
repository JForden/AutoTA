import { Component, useEffect, useState, useReducer } from 'react';
import { Image, Grid, Tab, Dropdown, Form, Input, Radio, Button, Icon, TextArea, Label, Checkbox, Table, Header, Segment } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { DropdownItemProps } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import codeimg from '../codeex.png'
import axios from 'axios';
import { textSpanEnd } from 'typescript';
import AdminProjectSettingsComponent from './AdminProjectSettingsComponent';
import { useParams } from 'react-router-dom';
import { StyledIcon } from '../styled-components/StyledIcon';

interface AdminProjectConfigProps {
    id: number,
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
    const [SubmitButton,setSubmitButton] = useState<string>("Submit Changes");
    const [File, setFile] = useState<File>();

   
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

                setTestcases(rows)
            })
            .catch(err => {
                console.log(err);
            });
        if(CreateNewState){
            setSubmitButton("Submit New Assignment");
        }
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
                console.log("Here is the dataname");
                console.log(data[props.id][0]);
                setProjectStartDate(data[props.id][1] +"00");
                setProjectEndDate(data[props.id][2]+"00");
                setProjectLanguage("python");
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
    function handleNewSubmit(){
        const formData = new FormData();
        formData.append("file",File!);
        formData.append("name",ProjectName);
        formData.append("start_date",ProjectStartDate);
        formData.append("end_date",ProjectEndDate);
        formData.append("language",ProjectLanguage);
        axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/create_project`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
        .then(res => {
            var data = res.data;
            console.log(data[0]);
            console.log("/admin/project/edit/"+data);
            window.location.href ="/admin/project/edit/"+data;
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

    return (
    <div style={{ height: "80%" }}>
            <Tab
                style={{ width: '100%', height: '100%' }}
                menu={{ vertical: true, secondary: true, tabular: true }}
                grid={{ paneWidth: 14, tabWidth: 2 }}
                menuPosition='left'
                panes={[
                    {
                        menuItem: { key: 'psettings', icon: 'pencil alternate', content: 'Project Settings', }, render: () =>
                            <Tab.Pane>
                                <Form>
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
                                    value={ProjectStartDate}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectStartDate(ev.target.value)}
                                    >
                                    </Form.Field>
                                    <Form.Field
                                    control={Input}
                                    label='End Date'
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
                                </Form.Group>
                                <Segment stacked>
                                    <h1>upload solution code</h1>
                                    <Form.Input type="file" fluid required onChange={handleFileChange} />
                                    <br></br>
                                </Segment>
                                <Form.Button onClick={handleNewSubmit}>{SubmitButton}</Form.Button>
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
                                        <h5 style={{ height: '3.5vh' }}>Input:  </h5>
                                        <Form.Field
                                            control={TextArea}
                                            rows={1}
                                            placeholder="Please Enter Input"
                                            value={testcase.input}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => handleInputChange(testcase.id, ev.target.value)}
                                        >
                                        </Form.Field>
                                        <Form.Field
                                            control={TextArea}
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
                                            label='Description:'
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
                                        <Form.Button onClick={() => buttonhandleClick(testcase.id)}>Submit testcase</Form.Button>
                                        <Form.Button onClick={() => buttonhandleTrashClick(testcase.id)}>Remove Test Case</Form.Button>
                                    </Form.Group>
                                );  
                            })}
                            </Form>
                        </Tab.Pane>
                    },
                ]}

            />
        </div>
        
    
    
    

    
    
    
    )
}

export default AdminProjectConfigComponent;