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
    api_visible:boolean,
    isLoading: boolean,
    q1:string,
    q2:string,
    q3:string;


}


class CodeHelpComponent extends Component<CodeHelpComponentProps, CodeHelpComponentState, {}> {
    constructor(props: CodeHelpComponentProps) {
        super(props);
        this.state = {
            api_response: "",
            question: "",
            api_visible: false,
            isLoading: false,
            q1:"",
            q2:"",
            q3:""
            
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleq1Change = this.handleq1Change.bind(this);
        this.handleq2Change = this.handleq2Change.bind(this);
        this.handleq3Change = this.handleq3Change.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ question: event.target.value });
    }
    handleq1Change =(event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ q1: event.target.value });
    }
    handleq2Change =(event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ q2: event.target.value });
    }
    handleq3Change =(event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ q3: event.target.value });
    }

    handleFormSubmit(){
        console.log(this.state.q1);
        console.log(this.state.q2);
        console.log(this.state.q3);
    }

    handleSubmit () {
        this.setState({isLoading:true});
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
          this.setState({isLoading:false});
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
                <div>
                <div id="api-response-container" className="api-response-container" style={{ marginTop: '20px' }}>
                    <div style={{textAlign: 'center', fontSize: '20px', color: 'white'}}>
                        TA-BOT Code Suggestions
                    </div>
                    <div style={{height: '20px'}} />
                    <div id="api-response-box" className="api-response-box">
                        {this.state.api_response}
                    </div>
                </div>
                <div>
                    <p>You are required to complete this form, if you do not, your account will be locked and you will be unable to ask another question. </p>
                    <p>These responses help us improve the tool, please accurately fill out the form. Your feedback is extremely important to the team</p>
                    <div className="ui form">
                        <div className="three fields">
                            <div className="field">
                                <label>On a Scale of 1-10 how helpful was the response</label>
                                <input type="text" placeholder="1,2,3...10" onChange={this.handleq1Change} ></input>
                            </div>
                            <div className="field">
                                <label>On a Scale of 1-10 Did the response help you solve the issue?</label>
                                <input type="text" placeholder="1,2,3...10" onChange={this.handleq2Change}></input>
                            </div>
                            <div className="field">
                                <label>Did you need to reword your question, if so how many times?</label>
                                <input type="text" placeholder="1,2,3...10" onChange={this.handleq3Change}></input>
                            </div>
                        </div>
                    </div>
                    <button id="submit-button" onClick={this.handleFormSubmit} style={{
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
                
                : 
                this.state.isLoading ? 
                    <div className="questionbox">
                        <p>
                            <div>
                                <div className="ui active dimmer">
                                    <div className="ui text loader">Your response is loading, do not refresh the page.</div>
                                </div>
                            </div>
                        </p>
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