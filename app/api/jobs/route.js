import { NextResponse } from "next/server";

import {
    createJob,
    getJobs
} from "../../../lib/jobs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const jobs = await getJobs();

        return NextResponse.json({
            success: true,
            jobs: Array.isArray(jobs) ? jobs : []
        });

    } catch (error) {
        console.error("GET_JOBS_ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                jobs: [],
                error: "Database error"
            },
            {
                status: 500
            }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const target =
            String(body.target || "").trim();

        const range =
            String(body.range || "").trim();

        if (!target) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Target is required"
                },
                { status: 400 }
            );
        }

        if (!range) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Range is required"
                },
                { status: 400 }
            );
        }

        const job = await createJob({
            mode: body.mode || "address",
            target,
            range,
            threads: body.threads || 1,
            compressed: Boolean(body.compressed)
        });

        return NextResponse.json({
            success: true,
            job
        });

    } catch (error) {
        console.error("CREATE_JOB_ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Could not create job"
            },
            { status: 500 }
        );
    }
}
