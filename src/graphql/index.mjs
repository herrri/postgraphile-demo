import express from "express";
import { postgraphile } from "postgraphile";
import pg from "pg";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import health from "@cloudnative/health-connect";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://root:password@postgres:5432/db";
const AUDIENCE = "my_app";

const { Client } = pg;
const app = express();
const jwksClientInstance = jwksClient({
  jwksUri: "http://auth:3000/.well-known/jwks.json",
  requestHeaders: {},
  timeout: 10000,
  cache: true,
});
const healthcheck = new health.HealthChecker();

app.use("/graphql", async (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) {
      throw new Error("no authorization header");
    }

    if (!authorization.includes("Bearer")) {
      throw new Error("authorization header does not contain bearer token");
    }

    const token = authorization.replace("Bearer ", "");
    const key = await jwksClientInstance.getSigningKey();
    const decoded = jwt.verify(token, key.getPublicKey(), {
      algorithms: ["RS256"],
      audience: AUDIENCE,
    });
    const { sub, role } = decoded;
    req.user = { sub, role };
  } catch (err) {
    // req.user = { sub: null, role: "anonymous" };
    return res.status(401).json({ err: err.message });
  }
  return next();
});

app.use(
  postgraphile(DATABASE_URL, "public", {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    simpleCollections: "both",
    pgSettings: (req) => {
      console.log(req.user);
      const settings = {};
      if (req.user) {
        settings.role = req.user.role;
        settings["jwt.claims.user_id"] = req.user.sub;
      }
      return settings;
    },
  }),
);

healthcheck.registerLivenessCheck(async (resolve, _reject) => {
  try {
    const client = new Client(DATABASE_URL);
    await client.connect();
    await client.query("SELECT NOW()").catch(() => false);
    await client.end();
    resolve();
  } catch {
    _reject();
  }
});
healthcheck.registerReadinessCheck(new health.PingCheck("example.com"));

app.use("/live", health.LivenessEndpoint(healthcheck));
app.use("/ready", health.ReadinessEndpoint(healthcheck));
app.use("/health", health.HealthEndpoint(healthcheck));

app.listen(process.env.PORT || 3000);
