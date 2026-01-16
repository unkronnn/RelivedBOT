import { MongoClient, Db, Collection, Document, Filter, UpdateFilter } from "mongodb"

class DatabaseManager {
  private client: MongoClient | null = null
  private db: Db | null = null
  private connected: boolean = false

  async connect(uri?: string): Promise<void> {
    try {
      const connectionString = uri || process.env.MONGODB_URI || "mongodb://localhost:27017"
      const dbName = process.env.DATABASE_NAME || "rrpbot"

      this.client = new MongoClient(connectionString)
      await this.client.connect()
      
      this.db = this.client.db(dbName)
      this.connected = true

      console.log(`[DATABASE] Connected to MongoDB: ${dbName}`)
    } catch (error) {
      console.error("[DATABASE] Connection failed:", error)
      this.connected = false
    }
  }

  is_connected(): boolean {
    return this.connected
  }

  get_collection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error("Database not connected")
    }
    return this.db.collection<T>(name)
  }

  async insert_one<T extends Document>(
    collection: string,
    document: T
  ): Promise<string> {
    const result = await this.get_collection<T>(collection).insertOne(document)
    return result.insertedId.toString()
  }

  async find_one<T extends Document>(
    collection: string,
    filter: Filter<T>
  ): Promise<T | null> {
    return await this.get_collection<T>(collection).findOne(filter)
  }

  async find_many<T extends Document>(
    collection: string,
    filter: Filter<T>
  ): Promise<T[]> {
    return await this.get_collection<T>(collection).find(filter).toArray()
  }

  async update_one<T extends Document>(
    collection: string,
    filter: Filter<T>,
    update: Partial<T> | UpdateFilter<T>,
    upsert: boolean = false
  ): Promise<boolean> {
    const result = await this.get_collection<T>(collection).updateOne(
      filter,
      { $set: update },
      { upsert }
    )
    return result.modifiedCount > 0 || result.upsertedCount > 0
  }

  async delete_one<T extends Document>(
    collection: string,
    filter: Filter<T>
  ): Promise<boolean> {
    const result = await this.get_collection<T>(collection).deleteOne(filter)
    return result.deletedCount > 0
  }

  async delete_many<T extends Document>(
    collection: string,
    filter: Filter<T>
  ): Promise<number> {
    const result = await this.get_collection<T>(collection).deleteMany(filter)
    return result.deletedCount
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.connected = false
      console.log("[DATABASE] Connection closed")
    }
  }
}

export const db = new DatabaseManager()
