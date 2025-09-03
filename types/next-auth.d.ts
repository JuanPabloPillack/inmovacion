// types/next-auth.d.ts
import NextAuth, {DefaultSessionç} from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth"{
    interface Session {
        user: {
            role?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
    }
}

declare module "next-auth/jwt"{
    interface JWT {
        role?: string;
    }
}