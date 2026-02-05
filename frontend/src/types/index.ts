export interface Task {
    id: number;
    user_id: number;
    title: string;
    category: string;
    planned_hours: number;
    actual_hours: number;
    status: 'pending' | 'completed' | 'partial' | 'skipped';
    task_date: string;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id?: number;
    user_id?: number;
    studying_topics: string[];
    goals: string;
    focus_areas: string[];
    daily_hours_target: number;
    onboarding_completed: boolean;
}

export interface DailyAnalytics {
    date: string;
    totalTasks: number;
    totalPlannedHours: number;
    totalActualHours: number;
    completedTasks: number;
    partialTasks: number;
    skippedTasks: number;
    completionPercentage: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    streakHistory: Array<{
        streak_date: string;
        hours_completed: number;
    }>;
}

export interface AuthResponse {
    token: string;
    userId: number;
    username: string;
}
