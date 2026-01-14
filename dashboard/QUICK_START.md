# Quick Start Guide - Expense Dashboard

## Prerequisites

1. **Python 3.7+** installed
2. **Node.js 16+** and **npm** installed (download from https://nodejs.org/)
3. **.env file** in the project root with your credentials

## Step-by-Step Setup

### Step 1: Install Python Dependencies

Open terminal/command prompt in the project root (`expense-tracker` folder):

```bash
pip install -r requirements.txt
```

Or if you're using a virtual environment:

```bash
# Create virtual environment (optional but recommended)
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Then install dependencies
pip install -r requirements.txt
```

### Step 2: Verify .env File

Make sure you have a `.env` file in the project root with:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
EXPENSE_TABLE=expense
GEMINI_MODEL_NAME=your_gemini_model
TELEGRAM_TOKEN=your_telegram_token
```

### Step 3: Install React Dependencies

Navigate to the React app directory:

```bash
cd dashboard/react-dashboard
```

Install Node.js dependencies:

```bash
npm install
```

**Note:** This may take a few minutes the first time. The installation includes Material-UI DataGrid for advanced table features.

### Step 4: Build the React App

While still in `dashboard/react-dashboard` directory:

```bash
npm run build
```

This creates a `build` folder with the production-ready React app.

### Step 5: Run the Flask Server

Open a **new terminal/command prompt** and navigate to the dashboard folder:

```bash
cd dashboard
python app.py
```

You should see output like:
```
 * Running on http://127.0.0.1:5000
```

### Step 6: Access the Dashboard

Open your browser and go to:

```
http://localhost:5000?user_id=YOUR_TELEGRAM_USER_ID
```

Replace `YOUR_TELEGRAM_USER_ID` with your actual Telegram user ID (you can get this from your bot).

## Development Mode (Optional)

If you want to develop with hot-reload (React runs on port 3000):

1. **Terminal 1** - Run Flask API:
```bash
cd dashboard
python app.py
```

2. **Terminal 2** - Run React dev server:
```bash
cd dashboard/react-dashboard
npm start
```

Then access: `http://localhost:3000?user_id=YOUR_USER_ID`

**Note:** In dev mode, you'll need to update the API URL in `Dashboard.js` to point to `http://localhost:5000` or configure a proxy.

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Module not found" errors
- Make sure you ran `npm install` in the `dashboard/react-dashboard` directory
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Flask can't find React build
- Make sure you ran `npm run build` first
- Check that `dashboard/react-dashboard/build` folder exists
- Verify Flask is looking in the right directory (check `app.py` line with `static_folder`)

### CORS errors
- Make sure `flask-cors` is installed: `pip install flask-cors`
- Check that Flask server is running

### "No data available"
- Check your `.env` file has correct Supabase credentials
- Verify the `EXPENSE_TABLE` name matches your Supabase table
- Check that you're using the correct `user_id` in the URL

## File Structure

```
expense-tracker/
├── .env                    # Your environment variables
├── requirements.txt        # Python dependencies
├── bot.py                  # Telegram bot
└── dashboard/
    ├── app.py              # Flask API server
    ├── react-dashboard/    # React app
    │   ├── package.json
    │   ├── src/           # React source code
    │   └── build/         # Built React app (created after npm run build)
    └── templates/         # Old HTML templates (not used anymore)
```

## Next Steps

Once running:
- ✅ View your expenses in the beautiful dashboard
- ✅ Edit expenses by clicking the edit icon
- ✅ Delete expenses with the delete button
- ✅ View insights and charts
- ✅ Analyze your spending patterns

Enjoy your expense tracker! 🎉
