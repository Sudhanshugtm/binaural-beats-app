import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const client = await clientPromise;
          const db = client.db();
          const users = db.collection("users");
          
          // Normalize email to lowercase
          const user = await users.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            console.log("No password found for user");
            throw new Error("Invalid email or password");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log("Invalid password");
            throw new Error("Invalid email or password");
          }

          // Return standardized user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }