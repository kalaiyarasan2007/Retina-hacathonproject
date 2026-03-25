const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/retinaeye",
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    await client.query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;`);
    console.log("patients table updated with is_deleted");

    await client.query(`ALTER TABLE scans ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;`);
    console.log("scans table updated with is_deleted");

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

run();
