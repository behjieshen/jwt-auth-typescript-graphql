import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import {gql} from 'apollo-boost';
import { useHelloQuery } from './generated/graphql';

const App: React.FC = () => {
  const {data, loading} =  useHelloQuery()

  if(loading || !data) {
    return <div>loading...</div>
  } 

  return <div>{data.hello}</div>

}

export default App;
