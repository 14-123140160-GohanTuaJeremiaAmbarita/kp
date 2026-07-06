import express from 'express';
import path from 'path';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';

// Import Routes
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import assetRoutes from './routes/asset.routes';
import ticketRoutes from './routes/ticket.routes';
import workorderRoutes from './routes/workorder.routes';
import dashboardRoutes from './routes/dashboard.routes';
import exportRoutes from './routes/export.routes';
import chatbotRoutes from './routes/chatbot.routes';
import historyRoutes from './routes/history.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Register Modular Sub-Routes with '/api' prefixes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/workorders', workorderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);

// Register Conversation, AI Memory, and Chatbot pipeline routes under '/api'
app.use('/api', chatbotRoutes); // Handles /api/chat, /api/feedback
app.use('/api', historyRoutes); // Handles /api/conversations, /api/memories

// Serve static assets from frontend/dist in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback to index.html for React Router (Single Page Application)
app.get('/*splat', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Please run "npm run build" in the frontend directory first.');
    }
  });
});

// Error Handler Middleware
app.use(errorMiddleware);

export default app;
