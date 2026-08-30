import crypto from "crypto";

const COOKIE_NAME = "samhunt_session";

function secret() {
    return (
        process.env.SAMHUNT_SESSION_SECRET ||
        "development-only-secret"
    );
}

function createToken(username) {

    const timestamp = Date.now();

    const payload =
        `${username}:${timestamp}`;

    const signature =
        crypto
            .createHmac("sha256", secret())
            .update(payload)
            .digest("hex");

    return Buffer
        .from(`${payload}:${signature}`)
        .toString("base64url");
}

function verifyToken(token) {

    try {

        const decoded =
            Buffer
                .from(token, "base64url")
                .toString();

        const parts =
            decoded.split(":");

        if (parts.length !== 3) {
            return false;
        }

        const [
            username,
            timestamp,
            signature
        ] = parts;

        const payload =
            `${username}:${timestamp}`;

        const expected =
            crypto
                .createHmac(
                    "sha256",
                    secret()
                )
                .update(payload)
                .digest("hex");

        if (
            !crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expected)
            )
        ) {
            return false;
        }

        const age =
            Date.now() - Number(timestamp);

        // 24 hour session
        if (age > 86400000) {
            return false;
        }

        return (
            username ===
            process.env.SAMHUNT_ADMIN_USER
        );

    } catch {
        return false;
    }
}

export function authenticate(
    username,
    password
) {

    return (
        username ===
            process.env.SAMHUNT_ADMIN_USER &&
        password ===
            process.env.SAMHUNT_ADMIN_PASSWORD
    );
}

export function createSession(username) {
    return createToken(username);
}

export function validSession(token) {
    return verifyToken(token);
}

export { COOKIE_NAME };
