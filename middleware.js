import {
    NextResponse
} from "next/server";

import {
    COOKIE_NAME,
    validSession
} from "./lib/auth";

export function middleware(request) {

    const pathname =
        request.nextUrl.pathname;

    if (
        pathname === "/login" ||
        pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next();
    }

    const token =
        request.cookies.get(
            COOKIE_NAME
        )?.value;

    if (!token || !validSession(token)) {

        if (
            pathname.startsWith("/api/")
        ) {
            return NextResponse.json(
                {
                    error:
                        "Authentication required"
                },
                {
                    status: 401
                }
            );
        }

        return NextResponse.redirect(
            new URL(
                "/login",
                request.url
            )
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/jobs/:path*"
    ]
};
