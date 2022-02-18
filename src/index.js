import express from "express";
import { postgraphile } from "postgraphile";
import { Client } from "pg";

const app = express();
const DATABASE_URL = process.env.DATABASE_URL || "postgres://user:password@postgres:5432/db";

app.use(
  postgraphile(
    DATABASE_URL,
    "public",
    {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
    }
  )
);

const ready = async () => {
  const client = new Client(DATABASE_URL);
  await client.connect();
  await client.query("SELECT NOW()").catch(() => {
    return false;
  });
  await client.end();
  return true;
}

app.get('/live', (req, res) => {
  return res.status(200).json({status: 'OK'});
});

app.get('/ready', async (req, res) => {
  if(!ready()) {
    return res.status(500).json({status: 'NOT OK'})
  }
  return res.status(200).json({status: 'OK'});
});

app.get('/health', async (req, res) => {
  if(!ready()) {
    return res.status(500).json({status: 'NOT OK'})
  }
  return res.status(200).json({status: 'OK'});
});


app.listen(process.env.PORT || 3000);