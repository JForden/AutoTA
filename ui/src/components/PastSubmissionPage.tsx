import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import '../css/AdminComponent.scss'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import { Helmet } from 'react-helmet';

class Row {
    constructor() {
        this.id = 0;
        this.project_name = "";
        this.score = 0;
        this.date = "";
    }
    
    id: number;
    project_name: string;
    score: number;
    date: string;
}

interface ProjectsState {
    rows: Array<Row>
}


class PastSubmissionPage extends Component<{}, ProjectsState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            rows: []
        }
    }
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/projects/projects-by-user`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            var data = res.data
            // Read it
            var rows: Array<Row> = [];
            Object.entries(data).map( ([key, value]) => {
                var row = new Row();
                var test = (value as Array<string>);
                row.project_name = key;
                row.id = parseInt(test[0]);
                row.score = parseInt(test[1]);
                row.date = test[2];
                rows.push(row);
                
                return row;
            });

            this.setState({ rows: rows });
        })
        .catch(err => {
            console.log(err);
        });
    }
    render(){
        return (<div>
        <Helmet>
            <title>Past Submissions | TA-Bot</title>
        </Helmet>
        <MenuComponent showUpload={false} showHelp={false} showCreate={false} showLast={false}></MenuComponent>
        <Grid className="main-grid">
            <Table celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Project Name</Table.HeaderCell>
                    <Table.HeaderCell>Submission Date</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                    <Table.HeaderCell>Link</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.rows.map(row => {
                        return (
                            <Table.Row>
                                <Table.Cell>{row.project_name}</Table.Cell>
                                <Table.Cell>{row.date}</Table.Cell>
                                <Table.Cell>{row.score}</Table.Cell>
                                <Table.Cell button><Link target="_blank" to={ "/code/" + row.id }><Label button >View</Label></Link></Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        </Grid>
        </div>
        );
    }
    
}

export default PastSubmissionPage;