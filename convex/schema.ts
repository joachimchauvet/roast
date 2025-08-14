import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  roasts: defineTable({
    name: v.string(),
    birthdate: v.string(), // ISO date string
    hobbies: v.string(),
    nationality: v.string(),
    zodiacSign: v.string(),
    roastText: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(), // timestamp
  }).index("by_creation", ["createdAt"]),
});