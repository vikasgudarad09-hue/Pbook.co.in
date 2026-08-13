import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(process.cwd(), 'poll_data.json');

app.use(express.json({ limit: '10mb' }));

// Enable CORS for external frontend access (e.g., Railway / custom domain)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const DEFAULT_POLL = {
  questions: [
    {
      id: "q1",
      text: "ಧಾರವಾಡ ಗ್ರಾಮೀಣ ಉಪಚುನಾವಣೆಗೆ ಬಿಜೆಪಿ ಅಭ್ಯರ್ಥಿ ಯಾರು ಆಗಬೇಕು?",
      candidates: [
        { id: "c1", name: "ಅಮೃತ ದೇಸಾಯಿ", photoUrl: "", colorTheme: "blue", votes: 0 },
        { id: "c2", name: "ಮಂಜುನಾಥ ಮಕ್ಕಳಗೇರಿ", photoUrl: "", colorTheme: "green", votes: 0 },
        { id: "c3", name: "ಸೀಮಾ ಮಸೂತಿ", photoUrl: "", colorTheme: "orange", votes: 0 }
      ]
    }
  ],
  interstitialAdUrl: "",
  interstitialAdText: "Ad induced by Admin",
  bannerAdUrl: "",
  bannerAdText: "Ad Banner",
  contactPhone: "9876543210",
  recentPhotos: [],
  faqs: [
    { question: "How does the poll work?", answer: "Simply tap on your preferred candidate and click Vote!" }
  ]
};

let memoryPollData: any = null;

function readPollData() {
  if (memoryPollData) {
    return memoryPollData;
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && (data.questions || data.candidates)) {
        memoryPollData = data;
        return memoryPollData;
      }
    }
  } catch (err) {
    console.error('Error reading poll_data.json:', err);
  }
  memoryPollData = DEFAULT_POLL;
  return memoryPollData;
}

function writePollData(data: any) {
  memoryPollData = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing poll_data.json:', err);
  }
}

const VOTED_IPS_FILE = path.join(process.cwd(), 'voted_ips.json');

function readVotedIps(): Record<string, boolean> {
  try {
    if (fs.existsSync(VOTED_IPS_FILE)) {
      const content = fs.readFileSync(VOTED_IPS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading voted_ips.json:', err);
  }
  return {};
}

function recordVotedIp(ipKey: string) {
  try {
    const ips = readVotedIps();
    ips[ipKey] = true;
    fs.writeFileSync(VOTED_IPS_FILE, JSON.stringify(ips, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing voted_ips.json:', err);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'express-railway-ready', timestamp: new Date().toISOString() });
});

app.get('/api/ip', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(',')[0].trim();
  res.json({ ip });
});

app.get('/api/check-voted', (req, res) => {
  const { questionId, userIp } = req.query;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = (userIp as string) || (Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(',')[0].trim());
  if (!questionId) {
    return res.status(400).json({ error: 'Missing questionId' });
  }
  const ipKey = `${questionId}_${ip}`;
  const votedIps = readVotedIps();
  res.json({ voted: !!votedIps[ipKey] });
});

app.get('/api/poll', (req, res) => {
  const data = readPollData();
  res.json(data);
});

app.post('/api/poll', (req, res) => {
  const newPollData = req.body;
  if (!newPollData) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }
  writePollData(newPollData);
  res.json({ success: true, data: newPollData });
});

app.post('/api/vote', (req, res) => {
  const { questionId, candidateId, userIp } = req.body;
  if (!questionId || !candidateId) {
    return res.status(400).json({ error: 'Missing questionId or candidateId' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ip = userIp || (Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(',')[0].trim());
  const ipKey = `${questionId}_${ip}`;

  const votedIps = readVotedIps();
  if (votedIps[ipKey]) {
    return res.status(403).json({ error: 'ALREADY_VOTED', message: 'A vote has already been submitted from this device/network.' });
  }

  const data = readPollData();
  let updated = false;

  if (data.questions && Array.isArray(data.questions)) {
    for (const q of data.questions) {
      if (q.id === questionId) {
        for (const c of q.candidates) {
          if (c.id === candidateId) {
            c.votes = (c.votes || 0) + 1;
            updated = true;
            break;
          }
        }
      }
    }
  } else if (data.candidates && Array.isArray(data.candidates)) {
    for (const c of data.candidates) {
      if (c.id === candidateId) {
        c.votes = (c.votes || 0) + 1;
        updated = true;
        break;
      }
    }
  }

  if (updated) {
    recordVotedIp(ipKey);
    writePollData(data);
    res.json({ success: true, data });
  } else {
    res.status(404).json({ error: 'Candidate or question not found' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Primary server running on http://0.0.0.0:${PORT}`);
  });

  // If process.env.PORT is specified and not 3000, also bind to 3000 as fallback for Railway target port mapping
  if (process.env.PORT && Number(process.env.PORT) !== 3000) {
    try {
      const fallbackApp = express();
      fallbackApp.use((req, res) => app(req, res));
      fallbackApp.listen(3000, '0.0.0.0', () => {
        console.log(`Fallback listener active on http://0.0.0.0:3000`);
      });
    } catch (err) {
      console.log('Port 3000 fallback listen notice:', err);
    }
  }
}

startServer();
