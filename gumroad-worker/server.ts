import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createRealGumroadProduct } from '../src/lib/gumroad-automation';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Simple health endpoint so external checks won't 404
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'gumroad-worker', version: 1 });
});

// Root route also returns a simple message (useful for quick curl tests)
app.get('/', (_req, res) => {
  res.status(200).send('gumroad-worker online');
});

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const expected = process.env.GUMROAD_WORKER_TOKEN;
  if (!expected) return next();
  const header = req.headers.authorization || '';
  if (header === `Bearer ${expected}`) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized' });
}

app.post('/publish', auth, async (req, res) => {
  try {
    const { product, credentials } = req.body || {};
    if (!product) {
      return res.status(400).json({ success: false, message: 'Missing product' });
    }
    const result = await createRealGumroadProduct(product, credentials);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Worker error', error: err?.message || 'Unknown' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Gumroad worker listening on :${port}`);
});



