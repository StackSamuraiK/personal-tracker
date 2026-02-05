import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { query } from '../config/database';
import axios from 'axios';

const router = Router();

// Helper function to call Gemini API
const callGeminiAPI = async (apiKey: string, prompt: string): Promise<string> => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to get AI response');
    }
};

// Onboarding conversation
router.post('/onboarding', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { apiKey, userResponses } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'AI API key is required' });
        }

        const prompt = `You are a helpful productivity coach. Based on the following user responses about their study goals, provide a concise summary and recommendations.

User Responses:
${JSON.stringify(userResponses, null, 2)}

Please provide:
1. A brief summary of their goals
2. Recommended study focus areas
3. Suggested daily hours breakdown by topic

Format your response as JSON with keys: summary, focusAreas (array), suggestedSchedule (object).`;

        const aiResponse = await callGeminiAPI(apiKey, prompt);

        res.json({ aiResponse });
    } catch (error) {
        console.error('Onboarding AI error:', error);
        res.status(500).json({ error: 'Failed to process onboarding' });
    }
});

// Daily suggestion
router.post('/daily-suggestion', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'AI API key is required' });
        }

        // Get user profile
        const profileResult = await query(
            'SELECT * FROM user_profile WHERE user_id = $1',
            [req.userId]
        );

        // Get today's tasks
        const today = new Date().toISOString().split('T')[0];
        const tasksResult = await query(
            'SELECT * FROM tasks WHERE user_id = $1 AND task_date = $2',
            [req.userId, today]
        );

        // Get recent task history
        const historyResult = await query(
            `SELECT task_date, SUM(actual_hours) as hours, COUNT(*) as tasks
       FROM tasks 
       WHERE user_id = $1 AND task_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY task_date
       ORDER BY task_date DESC`,
            [req.userId]
        );

        // Get current streak
        const streakResult = await query(
            `SELECT COUNT(*) as streak_count 
       FROM streaks 
       WHERE user_id = $1 AND streak_date >= CURRENT_DATE - INTERVAL '30 days'`,
            [req.userId]
        );

        const profile = profileResult.rows[0] || {};
        const tasks = tasksResult.rows;
        const history = historyResult.rows;
        const streak = streakResult.rows[0]?.streak_count || 0;

        const prompt = `You are a productivity assistant helping a student stay on track with their learning goals.

User Profile:
- Focus Areas: ${profile.focus_areas?.join(', ') || 'Not set'}
- Goals: ${profile.goals || 'Not set'}
- Daily Target: ${profile.daily_hours_target || 'Not set'} hours

Today's Tasks: ${tasks.length > 0 ? JSON.stringify(tasks) : 'No tasks planned'}

Recent History (last 7 days): ${JSON.stringify(history)}

Current Streak: ${streak} days

Provide:
1. A motivational message (2-3 sentences)
2. What to prioritize today
3. One actionable tip for productivity

Keep it brief and encouraging!`;

        const aiResponse = await callGeminiAPI(apiKey, prompt);

        res.json({ suggestion: aiResponse });
    } catch (error) {
        console.error('Daily suggestion error:', error);
        res.status(500).json({ error: 'Failed to get daily suggestion' });
    }
});

// Weekly insight
router.post('/weekly-insight', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'AI API key is required' });
        }

        // Get weekly stats
        const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const statsResult = await query(
            `SELECT 
        category,
        SUM(planned_hours) as planned,
        SUM(actual_hours) as actual,
        COUNT(*) as task_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
       FROM tasks 
       WHERE user_id = $1 AND task_date >= $2
       GROUP BY category`,
            [req.userId, weekStart]
        );

        const prompt = `You are a productivity coach analyzing a student's weekly performance.

Weekly Statistics:
${JSON.stringify(statsResult.rows, null, 2)}

Provide a concise weekly insight including:
1. Overall performance assessment
2. Strongest area (most consistent)
3. Area needing improvement
4. One specific recommendation for next week

Keep it constructive and actionable!`;

        const aiResponse = await callGeminiAPI(apiKey, prompt);

        res.json({ insight: aiResponse });
    } catch (error) {
        console.error('Weekly insight error:', error);
        res.status(500).json({ error: 'Failed to get weekly insight' });
    }
});

// General chat endpoint
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { apiKey, message } = req.body;

        if (!apiKey || !message) {
            return res.status(400).json({ error: 'API key and message are required' });
        }

        const prompt = `You are a helpful productivity and study assistant. The user asks: "${message}"

Provide a concise, helpful response focused on productivity and learning.`;

        const aiResponse = await callGeminiAPI(apiKey, prompt);

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

export default router;
