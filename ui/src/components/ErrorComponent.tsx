import axios from 'axios';
import React, { Component, PropsWithChildren } from 'react';
import 'semantic-ui-css/semantic.min.css'
import CriticalErrorPage from './CriticalErrorPage'

interface ErrorMessageState {
    hasError: boolean
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorMessageState> {
    constructor(props: {}) {
        super(props);
        this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
  
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        axios.post(process.env.REACT_APP_BASE_API_URL + `/error/log`, { location: window.location.href, error_stack: JSON.stringify(errorInfo) }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
          })
        .then(res => {

        }).catch(err => {
            console.log(err)
        })
    }
  
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (<CriticalErrorPage></CriticalErrorPage>);
        }
    
        return this.props.children; 
    }
}

export default ErrorBoundary;