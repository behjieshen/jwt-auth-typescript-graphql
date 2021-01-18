import React from 'react';
import { Link } from 'react-router-dom';
import { useLogoutMutation, useMeQuery } from './generated/graphql';
import { setAccessToken } from './accessToken';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = ({}) => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();

  let body: any = null;

  if (loading) {
    body = null;
  } else if (data && data.me) {
    body = <div>You are logged in as: {data.me.email}</div>;
  } else {
    body = <div>Not logged in</div>;
  }

  return (
    <header>
      <div>
        <Link to='/'>Home</Link>
      </div>
      <div>
        <Link to='/register'>Register</Link>
      </div>
      <div>
        <Link to='/login'>Login</Link>
      </div>
      <div>
        <Link to='/bye'>Bye</Link>
      </div>
      {!loading && data && data.me ? (
        <div>
          <button
            onClick={async () => {
              await logout();
              setAccessToken('');
              try {
                await client?.resetStore();
              } catch(err) {
                console.log(err)
              }
            }}
          >
            Logout
          </button>
        </div>
      ) : null}

      {body}
    </header>
  );
};
