import {
    NextResponse
} from "next/server";

import {
    getJob,
    updateJob
} from "../../../../lib/jobs";

import {
    createCheckpoint
} from "../../../../lib/checkpoint";

export async function GET(
    request,
    { params }
) {

    const job =
        getJob(params.id);

    if (!job) {

        return NextResponse.json(
            {
                error:
                    "Job not found"
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
}


export async function POST(
    request,
    { params }
) {

    const job =
        getJob(params.id);

    if (!job) {

        return NextResponse.json(
            {
                error:
                    "Job not found"
            },
            {
                status: 404
            }
        );
    }

    const body =
        await request.json();

    const action =
        body.action;


    if (action === "pause") {

        const checkpoint =
            createCheckpoint(job);

        updateJob(
            job.id,
            {
                status: "paused",
                checkpoint
            }
        );

    }

    else if (action === "stop") {

        const checkpoint =
            createCheckpoint(job);

        updateJob(
            job.id,
            {
                status: "stopped",
                checkpoint
            }
        );

    }

    else if (action === "resume") {

        if (!job.checkpoint) {

            return NextResponse.json(
                {
                    error:
                        "No checkpoint available"
                },
                {
                    status: 400
                }
            );
        }

        updateJob(
            job.id,
            {
                status: "queued"
            }
        );

    }

    else {

        return NextResponse.json(
            {
                error:
                    "Unknown action"
            },
            {
                status: 400
            }
        );
    }

    return NextResponse.json({
        success: true,
        job: getJob(job.id)
    });
}
