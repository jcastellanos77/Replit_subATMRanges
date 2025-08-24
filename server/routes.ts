import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all shops
  app.get("/api/shops", async (req, res) => {
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving shops" });
    }
  });

  // Get shops with filters
  app.get("/api/shops/filter", async (req, res) => {
    try {
      const filters = filtersSchema.parse(req.query);
      const shops = await storage.getShopsByFilters(filters);
      res.json(shops);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error filtering shops" });
      }
    }
  });

  // Get unique categories for filter dropdown
  app.get("/api/shops/categories", async (req, res) => {
    try {
      const shops = await storage.getShops();
      const categories = new Set<string>();
      shops.forEach(shop => {
        shop.categories.forEach(category => categories.add(category));
      });
      res.json(Array.from(categories).sort());
    } catch (error) {
      res.status(500).json({ message: "Error retrieving categories" });
    }
  });

  // Get unique cities for filter dropdown
  app.get("/api/shops/cities", async (req, res) => {
    try {
      const shops = await storage.getShops();
      const cities = new Set(shops.map(shop => shop.city));
      res.json(Array.from(cities).sort());
    } catch (error) {
      res.status(500).json({ message: "Error retrieving cities" });
    }
  });

  // Get unique states for filter dropdown
  app.get("/api/shops/states", async (req, res) => {
    try {
      const shops = await storage.getShops();
      const states = new Set(shops.map(shop => shop.state));
      res.json(Array.from(states).sort());
    } catch (error) {
      res.status(500).json({ message: "Error retrieving states" });
    }
  });

  // Get shop by ID
  app.get("/api/shops/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shop = await storage.getShopById(id);
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      res.json(shop);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving shop" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
