import crypto from "crypto";

const jobs = new Map();

export function createJob(config) {

    const id =
        crypto.randomUUID();

    const job = {

        id,

        status: "queued",

        mode: config.mode,

        target: config.target,

        range: config.range,

        threads:
            Number(config.threads) || 1,

        compressed:
            Boolean(config.compressed),

        progress: 0,

        checkpoint: null,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

    jobs.set(id, job);

    return job;
}

export function getJobs() {
    return Array.from(
        jobs.values()
    );
}

export function getJob(id) {
    return jobs.get(id) || null;
}

export function updateJob(
    id,
    updates
) {

    const job =
        jobs.get(id);

    if (!job) {
        return null;
    }

    Object.assign(
        job,
        updates,
        {
            updatedAt:
                new Date().toISOString()
        }
    );

    jobs.set(id, job);

    return job;
}
