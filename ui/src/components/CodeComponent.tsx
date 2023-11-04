import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import Split from 'react-split';
import { Button, Icon } from  'semantic-ui-react';

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

interface CodeComponentProps {
    pylintData: Array<PylintObject>,
    codedata: string
}
interface CodeComponentState {
    dismissed: boolean[]
}


class CodeComponent extends Component<CodeComponentProps, CodeComponentState, {}> {

    constructor(props: CodeComponentProps) {
        super(props);
        this.state = {
            dismissed: Array(props.pylintData.length).fill(false)
        };
        this.stylelinenumbers = this.stylelinenumbers.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);
    }

    handleDismiss(index: number) {
        this.setState(prevState => {
            const newDismissed = [...prevState.dismissed];
            newDismissed[index] = true;
            return { dismissed: newDismissed };
        });
    }
    stylelinenumbers(linenumber: number) {
        for (let index = 0; index < this.props.pylintData.length; index++) {
            const error = this.props.pylintData[index];
            if(error.message.includes("UPPER_CASE") || this.state.dismissed[index]){ 
                continue;
            }else if(error.line === linenumber) {
                return {'background-color': 'yellow', 'color': 'black'};
            }
        }
        return {'color': 'black'};
    }
    

  render() {
    return (
        <div className="full-height">
            <Split className="split">
                <div id="code-container">
                    <SyntaxHighlighter language="python" style={vs} showLineNumbers={true} lineNumberStyle={this.stylelinenumbers} >
                        {this.props.codedata}
                    </SyntaxHighlighter>
                </div>
                <div id="lint-output">
                {(() => {
                    const holder = [];
                    for (let index = 0; index < this.props.pylintData.length; index++) {
                        const error = this.props.pylintData[index];
                        if(this.state.dismissed[index]) {
                            continue;
                        } else
                        if(error.message.includes("UPPER_CASE")){ 
                            continue;
                                } else if(error.type === "convention"){
                                holder[index] = (
                                    <div style={{ 
                                        padding: '10px', 
                                        borderRadius: '5px', 
                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                                        backgroundColor: '#f9f9f9', 
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '10px'
                                        }}>
                                            <Icon color="black" name='pencil' />
                                            <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                                            <Button onClick={() => this.handleDismiss(index)}>Dismiss</Button>
                                        </div>
                                        <div>
                                            <p style={{ color: '#333', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                            <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                                        </div>
                                    </div>
                                );
                            } else if(error.type === "refactor") {
                                holder[index] = (
                                    <div style={{ 
                                        padding: '10px', 
                                        borderRadius: '5px', 
                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                                        backgroundColor: '#f9f9f9', 
                                        marginBottom: '20px'
                                    }}>
                                        <Icon color="blue" name='cogs' />
                                        <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                                        <p style={{ color: '#666', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                        <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                                    </div>
                                );
                            } else if(error.type === "error") {
                            holder[index] = (
                                <div style={{ 
                                    padding: '10px', 
                                    borderRadius: '5px', 
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                                    backgroundColor: '#f9f9f9', 
                                    marginBottom: '20px'
                                }}>
                                    <Icon color="orange" name='minus circle' />
                                    <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                                    <p style={{ color: '#666', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                    <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                                </div>
                            );
                        }
                        else if(error.type === "fatal") {
                            holder[index] = (
                                <div style={{ 
                                    padding: '10px', 
                                    borderRadius: '5px', 
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                                    backgroundColor: '#f9f9f9', 
                                    marginBottom: '20px'
                                }}>
                                    <Icon color="red" name='stop' />
                                    <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                                    <p style={{ color: '#666', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                    <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                                </div>
                            );
                        }
                        else if(error.type === "warning") {
                            holder[index] = (
                                <div style={{ 
                                    padding: '10px', 
                                    borderRadius: '5px', 
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                                    backgroundColor: '#f9f9f9', 
                                    marginBottom: '20px'
                                }}>
                                    <Icon color="yellow" name='exclamation triangle' />
                                    <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                                    <p style={{ color: '#666', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                    <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                                </div>
                            );
                        } else {
                    holder[index] = (
                        <div style={{ 
                            padding: '10px', 
                            borderRadius: '5px', 
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                            backgroundColor: '#f9f9f9', 
                            marginBottom: '20px'
                        }}>
                            <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>  
                            <p style={{ color: '#666', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                            <iframe src={error.reflink} title="Error Details" style={{ width: '100%', height: '200px', border: 'none' }}></iframe>
                        </div>
                    );
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