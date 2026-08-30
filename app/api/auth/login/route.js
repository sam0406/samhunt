import {
    NextResponse
} from "next/server";

import {
    authenticate,
    createSession,
    COOKIE_NAME
} from "../../../../lib/auth";

export async function POST(request) {

    try {

        const body =
            await request.json();

        const username =
            String(
                body.username || ""
            );

        const password =
            String(
                body.password || ""
            );

        if (
            !authenticate(
                username,
                password
            )
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid username or password"
                },
                {
                    status: 401
                }
            );
        }

        const token =
            createSession(username);

        const response =
            NextResponse.json({
                success: true
            });

        response.cookies.set(
            COOKIE_NAME,
            token,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                maxAge: 86400,
                path: "/"
            }
        );

        return response;

    } catch {

        return NextResponse.json(
            {
                success: false,
                error: "Invalid request"
            },
            {
                status: 400
            }
        );
    }
}
