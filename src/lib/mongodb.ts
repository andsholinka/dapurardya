import { MongoClient, Db, ObjectId } from "mongodb";

export function tryConvertObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "dapurardya";

if (!uri) {
  console.warn("MONGODB_URI is not set. Recipe data will not persist.");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export async function checkDbConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const database = await getDb();
    await database.command({ ping: 1 });
    return { connected: true, message: `Connected to database "${dbName}" successfully.` };
  } catch (error) {
    return { connected: false, message: `Connection failed: ${(error as Error).message}` };
  }
}
