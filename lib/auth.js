import crypto from "crypto";

export const COOKIE_NAME = "samhunt_session";

function getSecret() {
    const value = process.env.SAMHUNT_SESSION_SECRET;

    if (!value) {
        throw new Error(
            "SAMHUNT_SESSION_SECRET is not configured"
        );
    }

    return value;
}

export function authenticate(username, password) {
    return (
        username === process.env.SAMHUNT_ADMIN_USER &&
        password === process.env.SAMHUNT_ADMIN_PASSWORD
    );
}

export function createSession(username) {
    const timestamp = Date.now();

    const random =
        crypto.randomBytes(32).toString("hex");

    const payload =
        `${username}:${timestamp}:${random}`;

    const signature =
        crypto
            .createHmac(
                "sha256",
                getSecret()
            )
            .update(payload)
            .digest("hex");

    return Buffer
        .from(
            `${payload}:${signature}`
        )
        .toString("base64url");
}
