import React from 'react';
import { useHelloQuery } from './generated/graphql';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom'
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';

export const Routes: React.FC = () => {
  return <BrowserRouter>
  <div>
    <header>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/register">Register</Link>
      </div>
      <div>
        <Link to="/login">Login</Link>
      </div>
    </header>
  </div>
    <Switch>
      <Route exact path="/" component={Home}></Route>
      <Route exact path="/register" component={Register}></Route>
      <Route exact path="/login" component={Login}></Route>
    </Switch>
  </BrowserRouter>

}
