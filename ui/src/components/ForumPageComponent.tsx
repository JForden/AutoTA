import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import 'semantic-ui-css/semantic.min.css';

interface ChatProps {
    class_id?: string;
}

const ForumPageComponent = () => {
    const [ClassName, setClassName] = useState<String>("");

    // Get the class ID from state params:
    let { class_id } = useParams<ChatProps>();
    //var cid = class_id ? parseInt(class_id) : -1;

    // API call to get the class name from the current ID:
    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/id/` + class_id, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            res.data.map((obj: { name: string }) => {
                setClassName(obj.name);
            })
        });
    })

    const title = `Class ${ClassName} Discussion Board`;
    return (
        <div style={{ margin: "5%" }}>
            <h1>{title}</h1>
        </div>

    )
}

export default ForumPageComponent