import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

// Auto-provision schema SQL for tables
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

export type Database = ReturnType<typeof drizzlePg<typeof schema>>;

let poolExport: any;
let dbExport: any;

if (isProduction) {
  // ─── 1. PRODUCTION MODE (Render) ──────────────────────────────────────────
  // Strictly require DATABASE_URL; do NOT initialize PGlite in production
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable must be configured in production. " +
      "Please set DATABASE_URL in your Render environment settings."
    );
  }

  // Use the standard PostgreSQL pool & Drizzle instance exactly as intended
  const prodPool = new Pool({ connectionString: databaseUrl });

  // Safe startup schema initialization: ensure schema creation completes before subsequent queries run
  let schemaInitPromise: Promise<void> | null = null;
  const originalQuery = prodPool.query.bind(prodPool);
  const originalConnect = prodPool.connect.bind(prodPool);

  function ensureSchemaReady(): Promise<void> {
    if (!schemaInitPromise) {
      schemaInitPromise = (async () => {
        try {
          await originalQuery(SCHEMA_SQL);
          console.log("[DB] Production PostgreSQL schema initialized successfully.");
        } catch (err: any) {
          console.warn("[DB] Note on production schema initialization:", err.message);
        }
      })();
    }
    return schemaInitPromise;
  }

  // Eagerly trigger schema initialization on startup
  ensureSchemaReady();

  // Intercept queries and connections so they safely await schema readiness
  prodPool.query = async function (...args: any[]) {
    await ensureSchemaReady();
    return (originalQuery as any)(...args);
  } as any;

  prodPool.connect = async function (...args: any[]) {
    await ensureSchemaReady();
    return (originalConnect as any)(...args);
  } as any;

  const prodDb = drizzlePg(prodPool, { schema });

  poolExport = prodPool;
  dbExport = prodDb;
} else if (databaseUrl && !databaseUrl.includes("localhost:5432")) {
  // ─── 2. LOCAL DEV WITH REMOTE DATABASE_URL ────────────────────────────────
  const devPool = new Pool({ connectionString: databaseUrl });

  let schemaInitPromise: Promise<void> | null = null;
  const originalQuery = devPool.query.bind(devPool);

  function ensureSchemaReady(): Promise<void> {
    if (!schemaInitPromise) {
      schemaInitPromise = (async () => {
        try {
          await originalQuery(SCHEMA_SQL);
          console.log("[DB] Remote PostgreSQL schema initialized successfully.");
        } catch (err: any) {
          console.warn("[DB] Note on schema initialization:", err.message);
        }
      })();
    }
    return schemaInitPromise;
  }

  ensureSchemaReady();

  devPool.query = async function (...args: any[]) {
    await ensureSchemaReady();
    return (originalQuery as any)(...args);
  } as any;

  const devDb = drizzlePg(devPool, { schema });

  poolExport = devPool;
  dbExport = devDb;
} else {
  // ─── 3. LOCAL DEV ONLY (Lazy fallback to PGlite if local Postgres unavailable)
  let pgliteInstance: PGlite | null = null;
  let pgliteDb: any = null;
  let pgPoolInstance: pg.Pool | null = null;
  let pgDbInstance: any = null;
  let isPgAvailable = false;
  let initPromise: Promise<void> | null = null;

  function getPglite() {
    if (!pgliteInstance) {
      const dbDir = path.resolve(process.cwd(), ".data", "pglite");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      try {
        pgliteInstance = new PGlite(dbDir);
      } catch {
        pgliteInstance = new PGlite();
      }
      pgliteDb = drizzlePglite(pgliteInstance, { schema });
      pgliteInstance.exec(SCHEMA_SQL).catch(console.error);
    }
    return { pglite: pgliteInstance, db: pgliteDb };
  }

  async function initLocalDevDb() {
    if (databaseUrl) {
      try {
        const testPool = new Pool({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 1500,
        });
        const client = await testPool.connect();
        await client.query("SELECT 1");
        await client.query(SCHEMA_SQL);
        client.release();

        pgPoolInstance = testPool;
        pgDbInstance = drizzlePg(testPool, { schema });
        isPgAvailable = true;
        console.log("Connected to local PostgreSQL database.");
        return;
      } catch (err: any) {
        console.warn("[DB] Local PostgreSQL unavailable (" + (err.code || err.message) + "). Using local PGlite fallback.");
        isPgAvailable = false;
      }
    }
    getPglite();
  }

  initPromise = initLocalDevDb().catch(console.error);

  dbExport = new Proxy({} as any, {
    get(_target, prop) {
      if (isPgAvailable && pgDbInstance) {
        const val = pgDbInstance[prop];
        return typeof val === "function" ? val.bind(pgDbInstance) : val;
      }
      const { db: devDb } = getPglite();
      const val = devDb[prop];
      return typeof val === "function" ? val.bind(devDb) : val;
    },
  });

  poolExport = {
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
}

export const pool = poolExport as pg.Pool;
export const db = dbExport as Database;

export * from "./schema";
