import { Helmet } from "react-helmet";
import MenuComponent from "../components/MenuComponent";
import ChatPageComponent from "../components/ChatPageComponent";

const ChatPage = () => {
    return (
        <div id="code-page">
            <Helmet>
                <title>Discussion Board | TA-Bot</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} showChat={false}></MenuComponent>
            <ChatPageComponent></ChatPageComponent>
        </div>
    )
}

export default ChatPage;