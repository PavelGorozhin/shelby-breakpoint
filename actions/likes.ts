"use server";

import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export async function getLikeStatus({
  videoId,
  walletAddress,
}: {
  videoId: number;
  walletAddress?: string;
}): Promise<LikeStatus> {
  // Get like count
  const [countResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.videoId, videoId));

  const likeCount = countResult?.count ?? 0;

  // Check if user has liked (only if wallet address provided)
  let isLiked = false;
  if (walletAddress) {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.videoId, videoId), eq(likes.walletAddress, walletAddress))
      );
    isLiked = !!existingLike;
  }

  return { isLiked, likeCount };
}

export async function toggleLike({
  videoId,
  walletAddress,
}: {
  videoId: number;
  walletAddress: string;
}): Promise<LikeStatus> {
  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(likes)
    .where(
      and(eq(likes.videoId, videoId), eq(likes.walletAddress, walletAddress))
    );

  if (existingLike) {
    // Unlike - remove the like
    await db
      .delete(likes)
      .where(
        and(eq(likes.videoId, videoId), eq(likes.walletAddress, walletAddress))
      );
  } else {
    // Like - add the like
    await db.insert(likes).values({
      videoId,
      walletAddress,
    });
  }

  // Return updated status
  return getLikeStatus({ videoId, walletAddress });
}


