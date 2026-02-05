import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, analyticsAPI, aiAPI } from '../services/api';
import type { Task, DailyAnalytics, StreakData } from '../types';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [analytics, setAnalytics] = useState<DailyAnalytics | null>(null);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [tasksRes, analyticsRes, streakRes] = await Promise.all([
                tasksAPI.getTasks(today),
                analyticsAPI.getDaily(today),
                analyticsAPI.getStreak()
            ]);

            setTasks(tasksRes.data);
            setAnalytics(analyticsRes.data);
            setStreak(streakRes.data);

            // Load AI suggestion if API key is available
            const apiKey = localStorage.getItem('gemini_api_key');
            if (apiKey) {
                try {
                    const suggestionRes = await aiAPI.dailySuggestion(apiKey);
                    setAiSuggestion(suggestionRes.data.suggestion);
                } catch (error) {
                    console.error('Failed to load AI suggestion:', error);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>📊 Dashboard</h1>
                <p className="date-display">{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
            </header>

            <div className="dashboard-grid">
                {/* Streak Card */}
                <div className="card streak-card">
                    <div className="card-header">
                        <h3>🔥 Current Streak</h3>
                    </div>
                    <div className="streak-content">
                        <div className="streak-number">{streak?.currentStreak || 0}</div>
                        <div className="streak-label">days</div>
                        <div className="longest-streak">Longest: {streak?.longestStreak || 0} days</div>
                    </div>
                </div>

                {/* Today's Progress */}
                <div className="card progress-card">
                    <div className="card-header">
                        <h3>📈 Today's Progress</h3>
                    </div>
                    <div className="progress-content">
                        <div className="circular-progress">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    strokeDasharray={`${(analytics?.completionPercentage || 0) * 2.83} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="progress-text">{analytics?.completionPercentage || 0}%</div>
                        </div>
                        <div className="progress-stats">
                            <div className="stat">
                                <span className="stat-value">{analytics?.totalActualHours || 0}h</span>
                                <span className="stat-label">Actual</span>
                            </div>
                            <div className="stat-divider">/</div>
                            <div className="stat">
                                <span className="stat-value">{analytics?.totalPlannedHours || 0}h</span>
                                <span className="stat-label">Planned</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Summary */}
                <div className="card tasks-summary-card">
                    <div className="card-header">
                        <h3>✅ Tasks Summary</h3>
                        <Link to="/tasks" className="view-all-link">View All</Link>
                    </div>
                    <div className="tasks-summary">
                        <div className="summary-item completed">
                            <div className="summary-count">{analytics?.completedTasks || 0}</div>
                            <div className="summary-label">Completed</div>
                        </div>
                        <div className="summary-item partial">
                            <div className="summary-count">{analytics?.partialTasks || 0}</div>
                            <div className="summary-label">Partial</div>
                        </div>
                        <div className="summary-item skipped">
                            <div className="summary-count">{analytics?.skippedTasks || 0}</div>
                            <div className="summary-label">Skipped</div>
                        </div>
                    </div>
                </div>

                {/* AI Suggestion */}
                {aiSuggestion && (
                    <div className="card ai-suggestion-card">
                        <div className="card-header">
                            <h3>🤖 AI Suggestion</h3>
                        </div>
                        <div className="ai-content">
                            <p>{aiSuggestion}</p>
                        </div>
                    </div>
                )}

                {/* Today's Tasks */}
                <div className="card today-tasks-card">
                    <div className="card-header">
                        <h3>📝 Today's Tasks</h3>
                        <Link to="/tasks" className="add-task-link">+ Add Task</Link>
                    </div>
                    <div className="tasks-list">
                        {tasks.length === 0 ? (
                            <div className="empty-state">
                                <p>No tasks planned for today</p>
                                <Link to="/tasks" className="btn-primary-small">Add Your First Task</Link>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <div key={task.id} className={`task-item ${task.status}`}>
                                    <div className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-meta">
                                            <span className="task-category">{task.category}</span>
                                            <span className="task-hours">{task.planned_hours}h planned</span>
                                        </div>
                                    </div>
                                    <div className={`task-status-badge ${task.status}`}>
                                        {task.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
