import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { GET as getAuth, POST as postAuth, DELETE as deleteAuth } from "@/app/api/auth/route";
import { GET as getProfile, PUT as putProfile } from "@/app/api/profile/route";
import { POST as postPlan } from "@/app/api/plan/route";
import { accountSession } from "@/lib/auth/accountStore";

let storageDirectory: string;

const athleteProfile = {
  name: "QA Athlete",
  age: 25,
  sex: "female",
  heightCm: 168,
  weightKg: 62,
  dietaryPreference: "vegan",
  dietaryExclusions: ["peanuts"],
};

function request(
  url: string,
  method: string,
  body?: unknown,
  cookie?: string,
  origin = "http://nutriplay.test"
) {
  return new NextRequest(`http://nutriplay.test${url}`, {
    method,
    headers: {
      host: "nutriplay.test",
      origin,
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie: `${accountSession.cookieName}=${cookie}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  storageDirectory = mkdtempSync(path.join(tmpdir(), "nutriplay-api-tests-"));
  vi.stubEnv("NUTRIPLAY_DATA_DIR", storageDirectory);
  vi.stubEnv("NUTRIPLAY_SESSION_SECRET", "test-only-session-secret-at-least-32-bytes");
});

afterEach(() => {
  rmSync(storageDirectory, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe("authenticated account workflow API", () => {
  it("registers, saves and reloads an owned profile, generates a plan, and signs out", async () => {
    const registration = await postAuth(request("/api/auth", "POST", {
      action: "register",
      name: "QA Athlete",
      email: "qa@example.test",
      password: "safe local test password 2026",
    }));
    expect(registration.status).toBe(200);
    const sessionToken = registration.cookies.get(accountSession.cookieName)?.value;
    expect(sessionToken).toBeTruthy();

    expect((await (await getProfile(request("/api/profile", "GET", undefined, sessionToken))).json()).error)
      .toBe("Athlete profile is not complete.");

    const savedProfile = await putProfile(request("/api/profile", "PUT", athleteProfile, sessionToken));
    expect(savedProfile.status).toBe(200);
    expect((await savedProfile.json()).profile.weightKg).toBe(62);

    const loadedProfile = await getProfile(request("/api/profile", "GET", undefined, sessionToken));
    expect(loadedProfile.status).toBe(200);
    expect((await loadedProfile.json()).profile.dietaryPreference).toBe("vegan");

    const planResponse = await postPlan(request("/api/plan", "POST", {
      sport: "squash",
      trainingDurationMinutes: 90,
      trainingIntensity: "high",
      trainingFrequencyDaysPerWeek: 5,
      dailyBudgetInr: 350,
      location: "Mumbai",
      trainingDate: new Date().toISOString().slice(0, 10),
      trainingType: "competition",
      trainingTimeOfDay: "evening",
    }, sessionToken));
    expect(planResponse.status).toBe(200);
    expect(planResponse.headers.get("cache-control")).toBe("no-store");
    const result = await planResponse.json();
    expect(result.plan.athlete).toMatchObject({
      id: (await registration.json()).user.id,
      weightKg: 62,
      sport: "squash",
      trainingDurationMinutes: 90,
    });
    expect(result.plan.assumptions.some((assumption: string) => assumption.includes("generic sports-session fallback"))).toBe(true);

    const logout = await deleteAuth(request("/api/auth", "DELETE", undefined, sessionToken));
    expect(logout.status).toBe(200);
    const afterLogout = await getAuth(request("/api/auth", "GET", undefined, sessionToken));
    expect((await afterLogout.json()).user).toBeNull();
  });

  it("returns generic login failures and rejects cross-origin mutations", async () => {
    const invalidLogin = await postAuth(request("/api/auth", "POST", {
      action: "login",
      email: "unknown@example.test",
      password: "incorrect password value",
    }));
    expect(invalidLogin.status).toBe(401);
    expect(await invalidLogin.json()).toEqual({ error: "Email or password is incorrect." });

    const crossOrigin = await postAuth(request(
      "/api/auth",
      "POST",
      { action: "login", email: "unknown@example.test", password: "incorrect password value" },
      undefined,
      "http://attacker.test"
    ));
    expect(crossOrigin.status).toBe(403);
  });
});
