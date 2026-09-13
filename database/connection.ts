import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

async function connectToMongo(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'roadguard_ai';

  if (!uri) {
    throw new Error(
      '[MongoDB] MONGODB_URI is not configured. Database connection is required.'
    );
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      console.log('[MongoDB] Connecting to persistent MongoDB database...');

      const mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      await mongoClient.connect();

      const database = mongoClient.db(dbName);

      // Verify that MongoDB is actually reachable.
      await database.command({ ping: 1 });

      client = mongoClient;
      dbInstance = database;

      console.log(`[MongoDB] Connected successfully to: ${dbName}`);

      return database;
    })().catch((error) => {
      client = null;
      dbInstance = null;
      connectionPromise = null;

      console.error('[MongoDB] Connection failed:', error);
      throw error;
    });
  }

  return connectionPromise;
}

export async function getDatabase(): Promise<{
  db: Db;
  isLiveMongo: boolean;
  collection: (
    name: 'reports' | 'contractors' | 'notifications'
  ) => any;
}> {
  const db = await connectToMongo();

  return {
    db,
    isLiveMongo: true,
    collection: (
      name: 'reports' | 'contractors' | 'notifications'
    ) => db.collection(name),
  };
}

export function getDatabaseStatus(): {
  type: 'MongoDB';
  connected: boolean;
  database: string;
} {
  return {
    type: 'MongoDB',
    connected: dbInstance !== null,
    database: process.env.MONGODB_DB_NAME || 'roadguard_ai',
  };
}