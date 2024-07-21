import { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import Split from 'react-split';
import { Button, Icon } from 'semantic-ui-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// If you're using highlight.js, import from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';


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
            if (error.message.includes("UPPER_CASE") || this.state.dismissed[index]) {
                continue;
            } else if (error.line === linenumber) {
                return { 'background-color': 'yellow', 'color': 'black' };
            }
        }
        return { 'color': 'black' };
    }


    render() {
        const customStyle = {
            ...vs, // Spread the vs style
            borderRadius: '5px',
            padding: '10px',
            color: '#ff0000', // Custom color
        };
        return (
            <div className="full-height">
                <Split className="split">
                    <div id="code-container" style={{
                        borderRadius: '5px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                        backgroundColor: '#f5f5f5', // Lighter gray
                        padding: '20px',
                        fontFamily: 'Courier New, monospace',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#333',
                        overflow: 'auto',
                        marginTop: '20px',
                        border: 'none' // Remove border
                    }}>
                        <SyntaxHighlighter
                            language="python"
                            style={customStyle}
                            showLineNumbers={true}
                            lineNumberStyle={this.stylelinenumbers}
                        >
                            {this.props.codedata}
                        </SyntaxHighlighter>
                    </div>
                    <div id="lint-output">
                        {(() => {
                            const holder = [];
                            for (let index = 0; index < this.props.pylintData.length; index++) {
                                const error = this.props.pylintData[index];
                                if (this.state.dismissed[index]) {
                                    continue;
                                } else
                                    if (error.message.includes("UPPER_CASE")) {
                                        continue;
                                    } else if (error.type === "convention") {
                                        holder[index] = (
                                            <div style={{
                                                padding: '10px',
                                                borderRadius: '5px',
                                                boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)', // Increased shadow
                                                backgroundColor: '#f9f9f9',
                                                marginBottom: '20px',
                                                border: '1px solid rgba(0, 0, 0, 0.2)' // Darkened border
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '10px'
                                                }}>
                                                    <Icon color="black" name='pencil' />
                                                    <strong style={{ fontSize: '1.2em', color: '#333', marginRight: '10px' }}>{error.line} : </strong>
                                                </div>
                                                <div>
                                                    <p style={{ color: '#333', fontSize: '1.2em', fontWeight: 'bold' }}>{error.message}</p>
                                                    <div
                                                        style={{
                                                            resize: 'both',
                                                            overflow: 'auto',
                                                            border: '2px solid #444',
                                                            borderRadius: '5px',
                                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                            margin: '10px 0',
                                                            width: '100%',
                                                            height: '200px'
                                                        }}
                                                    >
                                                        <iframe
                                                            src={error.reflink}
                                                            title="Error Details"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                border: 'none'
                                                            }}
                                                        ></iframe>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (error.type === "refactor") {
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
                                                <div
                                                    style={{
                                                        resize: 'both',
                                                        overflow: 'auto',
                                                        border: '2px solid #444',
                                                        borderRadius: '5px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                        margin: '10px 0',
                                                        width: '100%',
                                                        height: '200px'
                                                    }}
                                                >
                                                    <iframe
                                                        src={error.reflink}
                                                        title="Error Details"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        );
                                    } else if (error.type === "error") {
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
                                                <div
                                                    style={{
                                                        resize: 'both',
                                                        overflow: 'auto',
                                                        border: '2px solid #444',
                                                        borderRadius: '5px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                        margin: '10px 0',
                                                        width: '100%',
                                                        height: '200px'
                                                    }}
                                                >
                                                    <iframe
                                                        src={error.reflink}
                                                        title="Error Details"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        );
                                    }
                                    else if (error.type === "fatal") {
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
                                                <div
                                                    style={{
                                                        resize: 'both',
                                                        overflow: 'auto',
                                                        border: '2px solid #444',
                                                        borderRadius: '5px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                        margin: '10px 0',
                                                        width: '100%',
                                                        height: '200px'
                                                    }}
                                                >
                                                    <iframe
                                                        src={error.reflink}
                                                        title="Error Details"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        );
                                    }
                                    else if (error.type === "warning") {
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
                                                <div
                                                    style={{
                                                        resize: 'both',
                                                        overflow: 'auto',
                                                        border: '2px solid #444',
                                                        borderRadius: '5px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                        margin: '10px 0',
                                                        width: '100%',
                                                        height: '200px'
                                                    }}
                                                >
                                                    <iframe
                                                        src={error.reflink}
                                                        title="Error Details"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    ></iframe>
                                                </div>
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
                                                <div
                                                    style={{
                                                        resize: 'both',
                                                        overflow: 'auto',
                                                        border: '2px solid #444',
                                                        borderRadius: '5px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                                        margin: '10px 0',
                                                        width: '100%',
                                                        height: '200px'
                                                    }}
                                                >
                                                    <iframe
                                                        src={error.reflink}
                                                        title="Error Details"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    ></iframe>
                                                </div>
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