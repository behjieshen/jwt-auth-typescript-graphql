import { Response } from "express";

// Send refreshToken by storing it in cookie
export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('jid', token, {
        httpOnly: true,
        path: '/refresh_token'
    })
}