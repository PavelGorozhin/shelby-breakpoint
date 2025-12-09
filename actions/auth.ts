"use server";

import { createAptosServerClient } from "@/lib/aptos";
import { ALLOWED_HOSTS, JWT_SECRET } from "@/lib/constants";
import { isDevelopment } from "@/lib/environment";
import {
  type AptosSignInInput,
  type AptosSignInBoundFields,
  generateNonce,
} from "@aptos-labs/siwa";
import {
  deserializeLegacySignInOutput,
  type SerializedLegacyAptosSignInOutput,
  verifyLegacySignIn,
} from "@aptos-labs/siwa/legacy";
import { Network } from "@aptos-labs/ts-sdk";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { headers } from "next/headers";

const SIWA_COOKIE_NAME = "siwa_cookie";
const SESSION_TOKEN_COOKIE_NAME = "session_token";

/**
 * Server action to start a legacy sign-in flow. Generates a nonce and input for the sign-in flow. You must
 * then sign the input with the wallet and submit the signature to the server using the `verifySignInLegacy` action.
 *
 * @param address - The address of the wallet to sign in with.
 * @returns The nonce and input for the sign-in flow.
 */
export const startSignInLegacy = async (address: string) => {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  if (!host || !ALLOWED_HOSTS.includes(host)) {
    throw new Error("Host is not allowed to authenticate");
  }

  const nonce = generateNonce();
  const input: AptosSignInInput & AptosSignInBoundFields = {
    nonce,
    statement: "Sign in to verify your wallet ownership",
    domain: host,
    address,
    uri: `https://${host}`,
    version: "1",
    chainId: "aptos:shelbynet",
  };

  const requestCookies = await cookies();
  requestCookies.set(SIWA_COOKIE_NAME, JSON.stringify(input), {
    httpOnly: true,
    secure: !isDevelopment,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { nonce, input };
};

/**
 * Server action to verify a legacy sign-in flow. Verifies the signature and returns the address of the wallet.
 *
 * @param serializedOutput - The serialized output of the sign-in flow.
 * @returns The address of the wallet.
 */
export const verifySignInLegacy = async (
  serializedOutput: SerializedLegacyAptosSignInOutput
) => {
  const aptos = createAptosServerClient(Network.SHELBYNET);

  const requestCookies = await cookies();
  const siwaCookie = requestCookies.get(SIWA_COOKIE_NAME);
  if (!siwaCookie) throw new Error("Cookie not found in request");

  const expectedInput = JSON.parse(siwaCookie.value) as AptosSignInInput &
    AptosSignInBoundFields;
  const deserializedOutput = await deserializeLegacySignInOutput(
    serializedOutput
  );

  // Verify the sign-in using the expected input and actual output
  const verification = await verifyLegacySignIn(
    expectedInput,
    deserializedOutput,
    { aptos }
  );

  if (!verification.valid) {
    throw new Error(`Invalid sign-in: ${verification.errors.join(", ")}`);
  }

  const address = verification.data.address;

  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  const sessionToken = jwt.sign({ address }, JWT_SECRET, {
    expiresIn: 24 * 3600,
    subject: address,
  });

  requestCookies.set(SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: !isDevelopment,
    maxAge: 24 * 3600,
  });

  requestCookies.delete(SIWA_COOKIE_NAME);

  return { address };
};

/**
 * Server action to sign out the user. Deletes the session token cookie and therefore invalidates the session.
 */
export const signOut = async () => {
  const requestCookies = await cookies();
  requestCookies.delete(SESSION_TOKEN_COOKIE_NAME);
};

/**
 * Server action to get the session token from the cookies.
 *
 * @returns The session token or `null` if no session token is found or the session token is invalid.
 */
export const getSession = async () => {
  const requestCookies = await cookies();
  const sessionToken = requestCookies.get(SESSION_TOKEN_COOKIE_NAME);
  if (!sessionToken || !sessionToken.value) return null;

  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  try {
    return jwt.verify(sessionToken.value, JWT_SECRET) as { address: string };
  } catch {
    return null;
  }
};

/**
 * Server action to validate the session. Throws an error if the session is not valid.
 *
 * @returns The session token.
 */
export const validateSession = async () => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
};
