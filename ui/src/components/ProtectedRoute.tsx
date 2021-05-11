import React from 'react'
import { Redirect, Route } from 'react-router-dom'

const ProtectedRoute = ({component, ...rest}: any) => {
    const routeComponent = (props: any) => (
        localStorage.getItem("AUTOTA_AUTH_TOKEN") != null
            ? React.createElement(component, props)
            : <Redirect to={{pathname: '/login'}}/>
    );
    return <Route {...rest} render={routeComponent}/>;
};

export default ProtectedRoute;