import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int } from 'type-graphql';
import { User } from './entity/User';
import { hash, compare } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string

    @Field(() => User)
    user: User
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi!';
    }

    // Protected query
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(@Ctx() { payload }: MyContext) {
        return `Your user id is: ${payload!.userId}`;
    }

    // Return all users query
    @Query(() => [User])
    users() {
        return User.find()
    }

    // Return current user route
    @Query(() => User, { nullable: true })
    me(@Ctx() context: MyContext) {
        // Check for authorization header
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            return null;
        }

        // Verify JWT token and return if user exists
        try {
            const token = authorization?.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            return User.findOne(payload.userId)
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Refresh token by increasing 1 in tokenVersion
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => Int) userId: number
    ) {
        await getConnection().getRepository(User).increment({ id: userId }, 'tokenVersion', 1)

        return true;
    }

    // Login query
    @Mutation(() => LoginResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        // Check if user exist
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw new Error('User doesn\'t exist')
        }

        // Check if password is valid
        const valid = await compare(password, user.password)
        if (!valid) {
            throw new Error('Invalid login details')
        }

        // Else create a new refreshToken and accessToken for user
        sendRefreshToken(res, createRefreshToken(user))
        return {
            accessToken: createAccessToken(user),
            user
        }
    }

    // Register query
    @Mutation(() => Boolean)
    async register(
        @Arg("email") email: string,
        @Arg("password") password: string,
    ) {
        // hash password
        const hashedPassword = await hash(password, 12);

        // Insert new User
        try {
            await User.insert({
                email,
                password: hashedPassword
            })
        } catch (err) {
            console.log(err);
            return false;
        }

        return true;
    }

    // Logout query
    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
        // Change cookie to empty string
        sendRefreshToken(res, "");
        return true;
    }
}