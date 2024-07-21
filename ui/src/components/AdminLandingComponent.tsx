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
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/all?filter=true`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            const classes = res.data.map((obj : {id: number, name: string}) => {
                return { Id: obj.id, Name: obj.name };
            });

            classes.sort(function(a : ClassObject, b : ClassObject) { 
                return a.Name > b.Name;
            });
            
            this.setState({classes: classes});
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <div style={{ fontFamily: 'Roboto, sans-serif', color: '#333', padding: '20px' }}>
                <h1 style={{ 
                    textAlign: 'left', 
                    margin: '40px 0', 
                    fontSize: '2em', 
                    fontWeight: 'bold', 
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' 
                }}>
                    Your Classes:
                </h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', justifyContent: 'center' }}>
                    {this.state.classes.map((classObj: ClassObject) => (
                        <Link 
                            key={classObj.Id} 
                            to={`/admin/projects/${classObj.Id}`} 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <Card style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', transition: '0.3s', overflow: 'hidden' }}>
                                <Card.Content style={{ padding: '20px', textAlign: 'center' }}>
                                    <Image src={codeimg} style={{ width: '100%', marginBottom: '15px' }} />
                                </Card.Content>
                                <Card.Content>
                                    <Card.Header style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
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