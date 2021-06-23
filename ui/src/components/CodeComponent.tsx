import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import Split from 'react-split';
import { Icon } from  'semantic-ui-react';
import axios from 'axios';


interface PylintObject {
    type: string,
    module: string,
    obj: string,
    line: number,
    column: number,
    path: string,
    symbol: string,
    message: string,
    messageid: string,
    reflink: string
}

interface CodeComponentState {
    code: string,
    pylint: Array<PylintObject>
}

class CodeComponent extends Component<{}, CodeComponentState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            code: "",
            pylint: []
        }
        this.stylelinenumbers = this.stylelinenumbers.bind(this);
    }

    stylelinenumbers(linenumber: number) {
        for (let index = 0; index < this.state.pylint.length; index++) {
            const error = this.state.pylint[index];
            if(error.line === linenumber) {
                return {'background-color': 'yellow', 'color': 'black'};
            }
        }
        return {'color': 'black'};
    }

    componentDidMount() {

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/codefinder`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            this.setState({code: res.data })    
        })
        .catch(err => {
            console.log(err);
        });

        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/pylintoutput`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        })
        .then(res => {    
            var x = res.data as Array<PylintObject>;
            x = x.sort((a, b) => (a.line < b.line ? -1 : 1));
            this.setState({pylint:  x})    
        })
        .catch(err => {
            console.log(err);
        });
    }

  render() {

    return (
        <div className="full-height">
            <Split className="split">
                <div id="code-container">
                    <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} lineNumberStyle={this.stylelinenumbers} >
                        {this.state.code}
                    </SyntaxHighlighter>
                </div>
                <div id="lint-output">
                {(() => {
                    const holder = [];
                    for (let index = 0; index < this.state.pylint.length; index++) {
                        const error = this.state.pylint[index];
                        if(error.type === "convention"){
                            holder[index] =( 
                                <div>
                                    <Icon color="black" name='pencil' />
                                    <strong>{error.line} : </strong>  
                                    {error.message}
                                    <a href={error.reflink} target="_blank" rel="noreferrer"><strong> (see more)</strong></a>
                                </div>);
                        } else if(error.type === "refactor") {
                            holder[index] =( 
                                <div>
                                    <Icon color="blue" name='cogs' />
                                    <strong>{error.line} : </strong>  
                                    {error.message}
                                    <a href={error.reflink} target="_blank" rel="noreferrer"><strong> (see more)</strong></a>
                                </div>);
                        } else if(error.type === "error") {
                            holder[index] =( 
                                <div>
                                    <Icon color="orange" name='minus circle' />
                                    <strong>{error.line} : </strong>  
                                    {error.message}
                                    <a href={error.reflink} target="_blank" rel="noreferrer"><strong> (see more)</strong></a>
                                </div>);
                        }
                        else if(error.type === "fatal") {
                            holder[index] =( 
                                <div>
                                    <Icon color="red" name='stop' />
                                    <strong>{error.line} : </strong>  
                                    {error.message}
                                    <a href={error.reflink} target="_blank" rel="noreferrer"><strong> (see more)</strong></a>
                                </div>);
                        }
                        else if(error.type === "warning") {
                            holder[index] =( 
                                <div>
                                    <Icon color="yellow" name='exclamation triangle' />
                                    <strong>{error.line} : </strong>  
                                    {error.message}
                                    <a href={error.reflink} target="_blank" rel="noreferrer"><strong> (see more)</strong></a>
                                </div>);
                        }
                    }
                    return holder;
                })()}
                </div>
            </Split>
        </div>
    );
  }
}

export default CodeComponent;
