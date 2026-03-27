const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task storage (in production, use a database)
let tasks = [
  { id: uuidv4(), title: 'Learn Express', description: 'Study Express.js fundamentals', completed: false },
  { id: uuidv4(), title: 'Build API', description: 'Create REST API endpoints', completed: false }
];

// Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST a new task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update a task (mark as completed or update details)
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  
  res.json(task);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(index, 1);
  res.json(deletedTask[0]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Task Manager API running on http://localhost:${PORT}`);
});
