import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShopSchema, updateShopSchema } from "@shared/schema";
import { requireAuth } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
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

  // Create new shop
  app.post("/api/shops", async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.createShop(shopData);
      res.status(201).json(newShop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      } else {
        console.error("Error creating shop:", error);
        res.status(500).json({ message: "Error creating shop" });
      }
    }
  });

  // Update shop
  app.put("/api/shops/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shopData = updateShopSchema.parse(req.body);
      const updatedShop = await storage.updateShop(id, shopData);
      
      if (!updatedShop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      res.json(updatedShop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      } else {
        console.error("Error updating shop:", error);
        res.status(500).json({ message: "Error updating shop" });
      }
    }
  });

  // === ADMIN ROUTES (Protected) ===
  
  // Create new shop (Admin only)
  app.post("/api/admin/shops", requireAuth, async (req, res) => {
    try {
      const shopData = insertShopSchema.parse(req.body);
      const newShop = await storage.createShop(shopData);
      res.status(201).json(newShop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      } else {
        console.error("Error creating shop:", error);
        res.status(500).json({ message: "Error creating shop" });
      }
    }
  });

  // Update shop (Admin only)
  app.put("/api/admin/shops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const shopData = updateShopSchema.parse(req.body);
      const updatedShop = await storage.updateShop(id, shopData);
      
      if (!updatedShop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      res.json(updatedShop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      } else {
        console.error("Error updating shop:", error);
        res.status(500).json({ message: "Error updating shop" });
      }
    }
  });

  // Delete shop (Admin only)
  app.delete("/api/admin/shops/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteShop(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shop:", error);
      res.status(500).json({ message: "Error deleting shop" });
    }
  });

  // Get upload URL for images (Admin only)
  app.post("/api/admin/upload", requireAuth, async (req, res) => {
    try {
      const { type } = req.body; // 'logo' or 'map'
      if (!type || !['logo', 'map'].includes(type)) {
        return res.status(400).json({ message: "Invalid upload type. Must be 'logo' or 'map'" });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getUploadURL(type);
      
      res.json({ uploadURL, type });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Error getting upload URL" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
