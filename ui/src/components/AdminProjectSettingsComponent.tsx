import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Dropdown, Form, Input } from "semantic-ui-react";

interface AdminProjectConfigProps {
    id: number
    class_id: number  
}

const AdminProjectSettingsComponent = (props: AdminProjectConfigProps) => {
    const [CreateNewState,setCreateNewState] = useState<boolean>(props.id == -1);
    const [ProjectName,setProjectName] = useState<string>("");
    const [ProjectStartDate,setProjectStartDate] = useState<string>("");
    const [ProjectEndDate,setProjectEndDate] = useState<string>("");
    const [ProjectLanguage,setProjectLanguage] = useState<string>("");
    const [SubmitButton,setSubmitButton] = useState<string>("Submit Changes");
    
        useEffect(() => {
            if(CreateNewState){
                setSubmitButton("Submit New Assignment");
            }
            if(!CreateNewState) {
                axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_project_id?id=${props.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                    }
                })
                .then(res => {
                    var data = res.data
                    if(!CreateNewState){
                    setProjectName(data.name);
                    setProjectStartDate(data.start_date);
                    setProjectEndDate(data.end_date);
                    setProjectLanguage(data.language);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }, [])
    
    function projectSettingsSubmit() {
        if(!CreateNewState){
            const formData = new FormData();
            formData.append("name", ProjectName.toString());
            formData.append("start_date", ProjectStartDate.toString());
            formData.append("end_date", ProjectEndDate.toString());
            formData.append("language", ProjectLanguage.toString());
            axios.post(process.env.REACT_APP_BASE_API_URL + `/projects/edit_project?id=${props.id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
            }).then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            const formData = new FormData();
            formData.append("name", ProjectName.toString());
            formData.append("start_date", ProjectStartDate.toString());
            formData.append("end_date", ProjectEndDate.toString());
            formData.append("language", ProjectLanguage.toString());
            axios.post(process.env.REACT_APP_BASE_API_URL + '/projects/create_project', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
            }).then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    return (
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
            type='datetime-local'
            value={ProjectStartDate}
            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setProjectStartDate(ev.target.value)}
            >
            </Form.Field>
            <Form.Field
            control={Input}
            label='End Date'
            type='datetime-local'
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
        <Form.Button onClick={projectSettingsSubmit}>{SubmitButton}</Form.Button>
    </Form>
    )
}

export default AdminProjectSettingsComponent;