import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { lightfair } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css';
import Split from 'react-split';

class CodeComponent extends Component {
  render() {

    var pylint = [
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "",
        "line": 2,
        "column": 0,
        "path": "agebhard.py",
        "symbol": "line-too-long",
        "message": "Line too long (148/100)",
        "message-id": "C0301"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "",
        "line": 8,
        "column": 0,
        "path": "agebhard.py",
        "symbol": "line-too-long",
        "message": "Line too long (120/100)",
        "message-id": "C0301"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "",
        "line": 23,
        "column": 0,
        "path": "agebhard.py",
        "symbol": "line-too-long",
        "message": "Line too long (112/100)",
        "message-id": "C0301"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "distanceFinder",
        "line": 13,
        "column": 0,
        "path": "agebhard.py",
        "symbol": "invalid-name",
        "message": "Function name \"distanceFinder\" doesn't conform to snake_case naming style",
        "message-id": "C0103"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "distanceFinder",
        "line": 17,
        "column": 8,
        "path": "agebhard.py",
        "symbol": "invalid-name",
        "message": "Variable name \"y\" doesn't conform to snake_case naming style",
        "message-id": "C0103"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "main",
        "line": 24,
        "column": 0,
        "path": "agebhard.py",
        "symbol": "missing-function-docstring",
        "message": "Missing function or method docstring",
        "message-id": "C0116"
    },
    {
        "type": "convention",
        "module": "agebhard",
        "obj": "main",
        "line": 35,
        "column": 8,
        "path": "agebhard.py",
        "symbol": "invalid-name",
        "message": "Variable name \"returnedVals\" doesn't conform to snake_case naming style",
        "message-id": "C0103"
    }
];
    return (
        <div className="full-height">
            <Split className="split">
                <div id="code-container">
                    <SyntaxHighlighter language="python" style={lightfair} showLineNumbers={true}>
                        {`"""
TODO: Calculate and sort (smallest value first) the time (in minutes) it will take Captain Zap to get to each planet given the following parameters:

Parameters:
distances --> (integer array) the distance (in km) needed to reach each planet

Returns:
a sorted array of integers (from least to greatest) representing the number of minutes it will take to reach each planet

NOTE:  The speed of light is 300000 km/s
NOTE:  Round the nearest minute
"""
def distanceFinder(distances):
    lista = list()
    for ele in distances:
        y = ele / 300000
        y = y / 60
        lista.append(round(y))
    lista.sort()
    return lista

# It is unnecessary to edit the "main" function of each problem's provided code skeleton.
# The main function is written for you in order to help you conform to input and output formatting requirements.
def main():

    for _ in range(int(input())):
        # User Input #
        inp = input().split(" ")
        distances = []

        for i in inp:
            distances.append(int(i))

        # Function Call
        returnedVals = distanceFinder(distances)

        # Terminal Output #
        print(*returnedVals, sep=' ')

main()`}
                    </SyntaxHighlighter>
                </div>
                <div>Lint Stuff</div>
            </Split>
        </div>
    );
  }
}

export default CodeComponent;
