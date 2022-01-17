import { Component, useEffect, useState, useReducer } from 'react';
import { Image,Grid, Tab, Dropdown, Form, Input,Radio,Button,Icon, TextArea, Label, Checkbox } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { DropdownItemProps } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import codeimg from '../codeex.png'
import axios from 'axios';
import { textSpanEnd } from 'typescript';
import AdminProjectSettingsComponent from './AdminProjectSettingsComponent';
import { useParams } from 'react-router-dom';


const projects =[
    {key:'p1',value:'p1',text:'p1'},
    {key:'p2',value:'p2',text:'p2'},
    {key:'p3',value:'p3',text:'p3'},
]

interface AdminProjectConfigProps {
    id: number  
}

  const AdminProjectConfigComponent = (props: AdminProjectConfigProps) => {
    const [CreateNewState,setCreateNewState] = useState<boolean>();

    function buttonhandleClick() {
        setCreateNewState(true);
        console.log(CreateNewState);
    }

    return (
        <div style={{height: "80%"}}>
        <Tab
            style={{width: '100%', height: '100%'}}
            menu={{ vertical: true, secondary: true, tabular: true }}
            grid={{paneWidth: 14, tabWidth: 2}}
            menuPosition='left'
            panes={[
                { menuItem: { key: 'psettings', icon: 'pencil alternate', content: 'Project Settings', }, render: () => 
                <Tab.Pane>
                    <AdminProjectSettingsComponent id={props.id} />
                </Tab.Pane>
                },
                { menuItem: { key: 'testcases', icon: 'clipboard check', content: 'Test Cases' }, render: () => <Tab.Pane>
                    <Form>
                    <Form.Group inline>
                            <Form.Field
                            control={Input}
                            label='Test Case Name'
                            placeholder='00-TestCaseName'
                            >
                            </Form.Field>
                            <h5 style={{height:'3.5vh'}}>Input:  </h5>
                            <Form.Field
                            control={TextArea}
                            rows={1}
                            placeholder='1,2,3'
                            >
                            </Form.Field>
                            <Form.Field
                            control={Input}
                            label='Description:'
                            placeholder='Description'
                            />
                            <Form.Field
                            control={Checkbox}
                            label='Hidden'
                            />
                            <Form.Button>Submit Changes</Form.Button>
                            <Form.Field>
                                
                            <Icon name="trash" />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group inline>
                            <Form.Field
                            control={Input}
                            label='Test Case Name'
                            placeholder='00-TestCaseName'
                            >
                            </Form.Field>
                            <h5 style={{height:'3.5vh'}}>Input:  </h5>
                            <Form.Field
                            control={TextArea}
                            rows={1}
                            placeholder='1,2,3'
                            >
                            </Form.Field>
                            <Form.Field
                            control={Input}
                            label='Description:'
                            placeholder='Description'
                            />
                            <Form.Field
                            control={Checkbox}
                            label='Hidden'
                            />
                            <Form.Button>Submit Changes</Form.Button>
                            <Form.Field>
                                
                            <Icon name="trash" />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group inline>
                            <Form.Field
                            control={Input}
                            label='Test Case Name'
                            placeholder='00-TestCaseName'
                            >
                            </Form.Field>
                            <h5 style={{height:'3.5vh'}}>Input:  </h5>
                            <Form.Field
                            control={TextArea}
                            rows={1}
                            placeholder='1,2,3'
                            >
                            </Form.Field>
                            <Form.Field
                            control={Input}
                            label='Description:'
                            placeholder='Description'
                            />
                            <Form.Field
                            control={Checkbox}
                            label='Hidden'
                            />
                            <Form.Button>Submit Changes</Form.Button>
                            <Form.Field>
                                
                            <Icon name="trash" />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group inline>
                            <Form.Field
                            control={Input}
                            label='Test Case Name'
                            placeholder='00-TestCaseName'
                            >
                            </Form.Field>
                            <h5 style={{height:'3.5vh'}}>Input:  </h5>
                            <Form.Field
                            control={TextArea}
                            rows={1}
                            placeholder='1,2,3'
                            >
                            </Form.Field>
                            <Form.Field
                            control={Input}
                            label='Description:'
                            placeholder='Description'
                            />
                            <Form.Field
                            control={Checkbox}
                            label='Hidden'
                            />
                            <Form.Button>Submit Changes</Form.Button>
                            <Form.Field>
                                
                            <Icon name="plus" />
                            </Form.Field>
                        </Form.Group>
                        
                    </Form>
                </Tab.Pane> 
                }, 
              ]}
            
        /> 
        </div>
    )
}

export default AdminProjectConfigComponent;