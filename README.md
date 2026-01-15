# AI-Powered Expense Tracker

A comprehensive expense tracking solution featuring a **Telegram Bot** for seamless natural language expense entry and a **React + Flask Dashboard** for deep insights and visualization.

## 🚀 Features

### 🤖 Telegram Bot
The bot serves as the primary interface for adding expenses on the go.
- **Natural Language Parsing**: Powered by **Google Gemini AI**, simply type "Spent 500 on lunch with friends" and it automatically extracts:
    - `Amount`: Numerical value (e.g., 500)
    - `Category`: Categorizes automatically (e.g., "Food")
    - `Type`: Credit or Debit
    - `Description`: Contextual details
- **Instant Feedback**: Confirms the expense entry immediately.
- **Commands**:
    - `/start`: Initialize the bot.
    - `/add <text>`: Add an expense (or just type natural text).
    - `/view`: Get a direct link to your personal dashboard.

### 📊 Web Dashboard
A modern, responsive dashboard to visualize your financial health.
- **Tech Stack**: React (Frontend), Flask (Backend), Supabase (Database).
- **Key Insights**:
    - **Net Balance**: Total Credit vs. Debit.
    - **Spending Velocity**: Tracks if your spending is increasing or decreasing compared to previous months.
    - **Category Breakdown**: Pie charts showing top spending categories.
    - **Monthly Trends**: Bar charts for month-over-month comparison.
    - **Day-of-Week Patterns**: Identify which days you spend the most.
- **Management**: Edit or delete expense records directly from the UI.

## 🛠️ Architecture

The project consists of two main components:

1.  **Bot Service (`bot.py`)**: A Python polling bot that interacts with the Telegram API and uses Google Gemini for NLP.
2.  **Dashboard Service (`dashboard/`)**:
    - **Backend (`app.py`)**: A Flask API that serves the React app and aggregates data from Supabase.
    - **Frontend (`dashboard/react-dashboard/`)**: A React application built with TailwindCSS and Recharts.

Both services share a **Supabase** PostgreSQL database.

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js & npm
- A **Supabase** project (with an `expense` table).
- A **Telegram Bot Token** (from @BotFather).
- A **Google Gemini API Key**.

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
GEMINI_MODEL_NAME=gemini-2.0-flash-exp
TELEGRAM_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
EXPENSE_TABLE=expense
```

### 2. Run the Telegram Bot
```bash
# Install dependencies
pip install -r requirements.txt

# Start the bot
python bot.py
```

### 3. Run the Dashboard
The dashboard has its own backend and frontend.

#### Backend (Flask)
```bash
cd dashboard
pip install -r ../requirements.txt  # Ensure flask, flask-cors are installed

# Start Flask server
python app.py
```

#### Frontend (React)
For development:
```bash
cd dashboard/react-dashboard
npm install
npm start
```

For production, the Flask app acts as the web server for the React build.
```bash
cd dashboard/react-dashboard
npm run build
```

## 🔗 API Documentation
The Flask backend provides the following endpoints:

- `GET /api/data?user_id=<id>`: Fetch all expenses and calculated insights.
- `PUT /api/expense/<id>`: Update an expense.
- `DELETE /api/expense/<id>`: Remove an expense.

## 📂 Project Structure

```
├── bot.py                  # Telegram Bot entry point
├── requirements.txt        # Python dependencies
├── dashboard/
│   ├── app.py              # Flask Backend & API
│   └── react-dashboard/    # React Frontend
│       ├── src/
│       ├── public/
│       └── package.json
└── .env                    # Configuration secrets
```
