import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Rate limiting: check recent roast count
export const checkRateLimit = query({
  args: {},
  returns: v.object({
    canCreate: v.boolean(),
    recentCount: v.number(),
    resetTime: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000); // 3 hours in milliseconds
    const RATE_LIMIT = 20;
    
    const recentRoasts = await ctx.db
      .query("roasts")
      .withIndex("by_creation")
      .filter((q) => q.gte(q.field("createdAt"), threeHoursAgo))
      .collect();
    
    const recentCount = recentRoasts.length;
    const canCreate = recentCount < RATE_LIMIT;
    
    // If at limit, calculate when the oldest roast in the window will expire
    let resetTime;
    if (!canCreate && recentRoasts.length > 0) {
      const oldestRecentRoast = recentRoasts[recentRoasts.length - 1];
      resetTime = oldestRecentRoast.createdAt + (3 * 60 * 60 * 1000);
    }
    
    return {
      canCreate,
      recentCount,
      resetTime,
    };
  },
});

// Query to get all roasts for the leaderboard
export const listRoasts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("roasts"),
      _creationTime: v.number(),
      name: v.string(),
      birthdate: v.string(),
      hobbies: v.string(),
      nationality: v.string(),
      zodiacSign: v.string(),
      roastText: v.string(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id("_storage")),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const roasts = await ctx.db
      .query("roasts")
      .withIndex("by_creation")
      .order("desc")
      .take(50);
    return roasts;
  },
});

// Query to get a single roast by ID
export const getRoast = query({
  args: { id: v.id("roasts") },
  returns: v.union(
    v.object({
      _id: v.id("roasts"),
      _creationTime: v.number(),
      name: v.string(),
      birthdate: v.string(),
      hobbies: v.string(),
      nationality: v.string(),
      zodiacSign: v.string(),
      roastText: v.string(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.id("_storage")),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation to create a new roast (called from frontend)
export const createRoast = mutation({
  args: {
    name: v.string(),
    birthdate: v.string(),
    hobbies: v.string(),
    nationality: v.string(),
  },
  returns: v.id("roasts"),
  handler: async (ctx, args) => {
    // Check rate limit first
    const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
    const RATE_LIMIT = 20;
    
    const recentRoasts = await ctx.db
      .query("roasts")
      .withIndex("by_creation")
      .filter((q) => q.gte(q.field("createdAt"), threeHoursAgo))
      .collect();
    
    if (recentRoasts.length >= RATE_LIMIT) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    
    // Calculate zodiac sign
    const zodiacSign = getZodiacSign(args.birthdate);
    
    // Create initial roast entry
    const roastId = await ctx.db.insert("roasts", {
      name: args.name,
      birthdate: args.birthdate,
      hobbies: args.hobbies,
      nationality: args.nationality,
      zodiacSign,
      roastText: "Generating your roast...", // Placeholder
      createdAt: Date.now(),
    });

    // Schedule the AI generation
    await ctx.scheduler.runAfter(0, internal.ai.generateRoastContent, {
      roastId,
      name: args.name,
      birthdate: args.birthdate,
      hobbies: args.hobbies,
      nationality: args.nationality,
      zodiacSign,
    });

    return roastId;
  },
});

// Internal mutation to update roast with generated content
export const updateRoastContent = internalMutation({
  args: {
    roastId: v.id("roasts"),
    roastText: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roastId, {
      roastText: args.roastText,
    });
    return null;
  },
});

// Internal mutation to update roast with image
export const updateRoastImage = internalMutation({
  args: {
    roastId: v.id("roasts"),
    imageStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
    await ctx.db.patch(args.roastId, {
      imageStorageId: args.imageStorageId,
      imageUrl: imageUrl || undefined,
    });
    return null;
  },
});

// Helper function to calculate zodiac sign
function getZodiacSign(birthdate: string): string {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}