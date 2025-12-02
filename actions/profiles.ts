"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export type GetProfileParams = {
  walletAddress: string;
};

export async function getProfile(params: GetProfileParams) {
  const { walletAddress } = params;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.walletAddress, walletAddress));

  return profile || null;
}

export type SaveProfileParams = {
  walletAddress: string;
  username?: string | null;
  bio?: string | null;
};

export async function saveProfile(params: SaveProfileParams) {
  const { walletAddress, username, bio } = params;

  // Check if profile exists
  const existing = await getProfile({ walletAddress });

  if (existing) {
    // Update existing profile
    const [updated] = await db
      .update(profiles)
      .set({
        username,
        bio,
        updatedAt: new Date(),
      })
      .where(eq(profiles.walletAddress, walletAddress))
      .returning();

    return updated;
  } else {
    // Create new profile
    const [created] = await db
      .insert(profiles)
      .values({
        walletAddress,
        username,
        bio,
      })
      .returning();

    return created;
  }
}

