import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import reportWebVitals from './reportWebVitals';
import { ApolloProvider } from '@apollo/react-hooks';
import { getAccessToken, setAccessToken } from './accessToken';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql', credentials: 'include' });

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const tokenRefreshLink = new TokenRefreshLink({
  accessTokenField: 'accessToken',
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();

    if (!token) {
      return true;
    }

    try {
      const { exp }: { exp: number } = jwtDecode(token);

      if (Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      console.log('Error here...');
      return false;
    }
  },
  fetchAccessToken: () => {
    return fetch('http://localhost:4000/refresh_token', {
      method: 'POST',
      credentials: 'include',
    });
  },
  handleFetch: (accessToken) => {
    setAccessToken(accessToken);
  },
  handleError: (err) => {
    console.warn('Your refresh token is invalid. Try to relogin');
    console.log(err);
  },
});

const client = new ApolloClient({
  link: from([tokenRefreshLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
