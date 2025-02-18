import NextAuth, { AuthOptions} from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const mongo_uri = process.env.MONGO_URI;
if (!mongo_uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}

const authOptions: AuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
