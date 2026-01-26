import { type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // Add any storage methods here if needed later
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage
  }
}

export const storage = new MemStorage();
