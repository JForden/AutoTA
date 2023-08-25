import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Button, Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import codeimg from '../codeex.png'

interface ClassObject {
    Id: number,
    Name: string,
}

interface ClassState {
    classes: Array<ClassObject>
}


class AdminComponent extends Component<{}, ClassState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            classes: []
        }
    }
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/classes_by_Tid`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            const classes = Object.entries(res.data).map(([id, name]) => {
                return { Id: parseInt(id), Name: name as string };
            });
            this.setState({classes: classes});
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
                <h1>Your Classes</h1>
                <div style={{ textAlign: "center" }}>
                  {this.state.classes.map((classObj: ClassObject) => (
                    <Link key={classObj.Id} to={`/admin/projects/${classObj.Id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <Card style={{ margin: "3px", width: "200px", display: "inline-block" }}>
                        <Card.Content style={{padding: "5px", textAlign: "center" }}>
                            <Image src={codeimg} />
                        </Card.Content>
                        <Card.Content>
                            <Card.Header>
                                {classObj.Name}
                            </Card.Header>
                        </Card.Content>
                    </Card>
                </Link>
                  ))}
                </div>
            </div>
        );
    }
    
}

export default AdminComponent;