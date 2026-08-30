import { NextResponse } from "next/server";

import {
    COOKIE_NAME
} from "./lib/auth";


async function verifySession(token) {

    try {

        const decoded =
            Buffer
                .from(
                    token,
                    "base64url"
                )
                .toString();

        const parts =
            decoded.split(":");

        if (parts.length !== 4) {
            return false;
        }

        const [
            username,
            timestamp,
            random,
            signature
        ] = parts;

        if (
            username !==
            process.env.SAMHUNT_ADMIN_USER
        ) {
            return false;
        }

        const age =
            Date.now() -
            Number(timestamp);

        if (
            !Number.isFinite(age) ||
            age < 0 ||
            age > 86400000
        ) {
            return false;
        }

        if (!random || random.length < 32) {
            return false;
        }

        const payload =
            `${username}:${timestamp}:${random}`;

        const secret =
            process.env.SAMHUNT_SESSION_SECRET;

        if (!secret) {
            return false;
        }

        const encoder =
            new TextEncoder();

        const key =
            await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                {
                    name: "HMAC",
                    hash: "SHA-256"
                },
                false,
                ["sign"]
            );

        const expectedBuffer =
            await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(payload)
            );

        const expected =
            Array
                .from(
                    new Uint8Array(
                        expectedBuffer
                    )
                )
                .map(
                    byte =>
                        byte
                            .toString(16)
                            .padStart(2, "0")
                )
                .join("");

        return (
            signature === expected
        );

    } catch (error) {

        console.error(
            "SESSION_VERIFY_ERROR:",
            error
        );

        return false;
    }
}


export async function middleware(request) {

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

    const valid =
        token
            ? await verifySession(token)
            : false;

    if (!valid) {

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
