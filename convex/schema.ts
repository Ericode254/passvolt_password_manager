import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  passwords: defineTable({
    userId: v.id("users"),
    siteName: v.string(),
    siteUrl: v.optional(v.string()),
    username: v.string(),
    encryptedPassword: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    lastUsed: v.optional(v.number()),
    isFavorite: v.optional(v.boolean()),
    strength: v.object({
      score: v.number(), // 0-100
      level: v.string(), // "weak", "fair", "good", "strong"
      issues: v.array(v.string()),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_site", ["userId", "siteName"])
    .searchIndex("search_passwords", {
      searchField: "siteName",
      filterFields: ["userId", "category"],
    }),

  passwordInsights: defineTable({
    userId: v.id("users"),
    totalPasswords: v.number(),
    weakPasswords: v.number(),
    duplicatePasswords: v.number(),
    oldPasswords: v.number(),
    averageStrength: v.number(),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
