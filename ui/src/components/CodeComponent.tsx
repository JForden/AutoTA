import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import Split from 'react-split';
import { Icon } from  'semantic-ui-react';


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

class CodeComponent extends Component<CodeComponentProps, {}> {

    constructor(props: CodeComponentProps) {
        super(props);
        this.stylelinenumbers = this.stylelinenumbers.bind(this);
    }

    stylelinenumbers(linenumber: number) {
        for (let index = 0; index < this.props.pylintData.length; index++) {
            const error = this.props.pylintData[index];
            if(error.message.includes("UPPER_CASE")){ 
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
                        if(error.message.includes("UPPER_CASE")){ 
                            continue;
                        } else if(error.type === "convention"){
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
                        } else {
                            holder[index] =( 
                                <div>
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
