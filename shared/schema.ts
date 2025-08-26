import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logo: text("logo").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  categories: text("categories").array().notNull(),
  mapImageUrl: text("map_image_url").notNull(),
  googleMapsUrl: text("google_maps_url").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isVerified: text("is_verified").default("false"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
});

export const updateShopSchema = createInsertSchema(shops).partial().omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShop = z.infer<typeof insertShopSchema>;
export type UpdateShop = z.infer<typeof updateShopSchema>;
export type Shop = typeof shops.$inferSelect;
