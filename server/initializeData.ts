import { db } from "./db";
import { shops } from "@shared/schema";
import type { InsertShop } from "@shared/schema";

export async function initializeDatabase() {
  // Check if there are any existing shops
  const existingShops = await db.select().from(shops);
  
  if (existingShops.length > 0) {
    console.log("Database already has shops, skipping initialization");
    return;
  }

  // Initialize with Damotlav store as requested
  const damotlavShop: InsertShop = {
    name: "Damotlav",
    description: "Especialistas en tiro deportivo y cacería",
    logo: "fas fa-crosshairs",
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    city: "Ciudad de México",
    state: "Ciudad de México",
    phone: "+52 (55) 1234-5678",
    email: "info@damotlav.com",
    website: "www.damotlav.com",
    categories: ["Armería", "Accesorios", "Capacitación"],
    mapImageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
    googleMapsUrl: "https://maps.google.com/?q=19.3906,-99.1426",
    latitude: "19.3906",
    longitude: "-99.1426",
    isVerified: "true"
  };

  try {
    const result = await db.insert(shops).values(damotlavShop).returning();
    console.log("Successfully initialized database with Damotlav store:", result[0]);
    
    return result[0];
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}