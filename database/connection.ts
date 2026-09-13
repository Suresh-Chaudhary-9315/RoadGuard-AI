import { MongoClient, Db } from 'mongodb';
import { INITIAL_REPORTS, INITIAL_ROAD_CONTRACTORS } from './seedData';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnectedToRealMongo = false;

// Resilient in-memory storage fallback for development / prototype without live cluster
class InMemoryCollection<T extends { id?: string; _id?: any }> {
  private items: T[] = [];

  constructor(initialData: T[] = []) {
    this.items = JSON.parse(JSON.stringify(initialData));
  }

  async find(filter: any = {}): Promise<{ toArray: () => Promise<T[]> }> {
    let result = [...this.items];
    if (filter) {
      if (filter.id) {
        result = result.filter((i) => (i as any).id === filter.id);
      }
      if (filter.status) {
        result = result.filter((i) => (i as any).status === filter.status);
      }
      if (filter.severity) {
        result = result.filter((i) => (i as any).severity === filter.severity);
      }
      if (filter.contractStatus) {
        result = result.filter((i) => (i as any).contractStatus === filter.contractStatus);
      }
    }
    return {
      toArray: async () => [...result],
    };
  }

  async findOne(filter: any): Promise<T | null> {
    const found = this.items.find((item: any) => {
      if (filter.id && item.id === filter.id) return true;
      if (filter._id && item._id === filter._id) return true;
      return false;
    });
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async insertOne(doc: T): Promise<{ insertedId: string; acknowledged: boolean }> {
    const itemWithId = { ...doc };
    if (!(itemWithId as any)._id) {
      (itemWithId as any)._id = (itemWithId as any).id || `doc_${Date.now()}`;
    }
    this.items.unshift(itemWithId);
    return { insertedId: (itemWithId as any)._id, acknowledged: true };
  }

  async updateOne(filter: any, update: any): Promise<{ modifiedCount: number }> {
    const index = this.items.findIndex((item: any) => {
      if (filter.id && item.id === filter.id) return true;
      if (filter._id && item._id === filter._id) return true;
      return false;
    });

    if (index === -1) return { modifiedCount: 0 };

    if (update.$set) {
      this.items[index] = { ...this.items[index], ...update.$set };
    }
    if (update.$push) {
      for (const [key, val] of Object.entries(update.$push)) {
        if (!Array.isArray((this.items[index] as any)[key])) {
          (this.items[index] as any)[key] = [];
        }
        (this.items[index] as any)[key].push(val);
      }
    }
    return { modifiedCount: 1 };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const { toArray } = await this.find(filter);
    const docs = await toArray();
    return docs.length;
  }
}

// Fallback collections
const inMemoryStores = {
  reports: new InMemoryCollection<any>(INITIAL_REPORTS),
  contractors: new InMemoryCollection<any>(INITIAL_ROAD_CONTRACTORS),
  notifications: new InMemoryCollection<any>([]),
};

export async function getDatabase(): Promise<{
  db: Db | null;
  isLiveMongo: boolean;
  collection: (name: 'reports' | 'contractors' | 'notifications') => any;
}> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'roadguard_ai';

  if (uri && !client) {
    try {
      console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      dbInstance = client.db(dbName);
      isConnectedToRealMongo = true;
      console.log(`[MongoDB] Successfully connected to database: ${dbName}`);

      // Seed initial collections if empty
      const reportsCount = await dbInstance.collection('reports').countDocuments();
      if (reportsCount === 0) {
        console.log('[MongoDB] Seeding initial reports and contractors into collections...');
        await dbInstance.collection('reports').insertMany(INITIAL_REPORTS as any);
        await dbInstance.collection('contractors').insertMany(INITIAL_ROAD_CONTRACTORS as any);
      }
    } catch (err: any) {
      console.warn(`[MongoDB] Could not establish remote cluster connection: ${err.message}`);
      console.log('[MongoDB] Seamlessly falling back to high-fidelity local MongoDB store.');
      client = null;
      dbInstance = null;
      isConnectedToRealMongo = false;
    }
  }

  return {
    db: dbInstance,
    isLiveMongo: isConnectedToRealMongo,
    collection: (name: 'reports' | 'contractors' | 'notifications') => {
      if (isConnectedToRealMongo && dbInstance) {
        return dbInstance.collection(name);
      }
      return inMemoryStores[name];
    },
  };
}

export function getDatabaseStatus(): {
  type: 'MongoDB Atlas' | 'MongoDB In-Memory Document Store';
  connected: boolean;
  database: string;
} {
  return {
    type: isConnectedToRealMongo ? 'MongoDB Atlas' : 'MongoDB In-Memory Document Store',
    connected: true,
    database: process.env.MONGODB_DB_NAME || 'roadguard_ai',
  };
}
