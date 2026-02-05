import { useState, useEffect } from 'react';
import { analyticsAPI, aiAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Analytics.css';

export default function Analytics() {
    const [weeklyData, setWeeklyData] = useState<any>(null);
    const [monthlyData, setMonthlyData] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            if (timeRange === 'week') {
                const response = await analyticsAPI.getWeekly();
                setWeeklyData(response.data);
            } else {
                const currentMonth = new Date().toISOString().substring(0, 7);
                const response = await analyticsAPI.getMonthly(currentMonth);
                setMonthlyData(response.data);
            }

            // Load AI insight
            const apiKey = localStorage.getItem('gemini_api_key');
            if (apiKey) {
                try {
                    const insightRes = await aiAPI.weeklyInsight(apiKey);
                    setAiInsight(insightRes.data.insight);
                } catch (error) {
                    console.error('Failed to load AI insight:', error);
                }
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading analytics...</div>;
    }

    const data = timeRange === 'week' ? weeklyData : monthlyData;

    // Process data for charts
    const dailyChartData = data?.dailyBreakdown?.map((item: any) => ({
        date: new Date(item.task_date || item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: parseFloat(item.hours || 0)
    })) || [];

    const categoryChartData = data?.categoryStats?.map((item: any) => ({
        category: item.category,
        hours: parseFloat(item.total_hours),
        tasks: parseInt(item.task_count)
    })) || [];

    return (
        <div className="analytics">
            <header className="analytics-header">
                <h1>📈 Analytics</h1>
                <div className="time-range-selector">
                    <button
                        className={timeRange === 'week' ? 'active' : ''}
                        onClick={() => setTimeRange('week')}
                    >
                        Weekly
                    </button>
                    <button
                        className={timeRange === 'month' ? 'active' : ''}
                        onClick={() => setTimeRange('month')}
                    >
                        Monthly
                    </button>
                </div>
            </header>

            {aiInsight && (
                <div className="ai-insight-card">
                    <h3>🤖 AI Insight</h3>
                    <p>{aiInsight}</p>
                </div>
            )}

            <div className="charts-container">
                {/* Learning Curve Chart */}
                <div className="chart-card">
                    <h3>📊 Learning Curve - Hours Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#718096" />
                            <YAxis stroke="#718096" />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="hours"
                                stroke="#667eea"
                                strokeWidth={3}
                                dot={{ fill: '#667eea', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="chart-card">
                    <h3>📂 Hours by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="category" stroke="#718096" />
                            <YAxis stroke="#718096" />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#667eea" />
                                    <stop offset="100%" stopColor="#764ba2" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Statistics Table */}
            <div className="stats-table-card">
                <h3>📋 Detailed Statistics</h3>
                <table className="stats-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Hours</th>
                            <th>Task Count</th>
                            <th>Avg Hours/Task</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryChartData.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="category-cell">
                                    <span className="category-badge">{item.category}</span>
                                </td>
                                <td>{item.hours.toFixed(1)}h</td>
                                <td>{item.tasks}</td>
                                <td>{(item.hours / item.tasks).toFixed(1)}h</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
