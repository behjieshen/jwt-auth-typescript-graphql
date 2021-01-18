import "reflect-metadata";
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from 'cookie-parser';
import { verify } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from './entity/User';
import { sendRefreshToken } from "./sendRefreshToken";
import cors from 'cors';

(async () => {

    // Express Setup
    const app = express();
    app.use(cors(
        {
            credentials: true,
            origin: 'http://localhost:3000'
        }
    ));
    app.use(cookieParser());

    // POST endpoint to refresh token 
    app.post('/refresh_token', async (req, res) => {
        const token = req.cookies.jid;

        // Return false if no cookies exist
        if (!token) {
            return res.send({ ok: false, accessToken: '', message: 'no token' })
        }

        // Return false if token does not include REFRESH_TOKEN_SECRET
        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: '', message: 'token error' })
        }

        const user = await User.findOne({ id: payload.userId });

        // Return false if user doesn't exist
        if (!user) {
            return res.send({ ok: false, accessToken: '', message: 'no user' })
        }

        // Return false if the token version doesn't match
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: '', message: 'token version error' })
        }

        sendRefreshToken(res, createRefreshToken(user))

        return res.send({ ok: true, accessToken: createAccessToken(user) });
    })

    await createConnection();

    // Include the resolver in Apollo Server and pass express res and req as context
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    })

    apolloServer.applyMiddleware({ app, cors: false })

    // Express Listen
    app.listen(4000, () => {
        console.log("express server has started")
    })
})()
