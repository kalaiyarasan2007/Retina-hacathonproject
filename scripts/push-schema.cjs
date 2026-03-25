const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/retinaeye",
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Check existing tables
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("Existing tables:", res.rows.map((r) => r.table_name));

    // Create patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        diabetes_type TEXT,
        contact_info TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("patients table ready");

    // Create scans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        image_data TEXT,
        dr_stage INTEGER NOT NULL,
        confidence_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        blindness_risk_score INTEGER NOT NULL,
        heatmap_data TEXT,
        doctor_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        doctor_notes TEXT,
        doctor_id TEXT,
        recommendation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("scans table ready");

    // Verify
    const res2 = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("Tables after creation:", res2.rows.map((r) => r.table_name));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

run();
