import axios from 'axios';
import { Component, SyntheticEvent } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import { Dropdown, DropdownProps, Form, Icon } from  'semantic-ui-react';
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
    bad_response: boolean,
    q1:string,
    q2:string,
    q3:string;
}

const sliderOptions = [
    {
      key: '10',
      text: '10',
      value: '10',
    },
    {
        key: '9',
        text: '9',
        value: '9',
    },
    {
        key: '8',
        text: '8',
        value: '8',
    },
    {
        key: '7',
        text: '7',
        value: '7',
    },
    {
        key: '6',
        text: '6',
        value: '6',
    },
    {
        key: '5',
        text: '5',
        value: '5',
    },
    {
        key: '4',
        text: '4',
        value: '4',
    },
    {
        key: '3',
        text: '3',
        value: '3',
    },
    {
        key: '2',
        text: '2',
        value: '2'
    },
    {
        key: '1',
        text: '1',
        value: '1',
    },
]

class CodeHelpComponent extends Component<CodeHelpComponentProps, CodeHelpComponentState, {}> {
    constructor(props: CodeHelpComponentProps) {
        super(props);
        this.state = {
            api_response: "",
            question: "",
            api_visible: false,
            isLoading: false,
            bad_response: false,
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
    handleq1Change = (event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        this.setState({ q1: data.value as string });
    } 
    handleq2Change = (event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        this.setState({ q2: data.value as string });
    } 
    handleq3Change =(event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ q3: event.target.value });
    }

    handleFormSubmit(){
        this.setState({isLoading:true});
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/chatform?q1=${this.state.q1}&q2=${this.state.q2}&q3=${this.state.q3}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
          })
          .then(res => {    
            this.setState({isLoading:false});
            
          })
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
          if(res.data.includes("TA-BOT")){
            this.setState({ q1: "11" as string });
            this.setState({ q2: "11" as string });
            this.setState({ q3: "INVALID" as string });
            this.setState({api_response: res.data});
            this.setState({api_visible: true});
            this.setState({bad_response: true});
            this.handleFormSubmit();
            this.setState({isLoading:false});
          }
          else{
          this.setState({api_response: res.data})
          this.setState({api_visible: true});
          console.log(this.state.api_response);
          this.setState({isLoading:false});
          }
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
                { this.state.bad_response ?
                <div>
                    <div style={{height: '20px'}} />
                    <div id="api-response-box" className="api-response-box">
                        {this.state.api_response}
                    </div>
                </div>
            :
            <div>
                    <p>You are required to complete this form, if you do not, your account will be locked and you will be unable to ask another question. </p>
                    <p>These responses help us improve the tool, please accurately fill out the form. Your feedback is extremely important to the team</p>
                    <div className="ui form">
                        <div className="three fields">
                            <div className="field">
                                <label>On a Scale of 1-10 how helpful was the response</label>
                                <Dropdown placeholder='~~' search selection options={sliderOptions} onChange={this.handleq1Change} />
                            </div>
                            <div className="field">
                                <label>On a Scale of 1-10 Did the response help you solve the issue?</label>
                                <Dropdown placeholder='~~' search selection options={sliderOptions} onChange={this.handleq2Change} />
                            </div>
                            <div className="field">
                                <label>Please describe how the output did or did not help you understand the issue</label>
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
            }
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
                    <input placeholder='Example of a bad question: Why is my code broken. Good questions: What is wrong with this line  if op == quit,  OR Why does my code break if op != quit and add, OR Why does this code throw a TypeError(replace with the compiler error) ' onChange={this.handleChange} />
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