import { NextRequest, NextResponse } from "next/server";
import { athleteProfileSchema, trainingSessionSchema } from "@/lib/validation/athleteSchema";
import { generateComprehensiveAthletePlan } from "@/lib/recommendations/recommendationService";
import { getAuthenticatedAccount } from "@/lib/auth/http";
import { isSameOriginRequest } from "@/lib/auth/http";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json(
        { success: false, error: "Request origin could not be verified." },
        { status: 403, headers: noStoreHeaders }
      );
    }
    const account = getAuthenticatedAccount(req);
    if (!account) {
      return NextResponse.json(
        { success: false, error: "Sign in to generate a plan." },
        { status: 401, headers: noStoreHeaders }
      );
    }
    if (!account.profile) {
      return NextResponse.json(
        { success: false, error: "Complete your athlete profile first." },
        { status: 428, headers: noStoreHeaders }
      );
    }

    const body = await req.json();
    const parseResult = trainingSessionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for training session parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const athleteResult = athleteProfileSchema.safeParse({
      ...account.profile,
      ...parseResult.data,
      id: account.id,
      ...(parseResult.data.trainingType === "rest_day"
        ? { trainingIntensity: "rest", trainingDurationMinutes: 0 }
        : {}),
    });
    if (!athleteResult.success) {
      return NextResponse.json(
        { success: false, error: "Saved profile or session data is incomplete." },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const decisionPlan = await generateComprehensiveAthletePlan(athleteResult.data);
    return NextResponse.json({ success: true, plan: decisionPlan }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Athlete plan generation failed.", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal error processing sports nutrition assessment",
      },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
