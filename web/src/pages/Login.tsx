import { access } from 'fs';
import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import {getAccessToken, setAccessToken} from '../accessToken';

export const Login: React.FC<RouteComponentProps> = ({history}) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [login] = useLoginMutation();

        return <form onSubmit={async e => {
            e.preventDefault();
            console.log("form submitted");
            const response = await login({
                variables: {
                    email,
                    password
                },
                update: (store, {data}) => {
                    if(!data) {
                        return null
                    }
                    store.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            me: data.login.user
                        }
                    })
                }
            })

            console.log(response);

            if(response && response.data) {
                setAccessToken(response.data.login.accessToken);
                console.log(getAccessToken());
            }

            history.push("/");
        }}>
            <div>
                <input placeholder="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
                <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit">Login</button>
        </form>
}