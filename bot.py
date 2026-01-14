from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from dotenv import load_dotenv
from google import genai
from supabase import create_client
from datetime import datetime
import os
import json
import re

load_dotenv()

GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EXPENSE_TABLE = os.getenv("EXPENSE_TABLE")
DASHBOARD_HOST = "http://139.59.63.158:5000/"

EXTRACTION_PROMPT = """
You are an assistant that extracts structured expense information from a natural language sentence. 

Task:
- Extract exactly the following fields: category, amount, type, description.
- Return **ONLY a JSON object** with these keys, nothing else.
- category: type of expense (food, groceries, cab fare, flight, lend, etc.)
- amount: a float representing the user's share of the expense. If there is a mathematical expression like 750/4, evaluate it.
- type: either "debit" or "credit".
- description: place or other details about the expense.

Rules:
1. Always return valid JSON.
2. Never add extra fields.
3. Round the amount to two decimal places.
4. If any field is missing or unclear, return null for that field.

Examples:

Input: "add 750/4 in category food, type is debit, description is north adda"
Output: {"category": "food", "amount": 187.5, "type": "debit", "description": "north adda"}

Input: "spent 1200 on groceries, debit, from local market"
Output: {"category": "groceries", "amount": 1200.0, "type": "debit", "description": "local market"}

Input: "got 500 from friend, credit, repayment"
Output: {"category": "lend", "amount": 500.0, "type": "credit", "description": "repayment"}

Now extract the fields for this sentence:

"{user_input}"
"""

gemini_client = genai.Client()
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_expense(user_text: str) -> dict:
    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=EXTRACTION_PROMPT + "\n\nUser message: " + user_text
    )

    raw = response.text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    return json.loads(raw)

async def add_expense(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = None
    user_msg = None
    expense_data = None
    try:
        user_id = update.effective_user.id
    except Exception as e:
        print(f"An error occurred while fetching user_id: {e}")
        msg = (
            f"can't fetch user's id"
        )
        await update.message.reply_text(msg)
        return
    
    try:
        user_msg = update.message.text
    except Exception as e:
        print(f"An error occurred while fetching user expense msg: {e}")
        msg = (
            f"can't fetch user expense message"
        )
        await update.message.reply_text(msg)
        return
    
    try:
        expense_data = extract_expense(user_msg)
        exception_msgs = ""
        
        if 'category' not in expense_data or expense_data['category'] is None or (not isinstance(expense_data['category'], str)):
            exception_msgs = f"{exception_msgs}\nnot able to fetch 'category' from message."
        if 'amount' not in expense_data or expense_data['amount'] is None or (not isinstance(expense_data['amount'], (int, float))):
            exception_msgs = f"{exception_msgs}\nnot able to fetch 'amount' from message."
        if 'type' not in expense_data or expense_data['type'] is None or (not isinstance(expense_data['type'], str)) or (expense_data['type'] != "debit" and expense_data['type'] != 'credit'):
            exception_msgs = f"{exception_msgs}\nnot able to fetch 'type' from message."
        
        if len(exception_msgs) != 0:
            raise Exception(exception_msgs)
            
    except Exception as e:
        print(f"An error occurred while parsing user expense msg: {e}")
        msg = (
            f"can't parse user expense message"
        )
        await update.message.reply_text(msg)
        return

    expense_data['created_at'] = datetime.now().isoformat()
    expense_data['user_id'] = user_id
    
    try:
        supabase_client.table(EXPENSE_TABLE).insert(expense_data).execute()
    except Exception as e:
        print(f"An error occurred while inserting expense data to db: {e}")
        msg = (
            f"can't insert expense data to database"
        )
        await update.message.reply_text(msg)
        return
    
    dt = datetime.fromisoformat(expense_data['created_at'])
    msg = (
        f"Expense added:\n"
        f"Amount: {expense_data['amount']}\n"
        f"Created at: {dt.strftime('%b %d, %Y %I:%M %p')}\n"
        f"Category: {expense_data['category']}\n"
        f"Type: {expense_data['type']}\n"
        f"Description: {expense_data['description']}"
    )
    await update.message.reply_text(msg)
    
async def view_dashboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = None
    try:
        user_id = update.effective_user.id
    except Exception as e:
        print(f"An error occurred while fetching user_id: {e}")
        msg = (
            f"can't fetch user's id"
        )
        await update.message.reply_text(msg)
        return
    
    user_dashboard_url = f"{DASHBOARD_HOST}?user_id={user_id}"
    
    await update.message.reply_text(
    f"[View your dashboard]({user_dashboard_url})",
    parse_mode='MarkdownV2',
    disable_web_page_preview=True
)
    
    

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Welcome! use /add to add expense.")
    
async def unknown(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = (
        "Available commands:\n"
        "/start - Welcome message\n"
        "/add - Add expense\n"
        "/view - View your expense dashboard"
    )
    await update.message.reply_text(msg)

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("add", add_expense))
    app.add_handler(CommandHandler("view", view_dashboard))
    app.add_handler(MessageHandler(filters.COMMAND, unknown))

    print("Bot started...")
    app.run_polling()

if __name__ == "__main__":
    main()
