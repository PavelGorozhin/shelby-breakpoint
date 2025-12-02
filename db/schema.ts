import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Example schema - customize based on your needs
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Videos table for uploaded videos
export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fileId: text("file_id").notNull().unique(),
  account: text("account").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  email: text("email").unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

// Profiles table for user profile data
export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// Likes table for video likes
export const likes = sqliteTable("likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoId: integer("video_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
