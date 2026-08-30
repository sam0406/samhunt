import { sql } from "./db";
import crypto from "crypto";


function mapJob(row) {
    return {
        id: row.id,

        status: row.status,

        mode: row.mode,

        target: row.target,

        range: row.search_range,

        threads: Number(row.threads),

        compressed: Boolean(row.compressed),

        progress: Number(row.progress),

        checkpoint: row.checkpoint,

        workerState: row.worker_state,

        error: row.error,

        createdAt: row.created_at,

        updatedAt: row.updated_at
    };
}


export async function createJob(config) {

    const id = crypto.randomUUID();

    const rows = await sql`
        INSERT INTO jobs (
            id,
            status,
            mode,
            target,
            search_range,
            threads,
            compressed
        )
        VALUES (
            ${id},
            'queued',
            ${config.mode},
            ${config.target},
            ${config.range},
            ${Number(config.threads) || 1},
            ${Boolean(config.compressed)}
        )
        RETURNING *
    `;

    return mapJob(rows[0]);
}


export async function getJobs() {

    const rows = await sql`
        SELECT *
        FROM jobs
        ORDER BY created_at DESC
    `;

    return rows.map(mapJob);
}


export async function getJob(id) {

    const rows = await sql`
        SELECT *
        FROM jobs
        WHERE id = ${id}
        LIMIT 1
    `;

    if (!rows.length) {
        return null;
    }

    return mapJob(rows[0]);
}


export async function updateJob(id, updates) {

    const current = await getJob(id);

    if (!current) {
        return null;
    }


    const status =
        updates.status ??
        current.status;


    const progress =
        updates.progress ??
        current.progress;


    const checkpoint =
        updates.checkpoint !== undefined
            ? updates.checkpoint
            : current.checkpoint;


    const workerState =
        updates.workerState !== undefined
            ? updates.workerState
            : current.workerState;


    const error =
        updates.error !== undefined
            ? updates.error
            : current.error;


    const checkpointJson =
        checkpoint === null ||
        checkpoint === undefined
            ? null
            : JSON.stringify(checkpoint);


    const workerStateJson =
        workerState === null ||
        workerState === undefined
            ? null
            : JSON.stringify(workerState);


    const rows = await sql`
        UPDATE jobs

        SET
            status = ${status},

            progress = ${progress},

            checkpoint =
                ${checkpointJson}::jsonb,

            worker_state =
                ${workerStateJson}::jsonb,

            error = ${error},

            updated_at = NOW()

        WHERE id = ${id}

        RETURNING *
    `;


    return mapJob(rows[0]);
}
