import jose from "node-jose";
import fs from "fs";
import { Command } from "commander";

const KEYS_FILE = "./src/keys.json";

const generateKeys = async () => {
  const keyStore = jose.JWK.createKeyStore();
  await keyStore.generate("RSA", 2048, { alg: "RS256", use: "sig" });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keyStore.toJSON(true), null, "  "));
};

const generateToken = async (opts) => {
  const ks = fs.readFileSync(KEYS_FILE);
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  const [key] = keyStore.all({ use: "sig" });

  const opt = { compact: true, jwk: key, fields: { typ: "jwt" } };
  const iat = new Date();
  const exp = new Date(iat);
  const payload = JSON.stringify({
    exp: Math.floor(exp.setDate(exp.getDate() + 1) / 1000),
    iat: Math.floor(iat / 1000),
    sub: opts.sub || null,
    role: opts.role || "anonymous",
    aud: opts.aud || ["my_app"],
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

const exportKeys = async (opts) => {
  const ks = fs.readFileSync(KEYS_FILE);
  const keyStore = await jose.JWK.asKeyStore(ks.toString());
  const [key] = keyStore.all({ use: "sig" });
  if (opts.cert === "public" || opts.cert === "both") {
    console.log(key.toPEM());
  }
  if (opts.cert === "private" || opts.cert === "both") {
    console.log(key.toPEM(true));
  }
};

const program = new Command();
program.description("JWT util");
program.command("generate-keys").description("generate RSA-keypair").action(async () => {
  await generateKeys();
});
program.command("generate-jwt")
  .option("--role [name]")
  .option("--sub [id]", "integer argument", parseInt)
  .option("--aud [value]", "audiences in separated by comma", (arg) => arg.split(","))
  .description("generate dummy jwt-token")
  .action(async (opts) => {
    await generateToken(opts);
  });
program.command("generate-jwks").description("ouputs a JSON jwks").action(async () => {
  await getJwks();
});
program.command("export-certs").option("--cert [public|private|both]", "cert to export", "public").description("output public and private keys")
  .action(async (opts) => {
    const valid = ["public", "private", "both"].includes(opts.cert);
    if (!valid) {
      console.error("Invalid option. Valid options are [public|private|both]");
    }
    await exportKeys(opts);
  });
program.parse();
