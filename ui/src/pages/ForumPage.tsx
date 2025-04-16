import { Helmet } from "react-helmet";
import MenuComponent from "../components/MenuComponent";
import ForumPageComponent from "../components/ForumPageComponent";

const ForumPage = () => {
    return (
        <div id="code-page">
            <Helmet>
                <title>Discussion Board | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} showForum={false}></MenuComponent>
            <ForumPageComponent></ForumPageComponent>
        </div>
    )
}

export default ForumPage;