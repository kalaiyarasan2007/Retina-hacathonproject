import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const { Pool } = pg;

// Use a persistent data directory for PGlite fallback
const dbDir = path.resolve(process.cwd(), ".data", "pglite");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let pgliteInstance: PGlite | null = null;
let pgliteDb: any = null;
let pgPoolInstance: pg.Pool | null = null;
let pgDb: any = null;
let isPgAvailable = false;
let initPromise: Promise<void> | null = null;

// Table schema auto-creation SQL
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  diabetes_type TEXT,
  contact_info TEXT,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  image_data TEXT,
  dr_stage INTEGER NOT NULL,
  confidence_score REAL NOT NULL,
  risk_level TEXT NOT NULL,
  blindness_risk_score INTEGER NOT NULL,
  heatmap_data TEXT,
  doctor_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
  doctor_notes TEXT,
  doctor_id TEXT,
  recommendation TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'doctor'
);
`;

// Helper to get or initialize PGlite
export function getPglite() {
  if (!pgliteInstance) {
    try {
      pgliteInstance = new PGlite(dbDir);
    } catch {
      pgliteInstance = new PGlite(); // in-memory fallback if file system is locked
    }
    pgliteDb = drizzlePglite(pgliteInstance, { schema });
  }
  return { pglite: pgliteInstance, db: pgliteDb };
}

// Immediately ensure PGlite is ready with schemas
const { pglite: earlyPglite } = getPglite();
earlyPglite.exec(SCHEMA_SQL).catch((err) => {
  console.warn("PGlite initial schema creation warning:", err);
});

async function initializeDatabase() {
  const { pglite } = getPglite();
  await pglite.exec(SCHEMA_SQL);

  if (process.env.DATABASE_URL) {
    try {
      const testPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 1500,
      });
      const client = await testPool.connect();
      await client.query("SELECT 1");
      await client.query(SCHEMA_SQL);
      client.release();

      pgPoolInstance = testPool;
      pgDb = drizzlePg(testPool, { schema });
      isPgAvailable = true;
      console.log(" Connected to external PostgreSQL database.");
      return;
    } catch (err: any) {
      console.warn("⚠️ External PostgreSQL unavailable (" + (err.code || err.message) + "). Seamlessly using embedded PGlite database.");
      isPgAvailable = false;
    }
  } else {
    console.log(" Using embedded PGlite database.");
  }
}

initPromise = initializeDatabase().catch((e) => {
  console.error("Database initialization warning:", e);
});

// Proxy for db: delegates to pgDb if available, otherwise pgliteDb
export const db = (new Proxy({} as any, {
  get(_target, prop) {
    if (isPgAvailable && pgDb) {
      const val = pgDb[prop];
      return typeof val === "function" ? val.bind(pgDb) : val;
    }
    const { db: activeDb } = getPglite();
    const val = activeDb[prop];
    return typeof val === "function" ? val.bind(activeDb) : val;
  },
}) as unknown) as ReturnType<typeof drizzlePg<typeof schema>>;

// Proxy for pool: provides .query() and .connect() compatible with pg.Pool
export const pool: any = {
  async query(text: string, params?: any[]) {
    await initPromise;
    if (isPgAvailable && pgPoolInstance) {
      try {
        return await pgPoolInstance.query(text, params);
      } catch (err: any) {
        if (err.code === "ECONNREFUSED") {
          isPgAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const { pglite } = getPglite();
    return await pglite.query(text, params);
  },
  async connect() {
    await initPromise;
    if (isPgAvailable && pgPoolInstance) {
      try {
        return await pgPoolInstance.connect();
      } catch (err: any) {
        if (err.code === "ECONNREFUSED") {
          isPgAvailable = false;
        } else {
          throw err;
        }
      }
    }
    const { pglite } = getPglite();
    return {
      query: (t: string, p?: any[]) => pglite.query(t, p),
      release: () => {},
    };
  },
};

export * from "./schema";
