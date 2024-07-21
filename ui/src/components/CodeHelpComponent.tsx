import axios from 'axios';
import { Component, SyntheticEvent } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import { Dropdown, DropdownProps, Form, Icon } from  'semantic-ui-react';
import '../css/codeHelpComponent.scss';
import { useEffect, useState } from "react";
import { format } from 'path';

interface CodeHelpComponentProps {
    codedata: string,
}
interface CodeHelpComponentState {
    api_response:string,
    question: string,
    api_visible:boolean,
    isLoading: boolean,
    bad_response: boolean,
    eq_check: boolean,
    q1:string,
    q2:string,
    q3:string;

}

const sliderOptions = [
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
            eq_check: true,
            q1:"",
            q2:"7",
            q3:""
            
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleq1Change = this.handleq1Change.bind(this);
        this.handleq2Change = this.handleq2Change.bind(this);
        this.handleq3Change = this.handleq3Change.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/formcheck`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {
            if(res.data[0] != res.data[1]){
                this.setState({ eq_check : false});
            }
            if(!this.state.eq_check){
                this.setState({question: res.data[2]});
                this.setState({api_response: res.data[3]});
                this.setState({api_visible: true});
            }
        })
        .catch(err => {
           
        });
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
            if(!this.state.bad_response){
                window.location.reload();
            }
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
            this.setState({bad_response: false}); //setting this to temp as a testing outcome
            this.handleFormSubmit();
            this.setState({isLoading:false});
          }
          else{
          this.setState({api_response: res.data})
          this.setState({api_visible: true});
          this.setState({isLoading:false});
          }
        })
        .catch(err => {
            console.log(err);
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
                    {this.state.eq_check ?
                    <div>
                        <div style={{height: '20px'}} />
                        <div id="api-response-box" className="api-response-box">
                        {this.state.api_response} 
                    </div>
                    </div>
                    :
                    <div>
                        <div style={{height: '20px'}} />
                        <div id="api-response-box" className="api-response-box">
                        <p>You did not fill out a form after submitting a question to TA-BOT, please complete the form to submit again.</p>
                        <p>Question Asked: {this.state.question}</p>
                        <p>Answer Given: {this.state.api_response} </p> 
                        </div>
                    </div>
                    }
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
                                <label>On a Scale of 1-5(1:Lowest, 5: Highest) how helpful was the response</label>
                                <Dropdown placeholder='~~' search selection options={sliderOptions} onChange={this.handleq1Change} />
                            </div>
                            <div className="field">
                                <label>On a Scale of 1-10(1: Lowest, 5: Highest) Did the response help you solve the issue?</label>
                                <Dropdown placeholder='~~' search selection options={sliderOptions} onChange={this.handleq2Change} />
                            </div>
                            { (this.state.q2 > "2") ?
                            <p></p> 
                            :
                            <div className="field">
                                <label>Please describe how the output did or did not help you understand the issue</label>
                                <input type="text" placeholder="optional" onChange={this.handleq3Change}></input>
                            </div>
                            }
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