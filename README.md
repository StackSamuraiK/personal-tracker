# Personal Productivity & Learning Tracker

A full-stack AI-powered personal productivity and learning tracker that helps you plan tasks, track actual effort, maintain streaks, and receive AI-based study suggestions.

## 🚀 Features

- **AI Onboarding**: Interactive questionnaire powered by Google Gemini AI
- **Task Management**: Create, update, and track daily tasks with categories
- **Progress Tracking**: Compare planned vs actual hours with visual analytics
- **Streak Counter**: Track daily study streaks and maintain consistency
- **AI Suggestions**: Daily study recommendations and weekly performance insights
- **Analytics Dashboard**: Beautiful charts and statistics to visualize your learning journey

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Neon.tech)
- JWT Authentication
- Google Gemini AI API

### Frontend
- React + TypeScript
- React Router
- Recharts for data visualization
- Vanilla CSS with modern gradients and animations

## 📋 Prerequisites

- Node.js (v16 or higher)
- Neon PostgreSQL account (https://neon.tech)
- Google Gemini API key (https://aistudio.google.com/app/apikey)

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create or edit `backend/.env` with your Neon PostgreSQL connection string:

```env
NODE_ENV=development
PORT=3001

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_neon_database_connection_string_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Default User Password
DEFAULT_PASSWORD=Kshitiz@@123
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will:
- Run database migrations automatically
- Create the default user with password `Kshitiz@@123`
- Start on http://localhost:3001

### 4. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

## 🎯 Usage

### First Time Setup

1. **Login**: Use password `Kshitiz@@123`
2. **Onboarding**: 
   - Enter your Gemini API key
   - Answer questions about your study goals
   - Select your focus areas
   - Set your daily study target
3. **Dashboard**: View your streak, today's progress, and AI suggestions

### Daily Workflow

1. **Plan Tasks** (Morning):
   - Go to Task Manager
   - Add tasks for the day with expected hours
   - Categorize each task (DSA, Development, etc.)

2. **Track Progress** (Throughout the day):
   - Check Dashboard for AI suggestions
   - View your current streak

3. **Update Tasks** (End of day):
   - Go to Task Manager
   - Update actual hours spent
   - Mark tasks as completed, partial, or skipped

4. **Review Analytics** (Weekly):
   - Check learning curve over time
   - View category breakdown
   - Get AI insights on your performance

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with password

### Tasks
- `GET /api/tasks` - Get tasks for a date
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Analytics
- `GET /api/analytics/daily` - Daily statistics
- `GET /api/analytics/weekly` - Weekly breakdown
- `GET /api/analytics/monthly` - Monthly insights
- `GET /api/analytics/streak` - Streak information

### AI Integration
- `POST /api/ai/daily-suggestion` - Get daily AI suggestion
- `POST /api/ai/weekly-insight` - Get weekly AI insight
- `POST /api/ai/chat` - General AI chat

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🎨 Features Breakdown

### Dashboard
- Current streak counter with longest streak
- Circular progress indicator for daily completion
- Task summary (completed, partial, skipped)
- AI-powered daily suggestions
- Today's task list

### Task Manager
- Date picker for any date
- Add/Edit task form with categories
- Visual task cards with status badges
- Progress bars for task completion
- Quick edit and delete actions

### Analytics
- Line chart showing learning curve over time
- Bar chart for category breakdown
- Detailed statistics table
- Weekly/Monthly view toggle
- AI-generated performance insights

## 🔒 Security Notes

- Change the `JWT_SECRET` in production
- Consider changing the default password
- API keys are stored in frontend localStorage
- All API routes (except login) require JWT authentication

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with Google Gemini AI
- Database hosted on Neon.tech
- Charts powered by Recharts
