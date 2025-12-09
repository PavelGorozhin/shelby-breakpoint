"use server";

import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getSession, validateSession } from "./auth";

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export async function getLikeStatus({ videoId }: { videoId: number }) {
  // Get like count
  const [countResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.videoId, videoId));

  const likeCount = countResult?.count ?? 0;

  // Check if user has liked (only if wallet address provided)
  const session = await getSession();
  let isLiked = false;
  if (session?.address) {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.videoId, videoId),
          eq(likes.walletAddress, session.address)
        )
      );
    isLiked = !!existingLike;
  }

  return { isLiked, likeCount };
}

export async function toggleLike({
  videoId,
}: {
  videoId: number;
}): Promise<LikeStatus> {
  const { address } = await validateSession();

  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.videoId, videoId), eq(likes.walletAddress, address)));

  if (existingLike) {
    // Unlike - remove the like
    await db
      .delete(likes)
      .where(and(eq(likes.videoId, videoId), eq(likes.walletAddress, address)));
  } else {
    // Like - add the like
    await db.insert(likes).values({
      videoId,
      walletAddress: address,
    });
  }

  // Return updated status
  return getLikeStatus({ videoId });
}
