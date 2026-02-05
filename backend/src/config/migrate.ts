import { query } from './database';
import bcrypt from 'bcrypt';

export const runMigrations = async () => {
    try {
        console.log('Running database migrations...');

        // Create users table
        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create user_profile table
        await query(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        studying_topics TEXT[],
        goals TEXT,
        focus_areas TEXT[],
        daily_hours_target DECIMAL(4,2),
        onboarding_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create tasks table
        await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        planned_hours DECIMAL(5,2) NOT NULL,
        actual_hours DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        task_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create streaks table
        await query(`
      CREATE TABLE IF NOT EXISTS streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        streak_date DATE NOT NULL,
        hours_completed DECIMAL(5,2) NOT NULL,
        tasks_completed INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, streak_date)
      )
    `);

        // Create default user if doesn't exist
        const defaultPassword = process.env.DEFAULT_PASSWORD || 'Kshitiz@@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await query(`
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
    `, ['default_user', hashedPassword]);

        console.log('Migrations completed successfully!');
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
};
