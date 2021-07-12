import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

interface ProjectObject {
    Id: number,
    Name: string,
    Start:string,
    End:string,
    TotalSubmissions:number
}

interface ProjectsState {
    projects: Array<ProjectObject>
}


class AdminComponent extends Component<{}, ProjectsState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            projects: []
        }
    }
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/all_projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            let arr: Array<ProjectObject> = [];
            res.data.forEach((str: any) => {
                arr.push(JSON.parse(str) as ProjectObject);
            });
            this.setState({projects: arr });
        })
        .catch(err => {
            console.log(err);
        });
    }
    handleClassClick(id: number){
        var url=`project/${id}`
        window.location.href = url;
    }

    render(){
        return (
            <Table celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Project Name</Table.HeaderCell>
                    <Table.HeaderCell>Project Start Date</Table.HeaderCell>
                    <Table.HeaderCell>Project End Date</Table.HeaderCell>
                    <Table.HeaderCell>Total Submissions</Table.HeaderCell>.
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {(() => {
                    const holder = [];
                    for (let index = this.state.projects.length-1; index >= 0; index--) {
                        holder[index] = ( 
                                <Table.Row>
                                    <Table.Cell><Link to={ "project/" + this.state.projects[index].Id }><Label button>{this.state.projects[index].Name}</Label></Link></Table.Cell>
                                    <Table.Cell>{this.state.projects[index].Start}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].End}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].TotalSubmissions}</Table.Cell>
                                </Table.Row>
                                );
                    }

                    return holder;
                })()}
                
                </Table.Body>
            </Table>
        );
    }
}

export default AdminComponent;