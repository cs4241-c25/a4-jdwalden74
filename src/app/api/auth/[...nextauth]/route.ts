import NextAuth, { AuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { JWT } from "next-auth/jwt";

const mongo_uri = process.env.MONGO_URI;
if (!mongo_uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.username || !credentials?.password) return null;
                console.log("Received credentials:", credentials);

                if (!credentials) {
                    console.log("No credentials provided.");
                    return null;
                }

                const client = new MongoClient(mongo_uri);
                await client.connect();
                const db = client.db();

                const user = await db.collection("users").findOne({ username: credentials.username });

                if (user) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (isValid) {
                        return {
                            id: user._id.toString(),
                            name: user.username,
                            email: user.email || "",
                        };
                    }
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
            if (user) {
                token.id = user.id;
                token.username = user.name;
            }
            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            session.user = {
                name: token.username as string,
            };
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
