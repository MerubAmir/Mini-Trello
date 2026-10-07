import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

const COOKIE_NAME = "mini_trello_session";

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(secret);
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const createSessionToken = async (userId: string) =>
  new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
};

export const getSessionUserIdFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
};

export const getSessionUserId = async () => {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
};

export const getCurrentUser = async () => {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });
};

export const requireCurrentUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
};

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
