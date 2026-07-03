import express from 'express';
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

// Error Handler Middleware
app.use(errorMiddleware);

export default app;
