import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { Table, Label, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

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
                    <Label key={classObj.Id} as='div' color='blue' empty style={{ margin: "3px", width: "100px", height: "100px", display: "inline-block" }}>
                      <Link to={`/admin/projects/${classObj.Id}`} style={{ textDecoration: "none", color: "inherit" }}>
                       <h3>{classObj.Name}</h3>
                     </Link>
                    </Label>
                  ))}
                </div>
            </div>
        );
    }
    
}

export default AdminComponent;