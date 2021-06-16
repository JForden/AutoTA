import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Menu, Container } from 'semantic-ui-react';
import { StyledIcon } from '../styled-components/StyledIcon';
import { Button, Popup } from 'semantic-ui-react'

interface MenuComponentProps {
    showUpload: boolean
}

class MenuComponent extends Component<MenuComponentProps, {}> {
    
    render() {
        return (
            <Menu fixed='top' inverted>
                <Container>
                    <Menu.Item as='a' header>
                        AutoTA
                    </Menu.Item>
                    <div>
                        {(() => {
                            if(!this.props.showUpload) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/upload">Upload</a></Menu.Item>
                                );
                            }
                        })()}               
                    </div>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                             <Popup wide="very" size="tiny" mouseLeaveDelay={1000}
                             content={
                                <>
                                 <StyledIcon color="orange" name='minus circle' />
                                  : This icon represents: Likely code bugs<br />
                                  <StyledIcon color="black" name='pencil' />
                                  : This icon represents: Programming standard violation<br />
                                  <StyledIcon color="blue" name='cogs' />
                                  : This icon represents: code refactoring<br />
                                  <StyledIcon color="red" name='stop' />
                                  : This icon represents: Fatal Code Error<br />
                                  <StyledIcon color="yellow" name='exclamation triangle' />
                                  : This icon represents: Check syntax<br />
                                  <strong>Understanding test case output:<a href="https://unix.stackexchange.com/questions/81998/understanding-of-diff-output" target="_blank">(see more)</a></strong><br />
                                  <strong>a: </strong> This stands for adding<br />
                                  <strong>c: </strong> This stands for changing<br />
                                  <strong>d: </strong> This stands for deletion<br />
                                  <strong>&lt;</strong> This is the expected output <br />
                                  <strong>&gt;</strong>This is the submitted code output<br />
                                </>
                              } 
                             trigger={<Button color="black" icon='question circle outline icon' />} />
                        </Menu.Item>
                    </Menu.Menu>
                </Container>
            </Menu>
        );
    }
}

export default MenuComponent;