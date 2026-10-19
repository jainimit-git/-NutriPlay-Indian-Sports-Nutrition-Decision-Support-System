import { NextRequest, NextResponse } from "next/server";
import { athleteProfileSchema } from "@/lib/validation/athleteSchema";
import { generateComprehensiveAthletePlan } from "@/lib/recommendations/recommendationService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = athleteProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for athlete parameters",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const decisionPlan = await generateComprehensiveAthletePlan(parseResult.data);
    return NextResponse.json({ success: true, plan: decisionPlan });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal error processing sports nutrition assessment",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

