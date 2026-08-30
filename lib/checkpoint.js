export function createCheckpoint(job) {

    return {

        jobId: job.id,

        progress: job.progress,

        range: job.range,

        status: job.status,

        savedAt:
            new Date().toISOString(),

        state: {

            mode: job.mode,

            target: job.target,

            threads: job.threads,

            compressed:
                job.compressed

        }

    };
}

export function restoreCheckpoint(
    checkpoint
) {

    if (!checkpoint) {
        return null;
    }

    return {

        progress:
            checkpoint.progress,

        range:
            checkpoint.range,

        status:
            checkpoint.status,

        ...checkpoint.state

    };
}
