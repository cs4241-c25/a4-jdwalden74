import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SessionStrategy } from "next-auth";


export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                if (credentials?.username === 'admin' && credentials.password === 'password') {
                    return { id: '1', name: 'Admin' };
                }
                return null;
            }
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt' as SessionStrategy,
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
