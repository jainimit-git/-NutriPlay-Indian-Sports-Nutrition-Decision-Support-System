import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  accountSession,
  assertSessionConfiguration,
  authenticateAccount,
  createSessionToken,
  getAccountById,
  getSessionAccountId,
  registerAccount,
  revokeSessionToken,
} from "@/lib/auth/accountStore";
import { isSameOriginRequest } from "@/lib/auth/http";

export const dynamic = "force-dynamic";

const authInputSchema = z.object({
  action: z.enum(["register", "login"]),
  name: z.string().trim().min(2).max(60).optional(),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
}).superRefine((input, context) => {
  if (input.action === "register" && !input.name) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Enter your name." });
  }
});

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

function setSessionCookie(response: NextResponse, accountId: string) {
  response.cookies.set(accountSession.cookieName, createSessionToken(accountId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accountSession.maxAge,
  });
}

export async function GET(request: NextRequest) {
  try {
    const accountId = getSessionAccountId(
      request.cookies.get(accountSession.cookieName)?.value
    );
    const account = accountId ? getAccountById(accountId) : null;
    if (!account) {
      const response = NextResponse.json({ user: null }, { headers: noStoreHeaders() });
      response.cookies.delete(accountSession.cookieName);
      return response;
    }
    return NextResponse.json(
      {
        user: {
          id: account.id,
          name: account.name,
          email: account.email,
          hasProfile: account.hasProfile,
        },
      },
      { headers: noStoreHeaders() }
    );
  } catch {
    console.error("Authentication status lookup failed.");
    return NextResponse.json(
      { error: "Account service is not configured. Set the session secret and retry." },
      { status: 503, headers: noStoreHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = authInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Check the account details and try again." },
        { status: 400, headers: noStoreHeaders() }
      );
    }

    assertSessionConfiguration();
    const user =
      parsed.data.action === "register"
        ? await registerAccount({
            name: parsed.data.name!,
            email: parsed.data.email,
            password: parsed.data.password,
          })
        : await authenticateAccount(parsed.data.email, parsed.data.password);

    if (!user) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401, headers: noStoreHeaders() }
      );
    }

    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, hasProfile: user.hasProfile } },
      { headers: noStoreHeaders() }
    );
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead." },
        { status: 409, headers: noStoreHeaders() }
      );
    }
    console.error("Authentication request failed.", error);
    return NextResponse.json(
      { error: "The account service is unavailable. Check its configuration and try again." },
      { status: 503, headers: noStoreHeaders() }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }
  try {
    revokeSessionToken(request.cookies.get(accountSession.cookieName)?.value);
  } catch {
    console.error("Session revocation failed.");
    return NextResponse.json({ error: "Could not invalidate the account session." }, { status: 500, headers: noStoreHeaders() });
  }
  const response = NextResponse.json({ success: true }, { headers: noStoreHeaders() });
  response.cookies.set(accountSession.cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
