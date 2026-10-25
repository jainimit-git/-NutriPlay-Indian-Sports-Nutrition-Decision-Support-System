import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  accountSession,
  authenticateAccount,
  createSessionToken,
  getAccountById,
  getSessionAccountId,
  registerAccount,
  revokeSessionToken,
  saveAccountProfile,
} from "@/lib/auth/accountStore";
import { getAuthenticatedAccount } from "@/lib/auth/http";
import type { AthletePersonalProfile } from "@/lib/types/athlete";

let storageDirectory: string;

const profile: AthletePersonalProfile = {
  name: "Test Athlete",
  age: 22,
  sex: "female",
  heightCm: 165,
  weightKg: 58,
  dietaryPreference: "vegetarian",
  dietaryExclusions: ["peanuts"],
};

beforeEach(() => {
  storageDirectory = mkdtempSync(path.join(tmpdir(), "nutriplay-account-tests-"));
  vi.stubEnv("NUTRIPLAY_DATA_DIR", storageDirectory);
  vi.stubEnv("NUTRIPLAY_SESSION_SECRET", "test-only-session-secret-at-least-32-bytes");
});

afterEach(() => {
  rmSync(storageDirectory, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe("persistent account and athlete profile store", () => {
  it("stores a salted password hash instead of the plaintext password", async () => {
    const password = "correct horse battery staple 2026";
    const account = await registerAccount({ name: "Athlete One", email: "ONE@example.com", password });
    const database = JSON.parse(readFileSync(path.join(storageDirectory, "accounts.json"), "utf8"));

    expect(database.accounts[0].email).toBe("one@example.com");
    expect(database.accounts[0].passwordHash).not.toBe(password);
    expect(database.accounts[0].passwordSalt).toBeTruthy();
    expect(database.accounts[0]).not.toHaveProperty("profile");
    expect(database.profiles).toEqual([]);
    await expect(authenticateAccount("one@example.com", password)).resolves.toMatchObject({ id: account.id });
    await expect(authenticateAccount("one@example.com", "wrong password value")).resolves.toBeNull();
    await expect(authenticateAccount("missing@example.com", password)).resolves.toBeNull();
  });

  it("rejects duplicate emails independent of letter case", async () => {
    await registerAccount({ name: "First Athlete", email: "athlete@example.com", password: "long password 123" });
    await expect(
      registerAccount({ name: "Second Athlete", email: "ATHLETE@example.com", password: "another password 123" })
    ).rejects.toThrow("EMAIL_ALREADY_REGISTERED");
  });

  it("upserts the profile against its account and keeps profile timestamps", async () => {
    const account = await registerAccount({
      name: "Profile Owner",
      email: "owner@example.com",
      password: "secure athlete password",
    });
    const created = saveAccountProfile(account.id, profile);
    const updated = saveAccountProfile(account.id, { ...profile, weightKg: 60 });

    expect(created).not.toBeNull();
    expect(updated?.profileCreatedAt).toBe(created?.profileCreatedAt);
    expect(updated?.profileUpdatedAt).toBeTruthy();
    expect(getAccountById(account.id)?.profile?.weightKg).toBe(60);
    expect(JSON.parse(readFileSync(path.join(storageDirectory, "accounts.json"), "utf8")).profiles).toHaveLength(1);
  });

  it("binds sessions to one account and revokes them on sign-out", async () => {
    const owner = await registerAccount({
      name: "Profile Owner",
      email: "owner@example.com",
      password: "secure athlete password",
    });
    const other = await registerAccount({
      name: "Different Athlete",
      email: "other@example.com",
      password: "another secure password",
    });
    saveAccountProfile(owner.id, profile);
    const ownerToken = createSessionToken(owner.id);
    const otherToken = createSessionToken(other.id);

    expect(getSessionAccountId(ownerToken)).toBe(owner.id);
    expect(getAuthenticatedAccount(new NextRequest("http://localhost/api/profile", {
      headers: { cookie: `${accountSession.cookieName}=${ownerToken}` },
    }))?.profile?.name).toBe(profile.name);
    expect(getAuthenticatedAccount(new NextRequest("http://localhost/api/profile", {
      headers: { cookie: `${accountSession.cookieName}=${otherToken}` },
    }))?.profile).toBeUndefined();
    expect(getSessionAccountId(`${ownerToken.slice(0, -1)}x`)).toBeNull();

    revokeSessionToken(ownerToken);
    expect(getSessionAccountId(ownerToken)).toBeNull();
    expect(getSessionAccountId(otherToken)).toBe(other.id);
  });
});
