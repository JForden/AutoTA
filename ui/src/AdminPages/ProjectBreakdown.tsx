import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import { Grid } from 'semantic-ui-react'
import MenuComponent from '../components/MenuComponent';
import StudentList from '../components/StudentList';
import '../css/AdminComponent.scss'

interface ProjectBreakdownProps {
    id: string  
}

const ProjectBreakdown = () => {
    let { id } = useParams<ProjectBreakdownProps>();
    var project_id = parseInt(id);

    return (
        <div>
            <Helmet>
                <title>[Admin] Students | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={false} showAdminUpload={true} showHelp={false} showCreate={false} showLast={false} showReviewButton={false}></MenuComponent>
            <Grid className="main-grid">
                <StudentList project_id={project_id}></StudentList>
            </Grid>
        </div>
    )
}

export default ProjectBreakdown;