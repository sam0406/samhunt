import { NextResponse } from "next/server";

import {
    authenticate,
    createSession,
    COOKIE_NAME
} from "../../../../lib/auth";

export async function POST(request) {
    try {
        const body = await request.json();

        const username = String(body.username || "");
        const password = String(body.password || "");

        if (!username || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Username and password are required"
                },
                { status: 400 }
            );
        }

        const valid = authenticate(
            username,
            password
        );

        if (!valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid username or password"
                },
                { status: 401 }
            );
        }

        const token = createSession(username);

        const response = NextResponse.json({
            success: true
        });

        response.cookies.set({
            name: COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/"
        });

        return response;

    } catch (error) {

        console.error(
            "LOGIN_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Login server error"
            },
            { status: 500 }
        );
    }
}
