import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import ErrorBoundary from './ErrorComponent'

const ProtectedRoute = ({component, ...rest}: any) => {
    const routeComponent = (props: any) => (
        localStorage.getItem("AUTOTA_AUTH_TOKEN") != null
            ? (<ErrorBoundary>{React.createElement(component, props)}</ErrorBoundary>)
            : <Redirect to={{pathname: '/login'}}/>
    );
    return <Route {...rest} render={routeComponent}/>;
};

export default ProtectedRoute;