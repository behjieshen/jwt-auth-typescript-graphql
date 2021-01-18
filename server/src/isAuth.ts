
import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware"
import { MyContext } from "./MyContext"

// A middleware to check if user is authenticated
export const isAuth:MiddlewareFn<MyContext> = ({context}, next) => {
    // Get authorization key in req headers
    const authorization = context.req.headers['authorization'];

    // Return false if authorization doesn't exist
    if(!authorization) {
        throw new Error('not authenticated')
    }

    // Verify authorization and store it in context
    try {
        const token = authorization?.split(' ')[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any;
    } catch(err) {
        console.log(err);
        throw new Error('not authenticated')
    }

    // Proceed to next middleware
    return next()
}