import express from "express";
import fs from "fs";
import { postgraphile } from "postgraphile";
import pg from "pg";
import jose from "node-jose";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

const { Client } = pg;

const KEYS_FILE = "src/keys.json";

const app = express();
const DATABASE_URL = process.env.DATABASE_URL || "postgres://user:password@postgres:5432/db";

app.use(async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  const ks = fs.readFileSync(KEYS_FILE);
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  const [key] = keyStore.all();
  try {
    const decoded = jwt.verify(
      token,
      jwkToPem(key.toJSON()),
      { algorithms: ["RS256"] },
    );
    console.log(decoded);
  } catch (err) {
    return res.status(401).send();
  }
  return next();
});

app.use(
  postgraphile(
    DATABASE_URL,
    "public",
    {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
    },
  ),
);

const ready = async () => {
  const client = new Client(DATABASE_URL);
  await client.connect();
  await client.query("SELECT NOW()").catch(() => false);
  await client.end();
  return true;
};

app.get("/live", (req, res) => res.status(200).json({ status: "OK" }));

app.get("/ready", async (req, res) => {
  if (!ready()) {
    return res.status(500).json({ status: "NOT OK" });
  }
  return res.status(200).json({ status: "OK" });
});

app.get("/health", async (req, res) => {
  if (!ready()) {
    return res.status(500).json({ status: "NOT OK" });
  }
  return res.status(200).json({ status: "OK" });
});

app.listen(process.env.PORT || 3000);
