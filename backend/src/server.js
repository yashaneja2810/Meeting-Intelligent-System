import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/team.js';
import meetingRoutes from './routes/meetings.js';
import taskRoutes from './routes/tasks.js';
import auditRoutes from './routes/audit.js';
import inviteRoutes from './routes/invites.js';
import myTasksRoutes from './routes/myTasks.js';
import { checkDeadlines } from './services/monitoring.js';
import { startKeepAlive } from './services/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/my-tasks', myTasksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Schedule monitoring job (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('Running deadline monitoring...');
  try {
    await checkDeadlines();
  } catch (error) {
    console.error('Monitoring job error:', error);
  }
});

// Start AI service keep-alive pings
startKeepAlive();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Service URL: ${process.env.AI_SERVICE_URL}`);
});
