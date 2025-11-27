// src/middleware.ts

import NextAuth from "next-auth"
import { NextResponse } from "next/server";
import authConfig from "../auth.config"

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = [
    "/",
    "/usuarios/nuevo",
    "/login",
    "/api/auth/verify-email",
    "/forgot-password",
    "/api/auth/reset-password",
    "/reset-password",
    "/propiedades",
    
    

]

export default middleware((req) =>{
    const {nextUrl, auth} = req;
    const isLoggedIn = !!auth?.user;
    console.log({isLoggedIn})

    // Proteger rutas
    if (!publicRoutes.includes(nextUrl.pathname) && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
matcher: [
// Skip Next.js internals and all static files, unless found in search params
'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
// Always run for API routes
'/(api|trpc)(.*)',
],
}