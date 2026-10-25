import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAccount, isSameOriginRequest } from "@/lib/auth/http";
import { saveAccountProfile } from "@/lib/auth/accountStore";
import { athletePersonalProfileSchema } from "@/lib/validation/athleteSchema";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  try {
    const account = getAuthenticatedAccount(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in to view your profile." }, { status: 401, headers: noStoreHeaders });
    }
    if (!account.profile) {
      return NextResponse.json({ error: "Athlete profile is not complete." }, { status: 404, headers: noStoreHeaders });
    }
    return NextResponse.json(
      {
        profile: account.profile,
        createdAt: account.profileCreatedAt,
        updatedAt: account.profileUpdatedAt,
      },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    console.error("Athlete profile lookup failed.", error);
    return NextResponse.json({ error: "Could not load the athlete profile." }, { status: 500, headers: noStoreHeaders });
  }
}

export async function PUT(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }
  try {
    const account = getAuthenticatedAccount(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in to save your profile." }, { status: 401, headers: noStoreHeaders });
    }
    const parsed = athletePersonalProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted profile fields and try again.", details: parsed.error.flatten() },
        { status: 400, headers: noStoreHeaders }
      );
    }
    const saved = saveAccountProfile(account.id, parsed.data);
    if (!saved) {
      return NextResponse.json({ error: "Account no longer exists." }, { status: 401, headers: noStoreHeaders });
    }
    return NextResponse.json(saved, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Athlete profile save failed.", error);
    return NextResponse.json({ error: "Could not save the athlete profile." }, { status: 500, headers: noStoreHeaders });
  }
}
