const router = require('express').Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks — get all tasks for logged-in user
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; // optional filter: ?status=pending
    let query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC';
    let params = [req.user.id];

    if (status) {
      query = 'SELECT * FROM tasks WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC';
      params = [req.user.id, status];
    }

    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// GET /api/tasks/:id — get a single task
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
});

// POST /api/tasks — create a task
router.post('/', async (req, res) => {
  const { title, description, status, due_date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be pending, in-progress, or completed.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title.trim(), description || null, status || 'pending', due_date || null]
    );

    res.status(201).json({ message: 'Task created.', task: result.rows[0] });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
  const { title, description, status, due_date } = req.body;

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be pending, in-progress, or completed.' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, due_date = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        title?.trim() || current.title,
        description !== undefined ? description : current.description,
        status || current.status,
        due_date !== undefined ? due_date : current.due_date,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ message: 'Task updated.', task: result.rows[0] });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router;
