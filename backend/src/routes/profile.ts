import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { query } from '../config/database';

const router = Router();

// Get user profile
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            'SELECT * FROM user_profile WHERE user_id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.json({ onboarding_completed: false });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { studying_topics, goals, focus_areas, daily_hours_target, onboarding_completed } = req.body;

        const result = await query(
            `INSERT INTO user_profile (user_id, studying_topics, goals, focus_areas, daily_hours_target, onboarding_completed)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         studying_topics = COALESCE($2, user_profile.studying_topics),
         goals = COALESCE($3, user_profile.goals),
         focus_areas = COALESCE($4, user_profile.focus_areas),
         daily_hours_target = COALESCE($5, user_profile.daily_hours_target),
         onboarding_completed = COALESCE($6, user_profile.onboarding_completed),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [req.userId, studying_topics, goals, focus_areas, daily_hours_target, onboarding_completed]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
