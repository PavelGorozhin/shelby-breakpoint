"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { UPLOAD_ALLOWLIST_ADDRESSES_SERVER } from "@/lib/constants";

export type SaveVideoParams = {
  fileId: string;
  account: string;
  url: string;
  description: string;
  email: string;
};

export async function saveVideo(params: SaveVideoParams) {
  if (!UPLOAD_ALLOWLIST_ADDRESSES_SERVER.includes(params.account)) {
    throw new Error(
      `Account address ${params.account} is not authorized to upload`
    );
  }

  const [video] = await db.insert(videos).values(params).returning();

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
