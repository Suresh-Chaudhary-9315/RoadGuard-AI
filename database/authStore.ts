import { Db, MongoClient } from 'mongodb';

let authClient: MongoClient | null = null;
let authDb: Db | null = null;
let connecting: Promise<Db> | null = null;

export async function getAuthDatabase(): Promise<Db> {
  if (authDb) return authDb;
  if (connecting) return connecting;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'roadguard_ai';

  if (!uri) {
    throw new Error('MONGODB_URI is required for authentication.');
  }

  connecting = (async () => {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    authClient = client;
    authDb = client.db(dbName);
    console.log(`[Auth] Connected to MongoDB database: ${dbName}`);
    return authDb;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export async function closeAuthDatabase(): Promise<void> {
  if (authClient) {
    await authClient.close();
  }
  authClient = null;
  authDb = null;
}
