import { Component, FormEvent, SyntheticEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/AdminComponent.scss'
import { Button, Dropdown, DropdownProps, Form, Segment } from 'semantic-ui-react';
import axios from 'axios';

const countryOptions = [
    { key: 'af', value: 'af', flag: 'af', text: 'Afghanistan' },
    { key: 'ax', value: 'ax', flag: 'ax', text: 'Aland Islands' },
    { key: 'al', value: 'al', flag: 'al', text: 'Albania' },
    { key: 'dz', value: 'dz', flag: 'dz', text: 'Algeria' },
    { key: 'as', value: 'as', flag: 'as', text: 'American Samoa' },
    { key: 'ad', value: 'ad', flag: 'ad', text: 'Andorra' },
    { key: 'ao', value: 'ao', flag: 'ao', text: 'Angola' },
    { key: 'ai', value: 'ai', flag: 'ai', text: 'Anguilla' },
    { key: 'ag', value: 'ag', flag: 'ag', text: 'Antigua' },
    { key: 'ar', value: 'ar', flag: 'ar', text: 'Argentina' },
    { key: 'am', value: 'am', flag: 'am', text: 'Armenia' },
    { key: 'aw', value: 'aw', flag: 'aw', text: 'Aruba' },
    { key: 'au', value: 'au', flag: 'au', text: 'Australia' },
    { key: 'at', value: 'at', flag: 'at', text: 'Austria' },
    { key: 'az', value: 'az', flag: 'az', text: 'Azerbaijan' },
    { key: 'bs', value: 'bs', flag: 'bs', text: 'Bahamas' },
    { key: 'bh', value: 'bh', flag: 'bh', text: 'Bahrain' },
    { key: 'bd', value: 'bd', flag: 'bd', text: 'Bangladesh' },
    { key: 'bb', value: 'bb', flag: 'bb', text: 'Barbados' },
    { key: 'by', value: 'by', flag: 'by', text: 'Belarus' },
    { key: 'be', value: 'be', flag: 'be', text: 'Belgium' },
    { key: 'bz', value: 'bz', flag: 'bz', text: 'Belize' },
    { key: 'bj', value: 'bj', flag: 'bj', text: 'Benin' },
  ]


interface Student {
    name: string,
    mscsnet: string,
    id: number 
}

interface DropDownOption {
    key: number,
    value: number,
    text: string
}

interface UploadPageState {
    file?: File,
    isLoading:boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    end: string,
    studentList: Array<DropDownOption>,
    projects: Array<DropDownOption>,
    student_id:number
}

interface ProjectObject {
    Id: number,
    Name: string,
    Start:string,
    End:string,
    TotalSubmissions:number
}


class AdminUploadPage extends Component<{}, UploadPageState> {

    constructor(props: any){
        super(props);
        this.state = {
            isLoading: false,
            error_message: '',
            isErrorMessageHidden: true,
            project_name: "",
            project_id: 0,
            student_id:0,
            end: "",
            studentList: [],
            projects: [],

        };
    
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleProjectIdChange = this.handleProjectIdChange.bind(this);
        this.handleStudentIdChange = this.handleStudentIdChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleStudentIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
        this.setState({ student_id: value.value ? parseInt(value.value.toString()) : -1 });
    }
    handleProjectIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
        this.setState({ project_id: value.value ? parseInt(value.value.toString()) : -1 });
    }
    
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/upload/total_students`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            var students = res.data as Array<Student>;
            var studentsDropdown = [];
            for(let i=0; i< students.length;i++){
                studentsDropdown.push({ key: students[i].id, text: students[i].name +"("+students[i].mscsnet+")", value: students[i].id });
            }
            console.log(studentsDropdown);
            this.setState({ studentList: studentsDropdown });

        })
        .catch(err => {
            this.setState({ error_message: err.response.data.message});
            this.setState({ isErrorMessageHidden: false, isLoading: false });
        });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/all_projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            let projects: Array<ProjectObject> = [];
            res.data.forEach((str: any) => {
                projects.push(JSON.parse(str) as ProjectObject);
            });
            
            var projectDropdown = [];
            for(let i=0; i< projects.length;i++){
                projectDropdown.push({ key: projects[i].Id, text: projects[i].Name, value: projects[i].Id });
            }
            console.log(projectDropdown);
            this.setState({ projects: projectDropdown });
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    handleFileChange(event : React.FormEvent) {
    
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if(files != null && files.length === 1){
            // Update the state
            this.setState({ file: files[0] });
        } else {
            this.setState({ file: undefined });
        }
      
    }; 
    
    handleSubmit() {
        if (this.state.file !== undefined) {
            this.setState({ isErrorMessageHidden: true });
            this.setState({isLoading: true});
            // Create an object of formData
            const formData = new FormData();
        
            // Update the formData object
            formData.append(
                "file",
                this.state.file,
                this.state.file.name
            );
            
            formData.append("student_id", "" + this.state.student_id);
            formData.append("project_id", "" + this.state.project_id);
            // Request made to the backend api
            // Send formData object
            axios.post(process.env.REACT_APP_BASE_API_URL + `/upload/`, formData,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
              })
            .then(res => {
                window.location.href = "/code";
            })
            .catch(err => {
                this.setState({ error_message: err.response.data.message});
                this.setState({ isErrorMessageHidden: false, isLoading: false });
            })
        }
    }
    render() {
        return (
        <div>
            <p>Please select a student</p>
            <Dropdown
                placeholder='Select Student'
                fluid
                search
                selection
                options={this.state.studentList}
                onChange={this.handleStudentIdChange}
            />
            <div>
            &nbsp;
            </div>
            <p>Please select a project</p>
            <Dropdown
                placeholder='Select Project'
                fluid
                search
                selection
                options={this.state.projects}
                onChange={this.handleProjectIdChange}
            />
            <div>
            &nbsp;
            </div>
            <Form loading={this.state.isLoading} size='large' onSubmit={this.handleSubmit} disabled={true}>
            <Segment stacked>
                <h1>Upload Assignment Here</h1>
                <Form.Input type="file" fluid required onChange={this.handleFileChange} />
                <Button type="submit" color='blue' fluid size='large'>
                    Upload
                </Button>
                <br></br>
                </Segment>
            </Form>
        </div>
        );
  }
}

export default AdminUploadPage;