import React from 'react';
import { useHelloQuery } from './generated/graphql';
import {BrowserRouter, Link, Route, Switch} from 'react-router-dom'
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Bye } from './pages/Bye';
import { Header } from './Header';

export const Routes: React.FC = () => {
  return <BrowserRouter>
  <div>
    <Header></Header>
  </div>
    <Switch>
      <Route exact path="/" component={Home}></Route>
      <Route exact path="/register" component={Register}></Route>
      <Route exact path="/login" component={Login}></Route>
      <Route exact path="/bye" component={Bye}></Route>
    </Switch>
  </BrowserRouter>

}
