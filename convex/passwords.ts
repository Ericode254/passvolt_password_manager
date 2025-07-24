import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

// Password strength analysis
function analyzePasswordStrength(password: string) {
  let score = 0;
  const issues: string[] = [];

  // Length check
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else issues.push("Password is too short (minimum 8 characters)");

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  else issues.push("Missing lowercase letters");

  if (/[A-Z]/.test(password)) score += 10;
  else issues.push("Missing uppercase letters");

  if (/[0-9]/.test(password)) score += 10;
  else issues.push("Missing numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else issues.push("Missing special characters");

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 10;
  else issues.push("Contains repeated characters");

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 10;
  else issues.push("Contains common patterns");

  // Entropy bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars / password.length > 0.7) score += 10;

  let level = "weak";
  if (score >= 80) level = "strong";
  else if (score >= 60) level = "good";
  else if (score >= 40) level = "fair";

  return { score: Math.min(score, 100), level, issues };
}

// Simple encryption (in production, use proper encryption)
function encryptPassword(password: string): string {
  const bytes = new TextEncoder().encode(password);
  return btoa(String.fromCharCode(...bytes));
}

function decryptPassword(encoded: string): string {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const addPassword = mutation({
  args: {
    siteName: v.string(),
    siteUrl: v.optional(v.string()),
    username: v.string(),
    password: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const strength = analyzePasswordStrength(args.password);
    const encryptedPassword = encryptPassword(args.password);

    await ctx.db.insert("passwords", {
      userId,
      siteName: args.siteName,
      siteUrl: args.siteUrl,
      username: args.username,
      encryptedPassword,
      category: args.category || "General",
      notes: args.notes,
      lastUsed: Date.now(),
      isFavorite: false,
      strength,
    });

    // Update insights
    await updateUserInsights(ctx, userId);
  },
});

export const getPasswords = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db.query("passwords").withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.search) {
      const results = await ctx.db
        .query("passwords")
        .withSearchIndex("search_passwords", (q) =>
          q.search("siteName", args.search!).eq("userId", userId)
        )
        .collect();
      return results.map((password: Doc<"passwords">) => ({
        ...password,
        password: decryptPassword(password.encryptedPassword),
      }));
    }

    const passwords = await query.collect();
    
    let filtered = passwords;
    if (args.category && args.category !== "All") {
      filtered = passwords.filter(p => p.category === args.category);
    }

    return filtered.map((password: Doc<"passwords">) => ({
      ...password,
      password: decryptPassword(password.encryptedPassword),
    }));
  },
});

export const updatePassword = mutation({
  args: {
    id: v.id("passwords"),
    siteName: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Password not found");
    }

    const updates: any = { lastUsed: Date.now() };
    
    if (args.siteName !== undefined) updates.siteName = args.siteName;
    if (args.siteUrl !== undefined) updates.siteUrl = args.siteUrl;
    if (args.username !== undefined) updates.username = args.username;
    if (args.category !== undefined) updates.category = args.category;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.isFavorite !== undefined) updates.isFavorite = args.isFavorite;

    if (args.password !== undefined) {
      updates.encryptedPassword = encryptPassword(args.password);
      updates.strength = analyzePasswordStrength(args.password);
    }

    await ctx.db.patch(args.id, updates);
    await updateUserInsights(ctx, userId);
  },
});

export const deletePassword = mutation({
  args: { id: v.id("passwords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const password = await ctx.db.get(args.id);
    if (!password || password.userId !== userId) {
      throw new Error("Password not found");
    }

    await ctx.db.delete(args.id);
    await updateUserInsights(ctx, userId);
  },
});

export const getUserInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const insights = await ctx.db
      .query("passwordInsights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return insights;
  },
});

async function updateUserInsights(ctx: MutationCtx, userId: Id<"users">) {
  const passwords = await ctx.db
    .query("passwords")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const totalPasswords = passwords.length;
  const weakPasswords = passwords.filter((p: Doc<"passwords">) => p.strength.score < 60).length;
  
  // Check for duplicates
  const passwordValues = passwords.map((p: Doc<"passwords">) => decryptPassword(p.encryptedPassword));
  const duplicatePasswords = passwordValues.length - new Set(passwordValues).size;

  // Check for old passwords (older than 90 days)
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const oldPasswords = passwords.filter((p: Doc<"passwords">) => (p.lastUsed || 0) < ninetyDaysAgo).length;

  const averageStrength = totalPasswords > 0 
    ? passwords.reduce((sum: number, p: Doc<"passwords">) => sum + p.strength.score, 0) / totalPasswords 
    : 0;

  const existing = await ctx.db
    .query("passwordInsights")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  const insightData = {
    userId,
    totalPasswords,
    weakPasswords,
    duplicatePasswords,
    oldPasswords,
    averageStrength,
    lastUpdated: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, insightData);
  } else {
    await ctx.db.insert("passwordInsights", insightData);
  }
}

export const generatePassword = mutation({
  args: {
    length: v.number(),
    includeUppercase: v.boolean(),
    includeLowercase: v.boolean(),
    includeNumbers: v.boolean(),
    includeSymbols: v.boolean(),
    excludeSimilar: v.boolean(),
  },
  handler: async (ctx, args) => {
    let charset = "";
    
    if (args.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (args.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (args.includeNumbers) charset += "0123456789";
    if (args.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (args.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "");
    }

    if (!charset) throw new Error("At least one character type must be selected");

    let password = "";
    for (let i = 0; i < args.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return {
      password,
      strength: analyzePasswordStrength(password),
    };
  },
});
