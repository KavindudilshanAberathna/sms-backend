import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

app.post('/send-sms', async (req, res) => {
  const { contact, message } = req.body;

  if (!contact || !message) {
    return res.status(400).json({ error: 'Missing contact or message' });
  }

  try {
    const params = new URLSearchParams();
    params.append('user_id', process.env.SMSLENZ_USERID);
    params.append('api_key', process.env.SMSLENZ_API_KEY);
    params.append('sender_id', process.env.SMSLENZ_SENDER_ID);
    params.append('contact', contact);
    params.append('message', message);

    const response = await fetch(process.env.SMSLENZ_API_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    res.json({ success: true, response: text });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('SMS backend is running!');
});

// ✅ Important: Export for Vercel
export default serverless(app);
