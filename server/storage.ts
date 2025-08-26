import { type User, type InsertUser, type Shop, type InsertShop, type UpdateShop, users, shops } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  getShops(): Promise<Shop[]>;
  getShopById(id: string): Promise<Shop | undefined>;
  getShopsByFilters(filters: {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
  }): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: string, shop: UpdateShop): Promise<Shop | undefined>;
  deleteShop(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shops: Map<string, Shop>;

  constructor() {
    this.users = new Map();
    this.shops = new Map();
    this.initializeShops();
  }

  private initializeShops() {
    const sampleShops: InsertShop[] = [
      {
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
      },
      {
        name: "Stone Beyers",
        description: "Armas de caza y tiro deportivo",
        logo: "fas fa-bullseye",
        address: "Calle Libertad 567, Col. Americana",
        city: "Guadalajara",
        state: "Jalisco",
        phone: "+52 (33) 2345-6789",
        email: "contacto@stonebeyers.mx",
        website: "www.stonebeyers.mx",
        categories: ["Caza", "Municiones", "Mantenimiento"],
        mapImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
        googleMapsUrl: "https://maps.google.com/?q=20.6597,-103.3496",
        latitude: "20.6597",
        longitude: "-103.3496",
        isVerified: "true"
      },
      {
        name: "SilvereTrom",
        description: "Equipamiento táctico profesional",
        logo: "fas fa-medal",
        address: "Av. Constitución 890, Col. Centro",
        city: "Monterrey",
        state: "Nuevo León",
        phone: "+52 (81) 3456-7890",
        email: "ventas@silveretrom.com",
        website: "www.silveretrom.com",
        categories: ["Táctico", "Uniformes", "Protección"],
        mapImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
        googleMapsUrl: "https://maps.google.com/?q=25.6866,-100.3161",
        latitude: "25.6866",
        longitude: "-100.3161",
        isVerified: "true"
      },
      {
        name: "Sexaent Reyes",
        description: "Especialistas en tiro con arco",
        logo: "fas fa-bow-arrow",
        address: "Blvd. Héroes del 5 de Mayo 321, Col. Huexotitla",
        city: "Puebla",
        state: "Puebla",
        phone: "+52 (222) 4567-8901",
        email: "info@sexaentreyes.mx",
        website: "www.sexaentreyes.mx",
        categories: ["Arquería", "Ballestas", "Competencia"],
        mapImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
        googleMapsUrl: "https://maps.google.com/?q=19.0414,-98.2063",
        latitude: "19.0414",
        longitude: "-98.2063",
        isVerified: "true"
      },
      {
        name: "Tactical Gear MX",
        description: "Equipo táctico y de seguridad",
        logo: "fas fa-tools",
        address: "Av. Revolución 456, Zona Centro",
        city: "Tijuana",
        state: "Baja California",
        phone: "+52 (664) 5678-9012",
        email: "ventas@tacticalgearmx.com",
        website: "www.tacticalgearmx.com",
        categories: ["Táctico", "Seguridad", "Holsters"],
        mapImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
        googleMapsUrl: "https://maps.google.com/?q=32.5149,-117.0382",
        latitude: "32.5149",
        longitude: "-117.0382",
        isVerified: "true"
      },
      {
        name: "Armería Central",
        description: "Venta y reparación de armas",
        logo: "fas fa-shield-alt",
        address: "Calle 60 No. 234, Col. Centro",
        city: "Mérida",
        state: "Yucatán",
        phone: "+52 (999) 6789-0123",
        email: "contacto@armeriacentral.mx",
        website: "www.armeriacentral.mx",
        categories: ["Armería", "Reparación", "Certificado"],
        mapImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=128",
        googleMapsUrl: "https://maps.google.com/?q=20.9674,-89.5926",
        latitude: "20.9674",
        longitude: "-89.5926",
        isVerified: "true"
      }
    ];

    sampleShops.forEach(shop => {
      const id = randomUUID();
      const fullShop: Shop = { 
        ...shop, 
        id,
        website: shop.website ?? null,
        latitude: shop.latitude ?? null,
        longitude: shop.longitude ?? null,
        isVerified: shop.isVerified ?? null
      };
      this.shops.set(id, fullShop);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }
    
    const updatedUser = { ...user, password: newPasswordHash };
    this.users.set(userId, updatedUser);
    return true;
  }

  async getUserWithPassword(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getShops(): Promise<Shop[]> {
    return Array.from(this.shops.values());
  }

  async getShopById(id: string): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopsByFilters(filters: {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
  }): Promise<Shop[]> {
    let shops = Array.from(this.shops.values());

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      shops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchLower) ||
        shop.description.toLowerCase().includes(searchLower) ||
        shop.city.toLowerCase().includes(searchLower) ||
        shop.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category) {
      shops = shops.filter(shop => 
        shop.categories.some(cat => cat.toLowerCase() === filters.category?.toLowerCase())
      );
    }

    if (filters.city) {
      shops = shops.filter(shop => 
        shop.city.toLowerCase() === filters.city?.toLowerCase()
      );
    }

    if (filters.state) {
      shops = shops.filter(shop => 
        shop.state.toLowerCase() === filters.state?.toLowerCase()
      );
    }

    return shops;
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const id = randomUUID();
    const shop: Shop = { 
      ...insertShop, 
      id,
      website: insertShop.website ?? null,
      latitude: insertShop.latitude ?? null,
      longitude: insertShop.longitude ?? null,
      isVerified: insertShop.isVerified ?? null
    };
    this.shops.set(id, shop);
    return shop;
  }

  async updateShop(id: string, updateShop: UpdateShop): Promise<Shop | undefined> {
    const existingShop = this.shops.get(id);
    if (!existingShop) {
      return undefined;
    }
    const updatedShop: Shop = { ...existingShop, ...updateShop };
    this.shops.set(id, updatedShop);
    return updatedShop;
  }

  async deleteShop(id: string): Promise<boolean> {
    return this.shops.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ password: newPasswordHash })
      .where(eq(users.id, userId));
    
    return (result.rowCount || 0) > 0;
  }

  async getUserWithPassword(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  }

  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  }

  async getShopById(id: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop || undefined;
  }

  async getShopsByFilters(filters: {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
  }): Promise<Shop[]> {
    const conditions = [];

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(shops.name, searchTerm),
          ilike(shops.description, searchTerm),
          ilike(shops.city, searchTerm)
        )
      );
    }

    if (filters.category) {
      // For array column search, we'll use a simpler approach
      conditions.push(ilike(shops.categories, `%${filters.category}%`));
    }

    if (filters.city) {
      conditions.push(ilike(shops.city, filters.city));
    }

    if (filters.state) {
      conditions.push(ilike(shops.state, filters.state));
    }

    if (conditions.length > 0) {
      return await db.select().from(shops).where(and(...conditions));
    }
    
    return await db.select().from(shops);
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db
      .insert(shops)
      .values(insertShop)
      .returning();
    return shop;
  }

  async updateShop(id: string, updateShop: UpdateShop): Promise<Shop | undefined> {
    const [shop] = await db
      .update(shops)
      .set(updateShop)
      .where(eq(shops.id, id))
      .returning();
    return shop || undefined;
  }

  async deleteShop(id: string): Promise<boolean> {
    const result = await db.delete(shops).where(eq(shops.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
