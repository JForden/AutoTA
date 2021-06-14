import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Menu, Container } from 'semantic-ui-react'

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
                </Container>
            </Menu>
        );
    }
}

export default MenuComponent;
