"use client";

import {
    useEffect,
    useState
} from "react";

export default function Dashboard() {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");


    async function loadJobs() {

        try {

            setLoadError("");

            const response = await fetch(
                "/api/jobs",
                {
                    cache: "no-store"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to load jobs"
                );
            }

            setJobs(
                Array.isArray(data.jobs)
                    ? data.jobs
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD_JOBS_ERROR:",
                error
            );

            setJobs([]);

            setLoadError(
                error.message ||
                "Could not load jobs"
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadJobs();

        const timer = setInterval(
            loadJobs,
            3000
        );

        return () =>
            clearInterval(timer);

    }, []);


    async function logout() {

        try {

            await fetch(
                "/api/auth/logout",
                {
                    method: "POST"
                }
            );

        } catch (error) {

            console.error(
                "LOGOUT_ERROR:",
                error
            );

        } finally {

            window.location.href =
                "/login";

        }
    }


    return (

        <main className="dashboard">

            <header className="topbar">

                <div className="brand">

                    <div className="logo">
                        SH
                    </div>

                    <div>
                        <strong>
                            SamHunt
                        </strong>

                        <span>
                            Research Console
                        </span>
                    </div>

                </div>


                <button
                    className="logout"
                    onClick={logout}
                >
                    Logout
                </button>

            </header>


            <section className="content">

                <div className="heading">

                    <div>

                        <span className="eyebrow">
                            DASHBOARD
                        </span>

                        <h1>
                            Workloads
                        </h1>

                    </div>


                    <a
                        href="#new"
                        className="primary"
                    >
                        + New Job
                    </a>

                </div>


                <section
                    id="new"
                    className="card"
                >

                    <h2>
                        New Research Job
                    </h2>

                    <JobForm
                        onCreated={loadJobs}
                    />

                </section>


                <section className="card">

                    <div className="card-title">

                        <div>

                            <h2>
                                Jobs
                            </h2>

                            <p>
                                {jobs.length}
                                {" "}
                                total jobs
                            </p>

                        </div>


                        <button
                            onClick={loadJobs}
                            className="secondary"
                        >
                            Refresh
                        </button>

                    </div>


                    {loading ? (

                        <div className="empty">
                            Loading...
                        </div>

                    ) : loadError ? (

                        <div className="empty">

                            <p>
                                {loadError}
                            </p>

                            <button
                                onClick={loadJobs}
                                className="secondary"
                            >
                                Try again
                            </button>

                        </div>

                    ) : jobs.length === 0 ? (

                        <div className="empty">
                            No jobs yet.
                        </div>

                    ) : (

                        <div className="jobs">

                            {jobs.map(
                                job => (

                                    <JobRow
                                        key={job.id}
                                        job={job}
                                        reload={loadJobs}
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>

            </section>

        </main>
    );
}


/*
|--------------------------------------------------------------------------
| New Job Form
|--------------------------------------------------------------------------
*/

function JobForm({
    onCreated
}) {

    const [target, setTarget] =
        useState("");

    const [range, setRange] =
        useState("");

    const [mode, setMode] =
        useState("address");

    const [threads, setThreads] =
        useState(1);

    const [message, setMessage] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    async function submit(event) {

        event.preventDefault();

        setMessage("");
        setSubmitting(true);

        try {

            const response =
                await fetch(
                    "/api/jobs",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                target,
                                range,
                                mode,
                                threads
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to create job"
                );
            }

            setTarget("");
            setRange("");
            setThreads(1);

            setMessage(
                "Job created successfully."
            );

            await onCreated();

        } catch (error) {

            console.error(
                "CREATE_JOB_ERROR:",
                error
            );

            setMessage(
                error.message ||
                "Could not create job"
            );

        } finally {

            setSubmitting(false);

        }
    }


    return (

        <form
            className="job-form"
            onSubmit={submit}
        >

            <label>

                Mode

                <select
                    value={mode}
                    onChange={event =>
                        setMode(
                            event.target.value
                        )
                    }
                >

                    <option value="address">
                        Address
                    </option>

                    <option value="pubkey">
                        Public Key
                    </option>

                    <option value="xpub">
                        Extended Public Key
                    </option>

                </select>

            </label>


            <label>

                Target

                <input
                    value={target}
                    onChange={event =>
                        setTarget(
                            event.target.value
                        )
                    }
                    placeholder="Research target"
                    required
                />

            </label>


            <label>

                Range

                <input
                    value={range}
                    onChange={event =>
                        setRange(
                            event.target.value
                        )
                    }
                    placeholder="START:END"
                    required
                />

            </label>


            <label>

                Threads

                <input
                    type="number"
                    min="1"
                    max="256"
                    value={threads}
                    onChange={event =>
                        setThreads(
                            Math.max(
                                1,
                                Number(
                                    event.target.value
                                ) || 1
                            )
                        )
                    }
                />

            </label>


            <button
                className="primary"
                type="submit"
                disabled={submitting}
            >

                {submitting
                    ? "Creating..."
                    : "Create Job"}

            </button>


            {message && (

                <p className="form-message">
                    {message}
                </p>

            )}

        </form>
    );
}


/*
|--------------------------------------------------------------------------
| Job Row
|--------------------------------------------------------------------------
*/

function JobRow({
    job,
    reload
}) {

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");


    async function action(name) {

        setBusy(true);
        setError("");

        try {

            const response =
                await fetch(
                    `/api/jobs/${job.id}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                action: name
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Action failed"
                );
            }

            await reload();

        } catch (error) {

            console.error(
                "JOB_ACTION_ERROR:",
                error
            );

            setError(
                error.message ||
                "Action failed"
            );

        } finally {

            setBusy(false);

        }
    }


    const progress =
        Number.isFinite(
            Number(job.progress)
        )
            ? Number(job.progress)
            : 0;


    return (

        <div className="job">

            <div>

                <strong>
                    {job.id}
                </strong>

                <span>
                    {job.mode}
                    {" · "}
                    {job.target}
                </span>

                {job.range && (

                    <span>
                        Range: {job.range}
                    </span>

                )}

            </div>


            <div className="job-progress">

                <div className="progress">

                    <div
                        style={{
                            width:
                                `${Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        progress
                                    )
                                )}%`
                        }}
                    />

                </div>

                <span>
                    {progress.toFixed(2)}%
                </span>

            </div>


            <div className="job-status">

                <span
                    className={
                        `badge ${job.status}`
                    }
                >
                    {job.status}
                </span>


                {(job.status === "queued" ||
                    job.status === "running") && (

                    <button
                        disabled={busy}
                        onClick={() =>
                            action("pause")
                        }
                    >
                        {busy
                            ? "..."
                            : "Pause"}
                    </button>

                )}


                {(job.status === "paused" ||
                    job.status === "stopped") && (

                    <button
                        disabled={busy}
                        onClick={() =>
                            action("resume")
                        }
                    >
                        {busy
                            ? "..."
                            : "Resume"}
                    </button>

                )}

            </div>


            {error && (

                <div className="job-error">
                    {error}
                </div>

            )}

        </div>
    );
}
