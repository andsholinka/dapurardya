import { MongoClient, Db, ObjectId, type IndexDescription } from "mongodb";

export function tryConvertObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}


declare global {
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "dapurardya";

if (!uri) {
  console.warn("MONGODB_URI is not set. Recipe data will not persist.");
}


let client: MongoClient | null = null;
let db: Db | null = null;
let indexesEnsured = false;

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

async function ensureIndexes(database: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    const indexes: Record<string, IndexDescription[]> = {
      recipes: [
        { key: { slug: 1 }, unique: true, name: "slug_unique" },
        { key: { published: 1, updatedAt: -1 }, name: "published_updated" },
        { key: { category: 1, published: 1 }, name: "category_published" },
      ],
      members: [
        { key: { email: 1 }, unique: true, name: "email_unique" },
      ],
      recipe_ratings: [
        { key: { recipeId: 1, memberId: 1 }, unique: true, name: "recipe_member_unique" },
        { key: { recipeId: 1 }, name: "recipe_id" },
      ],
      recipe_requests: [
        { key: { status: 1, createdAt: -1 }, name: "status_created" },
      ],
      push_subscriptions: [
        { key: { endpoint: 1 }, unique: true, name: "endpoint_unique" },
      ],
      payment_logs: [
        { key: { paymentId: 1 }, unique: true, name: "payment_id_unique" },
        { key: { email: 1, createdAt: -1 }, name: "email_created" },
      ],
    };
    await Promise.all(
      Object.entries(indexes).map(([col, idx]) =>
        database.collection(col).createIndexes(idx).catch(() => {/* indexes may already exist */})
      )
    );
  } catch {
    // Non-fatal — app still works without indexes
  }
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  
  if (db) return db;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, mongoOptions);
      await global._mongoClient.connect();
    }
    client = global._mongoClient;
  } else {
    if (!client) {
      client = new MongoClient(uri, mongoOptions);
      await client.connect();
    }
  }
  
  db = client.db(dbName);
  void ensureIndexes(db);
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
