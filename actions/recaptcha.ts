"use server";

import {
  RECAPTCHA_SCORE_THRESHOLD,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_VERIFY_URL,
} from "@/lib/constants";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
    return true;
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });

    const data: RecaptchaResponse = await response.json();

    if (data.success && (data.score ?? 1) >= RECAPTCHA_SCORE_THRESHOLD) {
      return true;
    }

    console.warn("reCAPTCHA verification failed:", data);
    return false;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}
