import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Get tasks for a specific date (defaults to today)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query;
        const taskDate = date || new Date().toISOString().split('T')[0];

        const result = await query(
            'SELECT * FROM tasks WHERE user_id = $1 AND task_date = $2 ORDER BY created_at DESC',
            [req.userId, taskDate]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new task
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { title, category, planned_hours, task_date } = req.body;

        if (!title || !category || !planned_hours || !task_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await query(
            `INSERT INTO tasks (user_id, title, category, planned_hours, task_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.userId, title, category, planned_hours, task_date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, category, planned_hours, actual_hours, status, task_date } = req.body;

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (category !== undefined) {
            updates.push(`category = $${paramCount++}`);
            values.push(category);
        }
        if (planned_hours !== undefined) {
            updates.push(`planned_hours = $${paramCount++}`);
            values.push(planned_hours);
        }
        if (actual_hours !== undefined) {
            updates.push(`actual_hours = $${paramCount++}`);
            values.push(actual_hours);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (task_date !== undefined) {
            updates.push(`task_date = $${paramCount++}`);
            values.push(task_date);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.userId, id);

        const result = await query(
            `UPDATE tasks SET ${updates.join(', ')} 
       WHERE user_id = $${paramCount++} AND id = $${paramCount++} 
       RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM tasks WHERE user_id = $1 AND id = $2 RETURNING id',
            [req.userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
