import { Component, FormEvent, SyntheticEvent } from 'react';
import 'semantic-ui-css/semantic.min.css'
import '../css/AdminComponent.scss'
import { Button, Dropdown, DropdownProps, Form, Segment } from 'semantic-ui-react';
import axios from 'axios';

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
    class_id:number,
    project_name: string,
    project_id: number,
    end: string,
    classlist: Array<DropDownOption>,
    studentList: Array<DropDownOption>,
    projects: Array<DropDownOption>,
    student_id:number,
    class_selected: boolean,

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
            class_id:0,
            end: "",
            classlist:[],
            studentList: [],
            projects: [],
            class_selected: false,

        };
    
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleProjectIdChange = this.handleProjectIdChange.bind(this);
        this.handleStudentIdChange = this.handleStudentIdChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleClassIdChange = this.handleClassIdChange.bind(this);
    }

    handleStudentIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
        this.setState({ student_id: value.value ? parseInt(value.value.toString()) : -1 });
    }
    handleProjectIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
        this.setState({ project_id: value.value ? parseInt(value.value.toString()) : -1 });
    }
    handleClassIdChange(ev: SyntheticEvent<HTMLElement, Event>, value: DropdownProps){
        this.setState({isLoading:true});

        this.setState({ class_id: value.value ? parseInt(value.value.toString()) : -1 });
        this.setState({class_selected: true});

        var cid = value.value?.toString();
        axios.get(process.env.REACT_APP_BASE_API_URL + `/upload/total_students_by_cid?class_id=${cid}`, {
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
            this.setState({ studentList: studentsDropdown });

        })
        .catch(err => {
            this.setState({ error_message: err.response.data.message});
            this.setState({ isErrorMessageHidden: false, isLoading: false });
        });
        
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/get_projects_by_class_id?id=${cid}`, {
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
            this.setState({ projects: projectDropdown });
        })
        .catch(err => {
            console.log(err);
        });

        this.setState({isLoading:false});
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
            })
        .then(res => {
            var classes = res.data as Array<Student>;
            var classesDropdown = [];
            for(let i=0; i< classes.length;i++){
                classesDropdown.push({ key: classes[i].id, text: classes[i].name, value: classes[i].id });
            }
            this.setState({ classlist: classesDropdown });

        })
        .catch(err => {
            this.setState({ error_message: err.response.data.message});
            this.setState({ isErrorMessageHidden: false, isLoading: false });
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
            formData.append("class_id", "" +this.state.class_id);
            // Request made to the backend api
            // Send formData object
            axios.post(process.env.REACT_APP_BASE_API_URL + `/upload/`, formData,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
                }
              })
            .then(res => {
                window.location.href = "/class/" + this.state.class_id.toString()+ "/code/" + res.data.sid.toString();
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
            <p>Please select a class</p>
            <Dropdown
                placeholder='Select class'
                fluid
                search
                selection
                options={this.state.classlist}
                onChange={this.handleClassIdChange}
            />
            {
                this.state.class_selected ?
                <div>
                    <div>
                    &nbsp;
                    </div>
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
                :
                <div></div>
            }
        </div>
        );
  }
}

export default AdminUploadPage;