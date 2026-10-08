import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";

const adminRole = "admin";
const userRole = "user";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: userRole, // any user logged in will be normal user by default
        };
      },
    },
  },
  plugins: [
    admin({
      adminRoles: [adminRole],
      defaultRole: userRole,
    }),
    nextCookies(),
  ],
});
