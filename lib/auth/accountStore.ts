import { randomBytes, scrypt as nodeScrypt, timingSafeEqual, createHmac } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import type { AthletePersonalProfile } from "@/lib/types/athlete";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const SESSION_COOKIE_NAME = "nutriplay_session";

interface StoredAccount {
  id: string;
  email: string;
  name: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

interface StoredProfile {
  accountId: string;
  profile: AthletePersonalProfile;
  createdAt: string;
  updatedAt: string;
}

interface StoredSession {
  id: string;
  accountId: string;
  expiresAt: number;
}

interface AccountDatabase {
  version: 1;
  accounts: StoredAccount[];
  profiles: StoredProfile[];
  sessions: StoredSession[];
}

export type PublicAccount = Pick<StoredAccount, "id" | "email" | "name" | "createdAt"> & {
  hasProfile: boolean;
};

function databasePath(): string {
  const directory = process.env.NUTRIPLAY_DATA_DIR || path.join(process.cwd(), ".nutriplay-data");
  return path.join(path.resolve(directory), "accounts.json");
}

function readDatabase(): AccountDatabase {
  const filename = databasePath();
  if (!existsSync(filename)) return { version: 1, accounts: [], profiles: [], sessions: [] };

  const parsed: unknown = JSON.parse(readFileSync(filename, "utf8"));
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as AccountDatabase).version !== 1 ||
    !Array.isArray((parsed as AccountDatabase).accounts)
  ) {
    throw new Error("The NutriPlay account database is invalid or unsupported.");
  }
  const database = parsed as AccountDatabase;
  return {
    ...database,
    profiles: Array.isArray(database.profiles) ? database.profiles : [],
    sessions: Array.isArray(database.sessions) ? database.sessions : [],
  };
}

function writeDatabase(database: AccountDatabase): void {
  const filename = databasePath();
  const directory = path.dirname(filename);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryFile = `${filename}.${randomBytes(8).toString("hex")}.tmp`;
  try {
    writeFileSync(temporaryFile, JSON.stringify(database), { encoding: "utf8", mode: 0o600 });
    renameSync(temporaryFile, filename);
  } catch (error) {
    if (existsSync(temporaryFile)) unlinkSync(temporaryFile);
    throw error;
  }
}

function sessionSecret(): string {
  const secret = process.env.NUTRIPLAY_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("NUTRIPLAY_SESSION_SECRET must be configured with at least 32 characters.");
  }

  return secret;
}

export function assertSessionConfiguration(): void {
  sessionSecret();
}

function publicAccount(account: StoredAccount, database: AccountDatabase): PublicAccount {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
    hasProfile: database.profiles.some((profile) => profile.accountId === account.id),
  };
}

async function hashPassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function registerAccount(input: {
  email: string;
  name: string;
  password: string;
}): Promise<PublicAccount> {
  const email = input.email.trim().toLowerCase();
  const salt = randomBytes(16);
  const passwordHash = await hashPassword(input.password, salt);
  const database = readDatabase();
  if (database.accounts.some((account) => account.email === email)) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const account: StoredAccount = {
    id: randomBytes(16).toString("hex"),
    email,
    name: input.name.trim(),
    passwordSalt: salt.toString("hex"),
    passwordHash: passwordHash.toString("hex"),
    createdAt: new Date().toISOString(),
  };
  database.accounts.push(account);
  writeDatabase(database);
  return publicAccount(account, database);
}

export async function authenticateAccount(emailInput: string, password: string): Promise<PublicAccount | null> {
  const email = emailInput.trim().toLowerCase();
  const database = readDatabase();
  const account = database.accounts.find((candidate) => candidate.email === email);
  const salt = account ? Buffer.from(account.passwordSalt, "hex") : Buffer.alloc(16);
  const expected = account ? Buffer.from(account.passwordHash, "hex") : Buffer.alloc(64);
  const actual = await hashPassword(password, salt);
  if (!account || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return publicAccount(account, database);
}

export function getAccountById(accountId: string): (PublicAccount & {
  profile?: AthletePersonalProfile;
  profileCreatedAt?: string;
  profileUpdatedAt?: string;
}) | null {
  const database = readDatabase();
  const account = database.accounts.find((candidate) => candidate.id === accountId);
  if (!account) return null;
  const savedProfile = database.profiles.find((candidate) => candidate.accountId === accountId);
  return {
    ...publicAccount(account, database),
    profile: savedProfile?.profile,
    profileCreatedAt: savedProfile?.createdAt,
    profileUpdatedAt: savedProfile?.updatedAt,
  };
}

export function saveAccountProfile(accountId: string, profile: AthletePersonalProfile) {
  const database = readDatabase();
  const account = database.accounts.find((candidate) => candidate.id === accountId);
  if (!account) return null;
  const now = new Date().toISOString();
  const savedProfile = database.profiles.find((candidate) => candidate.accountId === accountId);
  if (savedProfile) {
    savedProfile.profile = profile;
    savedProfile.updatedAt = now;
  } else {
    database.profiles.push({ accountId, profile, createdAt: now, updatedAt: now });
  }
  writeDatabase(database);
  return { profile, profileCreatedAt: savedProfile?.createdAt || now, profileUpdatedAt: now };
}

export function createSessionToken(accountId: string, now = Date.now()): string {
  const secret = sessionSecret();
  const database = readDatabase();
  if (!database.accounts.some((account) => account.id === accountId)) {
    throw new Error("Cannot create a session for an unknown account.");
  }
  const expiresAt = Math.floor(now / 1000) + SESSION_DURATION_SECONDS;
  const sessionId = randomBytes(24).toString("hex");
  database.sessions = database.sessions.filter((session) => session.expiresAt > Math.floor(now / 1000));
  database.sessions.push({ id: sessionId, accountId, expiresAt });
  writeDatabase(database);
  const payload = Buffer.from(
    JSON.stringify({ sub: accountId, sid: sessionId, exp: expiresAt })
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function decodeSessionToken(token: string | undefined, now: number) {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      sid?: unknown;
      exp?: unknown;
    };
    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.sid !== "string" ||
      typeof decoded.exp !== "number" ||
      decoded.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return { accountId: decoded.sub, sessionId: decoded.sid, expiresAt: decoded.exp };
  } catch {
    return null;
  }
}

export function getSessionAccountId(token: string | undefined, now = Date.now()): string | null {
  const decoded = decodeSessionToken(token, now);
  if (!decoded) return null;
  const database = readDatabase();
  const session = database.sessions.find(
    (candidate) =>
      candidate.id === decoded.sessionId &&
      candidate.accountId === decoded.accountId &&
      candidate.expiresAt === decoded.expiresAt
  );
  return session && database.accounts.some((account) => account.id === decoded.accountId)
    ? decoded.accountId
    : null;
}

export function revokeSessionToken(token: string | undefined): void {
  const decoded = decodeSessionToken(token, Date.now());
  if (!decoded) return;
  const database = readDatabase();
  database.sessions = database.sessions.filter((session) => session.id !== decoded.sessionId);
  writeDatabase(database);
}

export const accountSession = {
  cookieName: SESSION_COOKIE_NAME,
  maxAge: SESSION_DURATION_SECONDS,
};
