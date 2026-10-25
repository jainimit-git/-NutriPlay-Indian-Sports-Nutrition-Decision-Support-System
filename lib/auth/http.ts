import { NextRequest } from "next/server";
import {
  accountSession,
  getAccountById,
  getSessionAccountId,
} from "@/lib/auth/accountStore";

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "");
  if (!origin || !host || (protocol !== "http" && protocol !== "https")) return false;

  try {
    const parsedOrigin = new URL(origin);
    return (
      parsedOrigin.host.toLowerCase() === host.split(",")[0].trim().toLowerCase() &&
      parsedOrigin.protocol === `${protocol}:` &&
      !parsedOrigin.username &&
      !parsedOrigin.password
    );
  } catch {
    return false;
  }
}

export function getAuthenticatedAccount(request: NextRequest) {
  const token = request.cookies.get(accountSession.cookieName)?.value;
  const accountId = getSessionAccountId(token);
  return accountId ? getAccountById(accountId) : null;
}
