import axios from 'axios';
import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import { Form, Icon } from  'semantic-ui-react';
import '../css/codeHelpComponent.scss';
import { useEffect, useState } from "react";

interface CodeHelpComponentProps {
    codedata: string,
}
interface CodeHelpComponentState {
    api_response:string,
    question: string,
    api_visible:boolean;
}


class CodeHelpComponent extends Component<CodeHelpComponentProps, CodeHelpComponentState, {}> {
    constructor(props: CodeHelpComponentProps) {
        super(props);
        this.state = {
            api_response: "",
            question: "",
            api_visible: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ question: event.target.value });
        console.log(this.state.question);
    }

    handleSubmit () {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/chatupload?code=${this.props.codedata}&question=${this.state.question}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
          }
        })
        .then(res => {    
          var role=parseInt(res.data);
          this.setState({api_response: res.data})
          this.setState({api_visible: true});
          console.log(this.state.api_response);
        })
        .catch(err => {
            console.log(this.state.question);
        });
      }

    render() {
        return (
            <div className="full-height">
                <div id="code-container" className="code-container highlight">
                    <SyntaxHighlighter language="python" style={vs2015} showLineNumbers={true} >
                        {this.props.codedata}
                    </SyntaxHighlighter>
                </div>
                { this.state.api_visible ? 
                <div id="api-response-container" className="api-response-container" style={{ marginTop: '20px' }}>
                    <div style={{textAlign: 'center', fontSize: '20px', color: 'white'}}>
                        TA-BOT Code Suggestions
                    </div>
                    <div style={{height: '20px'}} />
                    <div id="api-response-box" className="api-response-box">
                        {this.state.api_response}
                    </div>
                </div>
                : 
                <div id="questionbox" className="questionbox">
                <div style={{height: '20px'}} />
                <div style={{textAlign: 'center'}}>
                <Form>
                    <Form.Field>
                    <input placeholder='Example of a bad question: Why is my code broken, or Why does my code not work? Example of a good question: What is wrong with my elif on line 12 OR Why does my code break on line 7? OR Why does this code throw a TypeError ' onChange={this.handleChange} />
                    </Form.Field>
                </Form>
                    <button id="submit-button" onClick={this.handleSubmit} style={{
                        background: '#00b5ad',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        height: '40px'
                    }}>
                        Submit
                    </button>
                </div>
            </div>
             }
            </div>
        );
    }
    
    
}

export default CodeHelpComponent;