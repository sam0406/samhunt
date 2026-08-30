"use client";

import {
    useState
} from "react";

import {
    useRouter
} from "next/navigation";

export default function LoginPage() {

    const router =
        useRouter();

    const [
        username,
        setUsername
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);


    async function submit(event) {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                password
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Login failed"
                );
            }

            router.push(
                "/dashboard"
            );

            router.refresh();

        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }
    }


    return (

        <main className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    SH
                </div>

                <h1>
                    SamHunt
                </h1>

                <p>
                    Research Console
                </p>


                <form
                    onSubmit={submit}
                >

                    <label>
                        Username

                        <input
                            value={username}
                            onChange={e =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            autoComplete="username"
                        />

                    </label>


                    <label>
                        Password

                        <input
                            type="password"
                            value={password}
                            onChange={e =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            autoComplete="current-password"
                        />

                    </label>


                    {error && (

                        <div className="error">
                            {error}
                        </div>

                    )}


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>

            </div>

        </main>
    );
}
