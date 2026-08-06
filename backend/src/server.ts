import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow local frontend connections
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/v1', apiRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'SentinelAI Backend Gateway',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' ? 'Gemini 1.5 Flash Connected' : 'Deterministic Mode (Fallback Enabled)'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  SentinelAI Decision Intelligence Engine Running`);
  console.log(`🌐 Server Port: http://localhost:${PORT}`);
  console.log(`🤖 AI Layer Status: ${process.env.GEMINI_API_KEY ? 'Active' : 'Fallback Mode'}`);
  console.log(`=======================================================`);
});
