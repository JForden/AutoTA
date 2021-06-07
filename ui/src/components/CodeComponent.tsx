import { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { lightfair } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'semantic-ui-css/semantic.min.css'

class CodeComponent extends Component {
  render() {
    return (
        <SyntaxHighlighter language="python" style={lightfair} showLineNumbers={true}>
            {`import collections
class Cells:
    def __init__(self):
        self.live_cells = set([])
    def update(self):
        ctr = collections.Counter()
        for element in self.live_cells:
            x, y = element
            ctr[(x-1,y)]+=1
            ctr[(x-1,y-1)]+=1
            ctr[(x-1,y+1)]+=1
            ctr[(x,y-1)]+=1
            ctr[(x,y+1)]+=1
            ctr[(x+1,y-1)]+=1
            ctr[(x+1,y)]+=1
            ctr[(x+1,y+1)]+=1
        new_list = []
        for pts in ctr:
            if pts in self.live_cells and ctr[pts] in [2,3]:
                new_list.append(pts)
            if pts not in self.live_cells and ctr[pts]==3:
                new_list.append(pts)
        self.live_cells=set(new_list)
    def __str__(self):
        return str(self.live_cells)
    def set(self, list):
        self.live_cells = set(list)
    def initialize_blinker(self,a,b):
        self.set([(a,b), (a+1,b), (a,b+1), (a+2,b+2), (a+3,b+2), (a+2,b+3)])
    def initialize_glider(self, a,b):
        self.set([(a,b), (a+1,b+1), (a-1,b+2), (a,b+2), (a+1,b+2)])

if __name__ == "__main__":
    cell = Cells()
    cell.set([(5,10), (5,11), (6,10), (6,11), (7,12), (7,13), (8,12), (8,13)])
    print(cell)
    for _ in range(10):
        cell.update()
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)
        print(cell)`}
        </SyntaxHighlighter>
    );
  }
}

export default CodeComponent;
