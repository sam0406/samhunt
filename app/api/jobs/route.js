import {
    NextResponse
} from "next/server";

import {
    createJob,
    getJobs
} from "../../../lib/jobs";

export async function GET() {

    return NextResponse.json({
        success: true,
        jobs: getJobs()
    });
}

export async function POST(request) {

    try {

        const body =
            await request.json();

        const target =
            String(
                body.target || ""
            ).trim();

        const range =
            String(
                body.range || ""
            ).trim();

        if (!target) {

            return NextResponse.json(
                {
                    error:
                        "Target is required"
                },
                {
                    status: 400
                }
            );
        }

        if (!range) {

            return NextResponse.json(
                {
                    error:
                        "Range is required"
                },
                {
                    status: 400
                }
            );
        }

        const job =
            createJob({
                mode:
                    body.mode ||
                    "address",

                target,

                range,

                threads:
                    body.threads || 1,

                compressed:
                    body.compressed
            });

        return NextResponse.json({
            success: true,
            job
        });

    } catch {

        return NextResponse.json(
            {
                error:
                    "Could not create job"
            },
            {
                status: 400
            }
        );
    }
}
