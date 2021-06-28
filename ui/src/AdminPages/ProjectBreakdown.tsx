import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import AdminComponent from '../components/AdminComponent';
import '../css/AdminComponent.scss'

class ProjectBreakdown extends Component<{}, {}> {

    render() {
        return (
        <div>
            <MenuComponent showUpload={false} showHelp={false} showCreate={true}></MenuComponent>
            <Grid className="main-grid">
                <AdminComponent></AdminComponent>
            </Grid>
        </div>
        );
  }
}

export default ProjectBreakdown;