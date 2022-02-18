import jose from "node-jose";
import fs from "fs";
import { Command } from "commander";

const KEYS_FILE = "./src/keys.json";

const generateKeys = async () => {
  const keyStore = jose.JWK.createKeyStore();
  await keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keyStore.toJSON(true), null, "  "));
};

const generateToken = async () => {
  const ks = fs.readFileSync(KEYS_FILE);
  console.log(ks.toString());
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  console.log(keyStore.toJSON());
  const [key] = keyStore.all({ use: "sig" });

  const opt = { compact: true, jwk: key, fields: { typ: "jwt" } };
  const iat = new Date();
  const exp = new Date(iat);
  const payload = JSON.stringify({
    exp: Math.floor(exp.setDate(exp.getDate() + 1) / 1000),
    iat: Math.floor(iat / 1000),
    sub: "test",
  });

  const token = await jose.JWS.createSign(opt, key)
    .update(payload)
    .final();
  console.log(token);
};

const getJwks = async () => {
  const ks = fs.readFileSync(KEYS_FILE);
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  console.log(keyStore.toJSON());
};

const exportKeys = async () => {
  const ks = fs.readFileSync(KEYS_FILE);
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  const [key] = keyStore.all({ use: "sig" });
  console.log(key.toPEM());
  console.log(key.toPEM(true));
};

const program = new Command();
program.description("Util for generating keys and tokens");
program.command("generatekeys").description("generate keys").action(async () => {
  await generateKeys();
});
program.command("generatetoken").description("generate signed dummy jwt-token").action(async () => {
  await generateToken();
});
program.command("getjwks").description("get JWKS").action(async () => {
  await getJwks();
});
program.command("exportkeys").description("output public and private keys").action(async () => {
  await exportKeys();
});
program.parse();
