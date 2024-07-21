import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Menu, Container } from 'semantic-ui-react';
import { StyledIcon } from '../styled-components/StyledIcon';
import { Button, Popup, Dropdown } from 'semantic-ui-react';
import axios from 'axios';

interface MenuComponentProps {
    showUpload: boolean,
    showHelp: boolean,
    showCreate: boolean,
    showLast: boolean,
    showAdminUpload: boolean,
    showReviewButton: boolean;
}


class MenuComponent extends Component<MenuComponentProps, {}> {

    style = {
        height: 'auto'
    }

    handleLogout() {
        localStorage.removeItem("AUTOTA_AUTH_TOKEN");
        window.location.replace("/login");
    }

    handleHome() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/auth/get-role`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                var role = parseInt(res.data);
                if (role === 0) {
                    window.location.replace("/class/classes");
                }
                if (role === 1) {
                    window.location.replace("/admin/classes");
                }
            })
    }

    render() {
        return (
            <Menu fixed='top' inverted>
                <Container>
                    <Menu.Item as='a' header onClick={this.handleHome}>
                        TA-Bot
                    </Menu.Item>
                    <div>
                        {(() => {
                            if (!this.props.showUpload) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/class/classes">Upload</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <div>
                        {(() => {
                            if (!this.props.showAdminUpload) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/admin/upload">Admin Upload</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <div>
                        {(() => {
                            if (!this.props.showAdminUpload) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/admin/TaLanding">Office Hours</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <div>
                        {(() => {
                            if (!this.props.showLast) {
                                return (<></>);
                            } else {
                                const args = window.location.href;
                                const regex = /\/class\/(\d+)\/upload/;
                                const match = args.match(regex);
                                const extractedValue = match ? match[1] : null;
                                const path = "/class/" + extractedValue + "/code";
                                return (
                                    <Menu.Item><a href={path}>Most Recent Submission</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <div>
                        {(() => {
                            if (!this.props.showLast) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/submissions">Previous Submissions</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <div>
                        {(() => {
                            if (!this.props.showReviewButton) {
                                return (<></>);
                            } else {
                                return (
                                    <Menu.Item><a href="/class/1/codeHelp">Code Help</a></Menu.Item>
                                );
                            }
                        })()}
                    </div>
                    <Menu.Menu position='right'>
                        <div>
                            {(() => {
                                if (!this.props.showHelp) {
                                    return (<></>);
                                } else {
                                    return (
                                        <Menu.Item>
                                            <Popup wide="very" size="tiny" mouseLeaveDelay={1000} trigger={<Button color="black" icon='question circle outline icon' />} style={this.style} >
                                                <div>
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
                                                    <strong>Understanding test case output:<a href="https://unix.stackexchange.com/questions/81998/understanding-of-diff-output" target="_blank" rel="noopener noreferrer">(see more)</a></strong><br />
                                                    <strong>a: </strong> This stands for adding<br />
                                                    <strong>c: </strong> This stands for changing<br />
                                                    <strong>d: </strong> This stands for deletion<br />
                                                    <strong>&lt;</strong> This is the expected output <br />
                                                    <strong>&gt;</strong>This is the submitted code output<br />
                                                </div>
                                            </Popup>
                                        </Menu.Item>
                                    );
                                }
                            })()}
                        </div>
                        <div>
                            {(() => {
                                if (!this.props.showCreate) {
                                    return (<></>);
                                } else {
                                    return (
                                        //TODO: Move out of menu, add to projects page to allow multi-class
                                        <Menu.Item><a href="/admin/project/edit/0">Create New Assignment</a></Menu.Item>
                                    );
                                }
                            })()}
                        </div>
                        <Dropdown item icon="bars">
                            <Dropdown.Menu>
                                <Dropdown.Item icon='sign-out' text='Log out' onClick={this.handleLogout} />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Menu>
                </Container>
            </Menu>
        );
    }
}

export default MenuComponent;
