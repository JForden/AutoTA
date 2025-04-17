import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import 'semantic-ui-css/semantic.min.css';
import { Input, Button } from 'semantic-ui-react';

interface ChatProps {
    class_id?: string;
}

const ForumPageComponent = () => {
    const [ClassName, setClassName] = useState<String>("");
    const [thread, setThread] = useState<String>("");
    const [threadBody, setThreadBody] = useState<String>("");

    // handleSubmit creates a new thread on form submission, then resets the thread.
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        console.log({ thread });
        console.log({ threadBody });
        setThread("");
        setThreadBody("");
    };

    // Get the class ID from state params:
    let { class_id } = useParams<ChatProps>();

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
    //TODO: Add description input as well as thread input
    return (
        <main style={{ margin: "5%" }}>
            <div>
                <h1>{title}</h1>
            </div>
            <div style={{ margin: "5%" }}>
                <h2 className="center">Create a Thread</h2>
                <form className="ui form" onSubmit={handleSubmit}>
                    <div className="formInputContainer">
                        <label htmlFor="thread">Thread Title</label>
                        <Input
                            fluid
                            type="text"
                            name="thread"
                            label={{ icon: 'asterisk' }}
                            labelPosition='right corner'
                            placeholder='Is this a good placeholder question?'
                            required
                            value={thread}
                            onChange={(e) => setThread(e.target.value)}
                        />
                        <label htmlFor="body">Additional Details</label>
                        <textarea
                            name="body"
                            placeholder='Type details clarifying your question here!'
                            value={threadBody as string}
                            onChange={(e) => setThreadBody(e.target.value)}
                        />
                    </div>
                    <button className="ui button">Create Thread</button>
                </form>
            </div>
        </main>
    )
}

export default ForumPageComponent