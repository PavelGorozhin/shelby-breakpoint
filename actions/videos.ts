"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { UPLOAD_ALLOWLIST_ADDRESSES, VIDEO_PAGE_SIZE } from "@/lib/constants";
import { shuffleWithSeed } from "@/lib/random";
import { validateSession } from "./auth";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export type SaveVideoParams = {
  fileId: string;
  url: string;
  description: string;
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

export type GetRandomVideosParams = {
  seed: number;
  limit?: number;
  offset?: number;
  account?: string;
  /**
   * If provided, this video (by fileId) will be placed first in the results
   */
  prioritizeFileId?: string;
};

/**
 * Get videos in a randomized order using a seed for consistent pagination
 * The seed ensures the same shuffle order across multiple requests
 */
export async function getRandomVideos(
  params: GetRandomVideosParams
): Promise<{ videos: Awaited<ReturnType<typeof getVideos>>; seed: number }> {
  const {
    seed,
    limit = VIDEO_PAGE_SIZE,
    offset = 0,
    account,
    prioritizeFileId,
  } = params;

  const allVideos = account
    ? await db.select().from(videos).where(eq(videos.account, account))
    : await db.select().from(videos);

  // Find and extract priority video if specified
  const priorityIndex = prioritizeFileId
    ? allVideos.findIndex((v) => v.fileId === prioritizeFileId)
    : -1;
  const priorityVideo =
    priorityIndex !== -1 ? allVideos.splice(priorityIndex, 1)[0] : null;

  // Shuffle remaining videos, prepend priority video if found
  const shuffled = shuffleWithSeed(allVideos, seed);
  const orderedVideos = priorityVideo ? [priorityVideo, ...shuffled] : shuffled;

  return {
    videos: orderedVideos.slice(offset, offset + limit),
    seed,
  };
}
