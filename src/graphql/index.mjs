import express from "express";
import { postgraphile } from "postgraphile";
import pg from "pg";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const { Client } = pg;

const jwksClientInstance = jwksClient({
  jwksUri: "http://auth:3000/.well-known/jwks.json",
  requestHeaders: {},
  timeout: 10000,
  cache: true,
});

const app = express();
const DATABASE_URL = process.env.DATABASE_URL || "postgres://root:password@postgres:5432/db";

// validate JWTs
app.use("/graphql", async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  const key = await jwksClientInstance.getSigningKey();
  try {
    const decoded = jwt.verify(
      token,
      key.getPublicKey(),
      { algorithms: ["RS256"] },
    );
    // magic
    const { sub, role } = decoded;
    req.user = { sub, role };
  } catch (err) {
    return res.status(401).json({ err });
  }
  return next();
});

// postgraphile
app.use(
  postgraphile(
    DATABASE_URL,
    "public",
    {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      simpleCollections: "both",
      // magic
      pgSettings: (req) => {
        console.log(req.user);
        const settings = {};
        if (req.user) {
          settings.role = req.user.role;
        }
        return settings;
      },
    },
  ),
);

const ready = async () => {
  try {
    const client = new Client(DATABASE_URL);
    await client.connect();
    await client.query("SELECT NOW()").catch(() => false);
    await client.end();
  } catch (err) {
    return false;
  }
  return true;
};

app.get("/live", (req, res) => res.status(200).json({ status: "OK" }));

app.get("/ready", async (req, res) => {
  if (!(await ready())) {
    return res.status(500).json({ status: "NOT OK" });
  }
  return res.status(200).json({ status: "OK" });
});

app.get("/health", async (req, res) => {
  if (!(await ready())) {
    return res.status(500).json({ status: "NOT OK" });
  }
  return res.status(200).json({ status: "OK" });
});

app.listen(process.env.PORT || 3000);
