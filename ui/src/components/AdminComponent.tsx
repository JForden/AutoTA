import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import axios from 'axios';
import { Table, Label, Button, Popup, Grid, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { parse } from 'path';
import internal from 'stream';

interface ProjectObject {
  Id: number;
  Name: string;
  Start: string;
  End: string;
  TotalSubmissions: number;
}

interface ProjectsState {
  projects: ProjectObject[];
  classId: string;
  open: boolean;
}



interface AdminComponentProps extends RouteComponentProps<{ id: string }> {}

class AdminComponent extends Component<AdminComponentProps, ProjectsState> {
  constructor(props: AdminComponentProps) {
    super(props);
    this.state = {
      projects: [],
      classId: props.match.params.id,
      open:false,
    };
  }
  
  componentDidMount() {
    const classId = this.props.match.params.id;
    axios
      .get(
        `${process.env.REACT_APP_BASE_API_URL}/projects/get_projects_by_class_id?id=${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'AUTOTA_AUTH_TOKEN'
            )}`,
          },
        }
      )
      .then((res) => {
        const projects = res.data.map((str: any) => JSON.parse(str) as ProjectObject);
        this.setState({ projects });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  
  

  private handleDelete(projectId: number){
    axios.delete(`${process.env.REACT_APP_BASE_API_URL}/projects/delete_project?id=${projectId}`, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
      })
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
  }
  private handleRefresh(projectId: number){
    axios.delete(`${process.env.REACT_APP_BASE_API_URL}/projects/reset_project?id=${projectId}`, {
      headers: {
          'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
      })
        .then((res) => {
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
  }
    render(){
        return (
            <>
            
            <Table celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Project Name</Table.HeaderCell>
                    <Table.HeaderCell>Project Start Date</Table.HeaderCell>
                    <Table.HeaderCell>Project End Date</Table.HeaderCell>
                    <Table.HeaderCell>Total Submissions</Table.HeaderCell>
                    <Table.HeaderCell>Project View</Table.HeaderCell>
                    <Table.HeaderCell>Project Modification</Table.HeaderCell>

                </Table.Row>
                </Table.Header>
                <Table.Body>
                {(() => {
                    const holder = [];
                    for (let index = this.state.projects.length-1; index >= 0; index--) {
                        holder[index] = ( 
                                <Table.Row>
                                    <Table.Cell>{this.state.projects[index].Name}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].Start}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].End}</Table.Cell>
                                    <Table.Cell>{this.state.projects[index].TotalSubmissions}</Table.Cell>
                                    <Table.Cell><Button as={Link} to={"/admin/project/"+this.state.projects[index].Id}>View</Button></Table.Cell>
                                    <Table.Cell><Button icon='edit' as={Link} to={"/admin/project/edit/" + this.state.classId + "/" + this.state.projects[index].Id}  />
                                    <Button icon='refresh' onClick={() => this.handleRefresh(this.state.projects[index].Id)} />
                                    <Popup trigger={<Button>delete project</Button>} flowing hoverable>
                                    <Grid centered divided columns={1}>
                                      <Grid.Column textAlign='center'>
                                        <Header as='h4'>confirm delete project</Header>
                                        <Button icon='trash' onClick={() => this.handleDelete(this.state.projects[index].Id)}>delete</Button>
                                      </Grid.Column>
                                    </Grid>
                                  </Popup>
                                    </Table.Cell>
                                </Table.Row>
                                );
                    }
                    return holder;
                })()}
                
                </Table.Body>
            </Table>
            <Button
                as={Link}
                to={"/admin/project/edit/" + this.state.classId + "/0"}
                content="Create new assignment"
                primary
            />
            </>);
    }
}

export default AdminComponent;