import { NextResponse } from "next/server";

import {
    getJob,
    updateJob
} from "../../../../lib/jobs";

import {
    createCheckpoint,
    restoreCheckpoint
} from "../../../../lib/checkpoint";


export async function GET(request, { params }) {

    try {

        const { id } = await params;

        const job = await getJob(id);

        if (!job) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Job not found"
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            job
        });

    } catch (error) {

        console.error(
            "GET_JOB_ERROR",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error?.message ||
                    String(error)
            },
            {
                status: 500
            }
        );
    }
}


export async function POST(request, { params }) {

    try {

        const { id } = await params;

        const body =
            await request.json();

        const action =
            String(body?.action || "")
                .trim()
                .toLowerCase();


        console.log(
            "JOB_ACTION",
            {
                id,
                action
            }
        );


        const job =
            await getJob(id);


        if (!job) {

            return NextResponse.json(
                {
                    success: false,
                    error: "Job not found"
                },
                {
                    status: 404
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | PAUSE
        |--------------------------------------------------------------------------
        */

        if (action === "pause") {

            if (
                job.status !== "queued" &&
                job.status !== "running"
            ) {

                return NextResponse.json(
                    {
                        success: false,
                        error:
                            `Cannot pause a ${job.status} job`
                    },
                    {
                        status: 400
                    }
                );
            }


            console.log(
                "CREATING_CHECKPOINT",
                job.id
            );


            const checkpoint =
                createCheckpoint(job);


            console.log(
                "CHECKPOINT_CREATED",
                checkpoint
            );


            const updated =
                await updateJob(
                    job.id,
                    {
                        status: "paused",
                        checkpoint,
                        workerState: {
                            state: "paused",
                            checkpointSaved: true,
                            checkpointVersion:
                                checkpoint.version,
                            savedAt:
                                checkpoint.savedAt
                        }
                    }
                );


            console.log(
                "JOB_PAUSED",
                updated
            );


            return NextResponse.json({
                success: true,
                action: "pause",
                job: updated
            });
        }


        /*
        |--------------------------------------------------------------------------
        | STOP
        |--------------------------------------------------------------------------
        */

        if (action === "stop") {

            const checkpoint =
                createCheckpoint(job);


            const updated =
                await updateJob(
                    job.id,
                    {
                        status: "stopped",
                        checkpoint,
                        workerState: {
                            state: "stopped",
                            checkpointSaved: true,
                            checkpointVersion:
                                checkpoint.version,
                            savedAt:
                                checkpoint.savedAt
                        }
                    }
                );


            return NextResponse.json({
                success: true,
                action: "stop",
                job: updated
            });
        }


        /*
        |--------------------------------------------------------------------------
        | RESUME
        |--------------------------------------------------------------------------
        */

        if (action === "resume") {

            if (
                job.status !== "paused" &&
                job.status !== "stopped"
            ) {

                return NextResponse.json(
                    {
                        success: false,
                        error:
                            `Cannot resume a ${job.status} job`
                    },
                    {
                        status: 400
                    }
                );
            }


            if (!job.checkpoint) {

                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "No checkpoint available"
                    },
                    {
                        status: 400
                    }
                );
            }


            const restored =
                restoreCheckpoint(
                    job.checkpoint
                );


            const updated =
                await updateJob(
                    job.id,
                    {
                        status: "queued",

                        workerState: {
                            state: "queued",
                            resumed: true,

                            resumeFrom: {
                                progress:
                                    restored.progress,

                                range:
                                    restored.range,

                                mode:
                                    restored.mode,

                                target:
                                    restored.target,

                                threads:
                                    restored.threads,

                                compressed:
                                    restored.compressed
                            },

                            resumedAt:
                                new Date().toISOString()
                        }
                    }
                );


            return NextResponse.json({
                success: true,
                action: "resume",
                job: updated
            });
        }


        return NextResponse.json(
            {
                success: false,
                error:
                    "Unknown action"
            },
            {
                status: 400
            }
        );


    } catch (error) {

        console.error(
            "JOB_ACTION_ERROR",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error?.message ||
                    String(error),

                errorName:
                    error?.name ||
                    "UnknownError",

                errorStack:
                    process.env.NODE_ENV === "development"
                        ? error?.stack
                        : undefined
            },
            {
                status: 500
            }
        );
    }
}
