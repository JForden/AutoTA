import { Helmet } from "react-helmet";
import MenuComponent from "../components/MenuComponent";
import { useParams } from "react-router-dom";

interface ChatProps {
    class_id?: string;
}

const ChatPage = () => {
    let { class_id } = useParams<ChatProps>();
    var cid = class_id ? parseInt(class_id) : -1;
    const title = `Class ${cid} Discussion Board`;
    return (
        <div id="code-page">
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <MenuComponent showUpload={true} showAdminUpload={false} showHelp={false} showCreate={false} showLast={false} showReviewButton={false} showChat={false}></MenuComponent>
            <h1>{title}</h1>
        </div>
    )
}

export default ChatPage;