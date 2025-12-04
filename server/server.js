/**
 * Minimal Node.js backend to receive data from iOS Shortcuts
 * Run with: node server.js
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for localhost access from the web app
app.use(cors());
app.use(express.json());

// In-memory store for tasks (replace with DB for production)
let taskQueue = [];

/**
 * Endpoint for iOS Shortcuts
 * Method: POST
 * Body: { "text": "Kraków Rynek, Fix Dishwasher" }
 */
app.post('/receive-shortcut', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text field required' });
  }

  const newTask = {
    id: Date.now().toString(),
    rawText: text,
    timestamp: Date.now()
  };

  taskQueue.push(newTask);
  console.log('Received new task:', newTask);

  res.status(200).json({ success: true, taskId: newTask.id });
});

/**
 * Endpoint for the Frontend App to poll
 */
app.get('/tasks/:userId', (req, res) => {
  // In real app, filter by userId
  res.json(taskQueue);
});

/**
 * Mark task as done
 */
app.post('/tasks/:id/mark-done', (req, res) => {
  const { id } = req.params;
  taskQueue = taskQueue.filter(t => t.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`To use with shortcuts, expose via ngrok: ngrok http ${PORT}`);
});