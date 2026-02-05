import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Get daily analytics
router.get('/daily', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await query(
            `SELECT 
        COUNT(*) as total_tasks,
        SUM(planned_hours) as total_planned_hours,
        SUM(actual_hours) as total_actual_hours,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_tasks,
        COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped_tasks
       FROM tasks 
       WHERE user_id = $1 AND task_date = $2`,
            [req.userId, targetDate]
        );

        const stats = result.rows[0];
        const completionPercentage = stats.total_planned_hours > 0
            ? (stats.total_actual_hours / stats.total_planned_hours) * 100
            : 0;

        res.json({
            date: targetDate,
            totalTasks: parseInt(stats.total_tasks),
            totalPlannedHours: parseFloat(stats.total_planned_hours) || 0,
            totalActualHours: parseFloat(stats.total_actual_hours) || 0,
            completedTasks: parseInt(stats.completed_tasks),
            partialTasks: parseInt(stats.partial_tasks),
            skippedTasks: parseInt(stats.skipped_tasks),
            completionPercentage: Math.round(completionPercentage)
        });
    } catch (error) {
        console.error('Daily analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get weekly analytics
router.get('/weekly', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate } = req.query;
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const result = await query(
            `SELECT 
        task_date,
        category,
        SUM(actual_hours) as hours
       FROM tasks 
       WHERE user_id = $1 AND task_date >= $2
       GROUP BY task_date, category
       ORDER BY task_date DESC`,
            [req.userId, start]
        );

        const categoryStats = await query(
            `SELECT 
        category,
        SUM(actual_hours) as total_hours,
        COUNT(*) as task_count
       FROM tasks 
       WHERE user_id = $1 AND task_date >= $2
       GROUP BY category
       ORDER BY total_hours DESC`,
            [req.userId, start]
        );

        res.json({
            dailyBreakdown: result.rows,
            categoryStats: categoryStats.rows
        });
    } catch (error) {
        console.error('Weekly analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get monthly analytics
router.get('/monthly', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { month } = req.query;
        const targetMonth = month || new Date().toISOString().substring(0, 7);

        const result = await query(
            `SELECT 
        DATE_TRUNC('day', task_date) as date,
        SUM(actual_hours) as hours
       FROM tasks 
       WHERE user_id = $1 AND TO_CHAR(task_date, 'YYYY-MM') = $2
       GROUP BY DATE_TRUNC('day', task_date)
       ORDER BY date`,
            [req.userId, targetMonth]
        );

        const categoryStats = await query(
            `SELECT 
        category,
        SUM(actual_hours) as total_hours,
        COUNT(*) as task_count
       FROM tasks 
       WHERE user_id = $1 AND TO_CHAR(task_date, 'YYYY-MM') = $2
       GROUP BY category
       ORDER BY total_hours DESC`,
            [req.userId, targetMonth]
        );

        res.json({
            month: targetMonth,
            dailyBreakdown: result.rows,
            categoryStats: categoryStats.rows
        });
    } catch (error) {
        console.error('Monthly analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get streak information
router.get('/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        // Calculate current streak
        const streakResult = await query(
            `SELECT streak_date, hours_completed 
       FROM streaks 
       WHERE user_id = $1 
       ORDER BY streak_date DESC 
       LIMIT 100`,
            [req.userId]
        );

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (streakResult.rows.length > 0) {
            const rows = streakResult.rows;

            // Calculate current streak
            for (let i = 0; i < rows.length; i++) {
                const streakDate = new Date(rows[i].streak_date);
                streakDate.setHours(0, 0, 0, 0);

                const expectedDate = new Date(today);
                expectedDate.setDate(expectedDate.getDate() - i);
                expectedDate.setHours(0, 0, 0, 0);

                if (streakDate.getTime() === expectedDate.getTime()) {
                    currentStreak++;
                } else {
                    break;
                }
            }

            // Calculate longest streak
            tempStreak = 1;
            for (let i = 1; i < rows.length; i++) {
                const currentDate = new Date(rows[i].streak_date);
                const prevDate = new Date(rows[i - 1].streak_date);

                const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
        }

        res.json({
            currentStreak,
            longestStreak,
            streakHistory: streakResult.rows
        });
    } catch (error) {
        console.error('Streak analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update streak for a date (called after completing tasks)
router.post('/streak/update', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { date, hours, taskCount } = req.body;

        await query(
            `INSERT INTO streaks (user_id, streak_date, hours_completed, tasks_completed) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, streak_date) 
       DO UPDATE SET hours_completed = $3, tasks_completed = $4`,
            [req.userId, date, hours, taskCount]
        );

        res.json({ message: 'Streak updated successfully' });
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
