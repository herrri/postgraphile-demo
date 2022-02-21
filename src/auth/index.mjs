import express from "express";
import fs from "fs";
import jose from "node-jose";

const KEYS_FILE = "src/keys.json";

const app = express();

const getKeyStore = async () => {
  const ks = fs.readFileSync(KEYS_FILE);
  return jose.JWK.asKeyStore(ks.toString());
};

app.get("/.well-known/jwks.json", async (req, res) => {
  const keyStore = await getKeyStore();
  return res.json(keyStore.toJSON());
});

app.listen(process.env.PORT || 3000);
