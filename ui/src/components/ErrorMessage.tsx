import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Message } from 'semantic-ui-react'

interface ErrorMessageProps {
    message: string
    isHidden: boolean
}

class ErrorMessage extends Component<ErrorMessageProps, {}> {
  render() {
    return (
    <Message error hidden={this.props.isHidden}>
        {this.props.message}
    </Message>
    );
  }
}

export default ErrorMessage;
