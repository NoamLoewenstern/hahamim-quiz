import { signIn } from "next-auth/react";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import { env } from "~/env.mjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  type UserRole = "ADMIN" | "USER";

  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user, token }) {
      return {
        ...session,
        id: token?.id || user.id,
        user: {
          ...session.user,
          ...user, // includes 'role'
          // id: user.id,
          id: token?.id || user.id,
        },
      };
    },
    signIn: async ({ account, profile }) => {
      if (!account || !profile) return false; // works for oauth providers, like google
      // if (account.provider === "google") {
      //   const gProfile = profile as GoogleProfile;
      //   return !!gProfile.email_verified; // if email is not verified, don't sign in
      // }
      return true;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "EmailCredentials",
      name: "EmailCredentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });
        return user;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
