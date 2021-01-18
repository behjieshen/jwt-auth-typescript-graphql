import { sign } from 'jsonwebtoken';
import { User } from './entity/User';

// Generate new accessToken
export const createAccessToken = (user: User) => {
    return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' })
}

// Generate new refreshToken
export const createRefreshToken = (user: User) => {
    return sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '15m' })
}