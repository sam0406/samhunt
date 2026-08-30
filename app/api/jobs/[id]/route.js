export function createCheckpoint(job) {
    return {
        version: 1,

        jobId: job.id,

        savedAt: new Date().toISOString(),

        progress: Number(job.progress) || 0,

        range: job.range,

        state: {
            mode: job.mode,
            target: job.target,
            threads: Number(job.threads) || 1,
            compressed: Boolean(job.compressed)
        }
    };
}


export function restoreCheckpoint(checkpoint) {
    if (!checkpoint) {
        return null;
    }

    if (
        typeof checkpoint !== "object" ||
        checkpoint.version !== 1
    ) {
        throw new Error(
            "Invalid checkpoint format"
        );
    }

    const state =
        checkpoint.state || {};

    return {
        jobId: checkpoint.jobId,

        progress:
            Number(checkpoint.progress) || 0,

        range:
            checkpoint.range || "",

        mode:
            state.mode || "address",

        target:
            state.target || "",

        threads:
            Number(state.threads) || 1,

        compressed:
            Boolean(state.compressed)
    };
}
