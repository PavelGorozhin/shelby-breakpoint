"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";

export type SaveVideoParams = {
  fileId: string;
  account: string;
  url: string;
  description: string;
  email: string;
};

export async function saveVideo(params: SaveVideoParams) {
  const [video] = await db.insert(videos).values(params).returning();

  return video;
}

export type GetVideosParams = {
  account?: string;
};

export async function getVideos(params: GetVideosParams = {}) {
  const { account } = params;

  const query = db.select().from(videos);

  if (account) {
    query.where(eq(videos.account, account));
  }

  return db.select().from(videos);
}
