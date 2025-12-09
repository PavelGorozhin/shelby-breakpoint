"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { UPLOAD_ALLOWLIST_ADDRESSES } from "@/lib/constants";
import { validateSession } from "./auth";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export type SaveVideoParams = {
  fileId: string;
  url: string;
  description: string;
  email: string;
};

// Helper to extract account from Shelby URL
function extractAccountFromShelbyURL(url: string): string | null {
  try {
    // Expected format: https://api.shelbynet.shelby.xyz/shelby/v1/blobs/{account}/{blobName}
    const urlPattern =
      /^https:\/\/api\.shelbynet\.shelby\.xyz\/shelby\/v1\/blobs\/([^\/]+)\//;
    const match = url.match(urlPattern);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function saveVideo(params: SaveVideoParams) {
  const { address } = await validateSession();

  // 1. Validate URL is a Shelby URL and extract account from it
  const accountFromURL = extractAccountFromShelbyURL(params.url);

  if (!accountFromURL) {
    throw new Error(`Invalid Shelby URL format: ${params.url}`);
  }

  // 2. Verify the account parameter matches the account in the URL
  if (
    !AccountAddress.from(accountFromURL).equals(AccountAddress.from(address))
  ) {
    throw new Error(
      `Account mismatch: account parameter ${address} does not match account in URL ${accountFromURL}`
    );
  }

  // 3. Now check if the validated account is in the allowlist
  if (
    UPLOAD_ALLOWLIST_ADDRESSES.length > 0 &&
    !UPLOAD_ALLOWLIST_ADDRESSES.includes(address)
  ) {
    throw new Error(`Account address ${address} is not authorized to upload`);
  }

  const [video] = await db
    .insert(videos)
    .values({ ...params, account: address })
    .returning();

  return video;
}

export type GetVideosParams = {
  account?: string;
};

export async function getVideos(params: GetVideosParams = {}) {
  const { account } = params;

  if (account) {
    return db.select().from(videos).where(eq(videos.account, account));
  }

  return db.select().from(videos);
}
