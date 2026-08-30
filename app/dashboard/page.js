"use client";

import {
    useEffect,
    useState
} from "react";

export default function Dashboard() {

    const [
        jobs,
        setJobs
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);


    async function loadJobs() {

        try {

            const response =
                await fetch(
                    "/api/jobs",
                    {
                        cache: "no-store"
                    }
                );

            const data =
                await response.json();

            if (data.success) {
                setJobs(data.jobs);
            }

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadJobs();

        const timer =
            setInterval(
                loadJobs,
                3000
            );

        return () =>
            clearInterval(timer);

    }, []);


    async function logout() {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

        window.location.href =
            "/login";
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
                        href="/dashboard#new"
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

                    </div>


                    {loading ? (

                        <div className="empty">
                            Loading...
                        </div>

                    ) : jobs.length === 0 ? (

                        <div className="empty">
                            No jobs yet.
                        </div>

                    ) : (

                        <div className="jobs">

                            {jobs.map(job => (

                                <JobRow
                                    key={job.id}
                                    job={job}
                                    reload={loadJobs}
                                />

                            ))}

                        </div>

                    )}

                </section>

            </section>

        </main>
    );
}


function JobForm({
    onCreated
}) {

    const [
        target,
        setTarget
    ] = useState("");

    const [
        range,
        setRange
    ] = useState("");

    const [
        mode,
        setMode
    ] = useState("address");

    const [
        threads,
        setThreads
    ] = useState(1);

    const [
        message,
        setMessage
    ] = useState("");


    async function submit(event) {

        event.preventDefault();

        setMessage("");

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

            setMessage(
                data.error ||
                "Failed"
            );

            return;
        }

        setTarget("");
        setRange("");

        setMessage(
            "Job created."
        );

        onCreated();
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
                    onChange={e =>
                        setMode(
                            e.target.value
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
                    onChange={e =>
                        setTarget(
                            e.target.value
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
                    onChange={e =>
                        setRange(
                            e.target.value
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
                    onChange={e =>
                        setThreads(
                            Number(
                                e.target.value
                            )
                        )
                    }
                />

            </label>


            <button
                className="primary"
                type="submit"
            >
                Create Job
            </button>


            {message && (
                <p className="form-message">
                    {message}
                </p>
            )}

        </form>
    );
}


function JobRow({
    job,
    reload
}) {

    async function action(
        name
    ) {

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

        reload();
    }


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

            </div>


            <div className="job-progress">

                <div className="progress">

                    <div
                        style={{
                            width:
                                `${job.progress}%`
                        }}
                    />

                </div>

                <span>
                    {job.progress}%
                </span>

            </div>


            <div className="job-status">

                <span
                    className={`badge ${job.status}`}
                >
                    {job.status}
                </span>


                {(job.status === "queued" ||
                    job.status === "running") && (

                    <button
                        onClick={() =>
                            action("pause")
                        }
                    >
                        Pause
                    </button>

                )}


                {(job.status === "paused" ||
                    job.status === "stopped") && (

                    <button
                        onClick={() =>
                            action("resume")
                        }
                    >
                        Resume
                    </button>

                )}

            </div>

        </div>
    );
}
