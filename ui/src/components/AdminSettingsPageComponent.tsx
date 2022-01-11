import axios from 'axios';
import { Component, FormEvent } from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import { Button, Checkbox, CheckboxProps, Dropdown, DropdownItemProps, Form, Header, Segment, Select } from 'semantic-ui-react';
import { isThisTypeNode } from 'typescript';

interface AdminSettingsPageState {
    classes: Array<DropdownItemProps>,
    hasScoreEnabled: boolean,
    hasTbsEnabled: boolean,
    hasUnlockEnabled: boolean,
    hasLVLSYSEnabled: boolean,
    classId: number
}

class AdminSettingsPageComponent extends Component<{}, AdminSettingsPageState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            classes: [{ key: 1, text:"None", value: 1 }],
            hasScoreEnabled: false,
            hasTbsEnabled: false,
            hasUnlockEnabled: false,
            hasLVLSYSEnabled: false,
            classId: -1
        }

        this.handleExtraDay = this.handleExtraDay.bind(this);
        this.handleScoreEnabled = this.handleScoreEnabled.bind(this);
        this.handleTbsEnabled = this.handleTbsEnabled.bind(this);
        this.handleLVLSYSEnabled = this.handleLVLSYSEnabled.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/get_teacher_class_by_id`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        }).then(res => {
            var data = res.data
            // Read it
            this.setState({ classes: new Array<DropdownItemProps>() });
            Object.entries(data).map(([key, value]) => {
                var class_id = parseInt(key); 
                this.state.classes.push({ key: class_id, text: value as string, value: class_id });
            })
        });
    }
    
    handleClassChange(ev: FormEvent<HTMLSelectElement>, value: number) {
        this.setState({ classId: value });
        axios.get(process.env.REACT_APP_BASE_API_URL + `/settings/config`,  {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            },
            params: {
                class_id: value
            }
        }).then(res => {
            var data = res.data
            console.log(data)
            this.setState({
                hasScoreEnabled: data.HasScoreEnabled,
                hasUnlockEnabled: data.HasUnlockEnabled,
                hasTbsEnabled: data.HasTBSEnabled,
                hasLVLSYSEnabled: data.HasLVLSYSEnabled
            });
        });
    }

    handleExtraDay(ev: FormEvent<HTMLInputElement>, data: CheckboxProps) {
        this.setState({hasUnlockEnabled: data.checked ?? false});
    }

    handleScoreEnabled(ev: FormEvent<HTMLInputElement>, data: CheckboxProps) {
        this.setState({hasScoreEnabled: data.checked ?? false});
    }

    handleTbsEnabled(ev: FormEvent<HTMLInputElement>, data: CheckboxProps) {
        this.setState({hasTbsEnabled: data.checked ?? false});
    }

    handleLVLSYSEnabled(ev: FormEvent<HTMLInputElement>, data: CheckboxProps) {
        this.setState({hasLVLSYSEnabled: data.checked ?? false});
    }

    handleClick(){
        axios.post(process.env.REACT_APP_BASE_API_URL + `/settings/config`, { HasUnlockedEnabled: this.state.hasUnlockEnabled, HasScoreEnabled: this.state.hasScoreEnabled, HasTBSEnabled: this.state.hasTbsEnabled, HasLvlSysEnabled: this.state.hasLVLSYSEnabled, ClassId: this.state.classId },
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        }).then(res => {
            alert("Settings have been saved");         
            window.location.reload();
        }).catch(err => {
            alert(err);
        });
    }

    render(){
        // use semantic UI react to create a button that toggles the visibility of a UI element 
        return (
        <div>
            <Form>
                <Dropdown placeholder='Lecture Section' selection options={this.state.classes} onChange={(e:any, {value}) => this.handleClassChange(e, value ? parseInt(value.toString()) : -1)}></Dropdown>
                <Segment>
                    <Header as='h3'>Research Features</Header>
                    <div><Checkbox name='extraday' toggle label='Enable unlocking extra day' checked={this.state.hasUnlockEnabled} onChange={this.handleExtraDay} /></div>
                    <div><Checkbox name='submissionscore' toggle label='Enable student submission score' checked={this.state.hasScoreEnabled} onChange={this.handleScoreEnabled} /></div>
                    <div><Checkbox name='cooldown' toggle label='Enable submission cooldown' checked={this.state.hasTbsEnabled} onChange={this.handleTbsEnabled} /></div>
                    <div><Checkbox name='LVLSYS' toggle label='Enable test case levels' checked={this.state.hasLVLSYSEnabled} onChange={this.handleLVLSYSEnabled} /></div>
                </Segment>
                <Button type='submit' onClick={this.handleClick}>Apply</Button>
            </Form>
        </div>)
    }
}

export default AdminSettingsPageComponent;