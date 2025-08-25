require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI; 
const DB_NAME = process.env.DB_NAME || "goatslite";
const COLLECTION = process.env.COLLECTION || "guestbook_entries";

// ----- CORS (recommended allow-list) -----
const allowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser tools (curl/Postman) that send no Origin header
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400, 
  })
);

app.use(express.json());

let col;

// Connect once at startup
(async () => {
  const client = new MongoClient(MONGODB_URI, {
    ignoreUndefined: true,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  const db = client.db(DB_NAME);
  col = db.collection(COLLECTION);
  await col.createIndex({ createdAt: 1 });
  console.log(`API connected to ${DB_NAME}.${COLLECTION}`);
})().catch((err) => {
  console.error("Mongo connect error:", err);
  process.exit(1);
});

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// GET oldest → newest (limit default 200)
app.get("/api/guestbook", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 500);
    const docs = await col.find({}).sort({ createdAt: 1 }).limit(limit).toArray();

    // Send createdAt as ISO string to the client for consistency
    const out = docs.map((d) => ({
      id: d._id.toString(),
      who: d.who,
      text: d.text,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    }));

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// POST a new entry — store createdAt as a real Date
app.post("/api/guestbook", async (req, res) => {
  try {
    const who = String(req.body?.who || "Anonymous Goat").slice(0, 60);
    const text = String(req.body?.text || "").slice(0, 400).trim();
    if (!text) return res.status(400).json({ error: "Empty message" });

    const doc = { who, text, createdAt: new Date() }; // real Date
    const r = await col.insertOne(doc);

    // Return ISO string to the client
    res.status(201).json({
      id: r.insertedId.toString(),
      who,
      text,
      createdAt: doc.createdAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Guestbook API on :${PORT}`));

app.get("/api/_debug", async (req, res) => {
  try {
    const count = await col.countDocuments();
    res.json({
      db: DB_NAME,
      collection: COLLECTION,
      count
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
