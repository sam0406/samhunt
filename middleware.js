import { NextResponse } from "next/server";


const COOKIE_NAME = "samhunt_session";


function decodeBase64Url(value) {

    try {

        let base64 =
            value
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        while (base64.length % 4) {
            base64 += "=";
        }

        return atob(base64);

    } catch {

        return null;
    }
}


async function verifySession(token) {

    try {

        const decoded =
            decodeBase64Url(token);

        if (!decoded) {
            return false;
        }


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


        const time =
            Number(timestamp);


        if (!Number.isFinite(time)) {
            return false;
        }


        const age =
            Date.now() - time;


        if (
            age < 0 ||
            age > 86400000
        ) {
            return false;
        }


        if (
            !random ||
            random.length < 32
        ) {
            return false;
        }


        if (
            !signature ||
            signature.length !== 64
        ) {
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


        return signature === expected;

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


    /*
    |--------------------------------------------------------------------------
    | Public routes
    |--------------------------------------------------------------------------
    */

    if (
        pathname === "/login" ||
        pathname.startsWith("/api/auth")
    ) {

        return NextResponse.next();
    }


    /*
    |--------------------------------------------------------------------------
    | Read session cookie
    |--------------------------------------------------------------------------
    */

    const token =
        request.cookies.get(
            COOKIE_NAME
        )?.value;


    const valid =
        token
            ? await verifySession(token)
            : false;


    /*
    |--------------------------------------------------------------------------
    | Not authenticated
    |--------------------------------------------------------------------------
    */

    if (!valid) {

        if (
            pathname.startsWith("/api/")
        ) {

            return NextResponse.json(
                {
                    success: false,
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


    /*
    |--------------------------------------------------------------------------
    | Authenticated
    |--------------------------------------------------------------------------
    */

    return NextResponse.next();
}


export const config = {

    matcher: [
        "/dashboard/:path*",
        "/api/jobs/:path*"
    ]

};
