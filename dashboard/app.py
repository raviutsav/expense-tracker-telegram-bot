from flask import Flask, request, render_template
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime, timedelta

app = Flask(__name__)
IST_OFFSET = timedelta(hours=5, minutes=30)
load_dotenv()

# ----------------------------
# Supabase Client Setup
# ----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/")
def dashboard():
    user_id = request.args.get("user_id")
    
    query = supabase.table("expense").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    data = query.execute().data

    total_amount = sum(row.get("amount", 0) for row in data)
    total_records = len(data)

    category_totals = defaultdict(float)
    type_totals = defaultdict(float)
    monthly_totals = defaultdict(float)
    
    # Inside your dashboard() route, after fetching data
    credit_total = sum(row["amount"] for row in data if row.get("type") == "credit")
    debit_total = sum(row["amount"] for row in data if row.get("type") == "debit")


    top_expenses = data

    for row in data:
        cat = row.get("category") or "Uncategorized"
        typ = row.get("type") or "Other"
        dt_utc = datetime.fromisoformat(row["created_at"])
        month = (dt_utc + IST_OFFSET).strftime("%b %Y")
        
        category_totals[cat] += row.get("amount", 0)
        type_totals[typ] += row.get("amount", 0)
        monthly_totals[month] += row.get("amount", 0)

    # Convert top expenses to human-readable IST
    for row in top_expenses:
        dt_utc = datetime.fromisoformat(row["created_at"])
        dt_ist = dt_utc + IST_OFFSET
        row["created_at_readable"] = dt_ist.strftime("%b %d, %Y %I:%M %p")

    monthly_labels = sorted(monthly_totals.keys(), key=lambda d: datetime.strptime(d, "%b %Y"))
    monthly_values = [monthly_totals[m] for m in monthly_labels]

    return render_template(
        "dashboard.html",
        expenses=data,
        total_amount=total_amount,
        total_records=total_records,
        category_totals=dict(category_totals),
        type_totals=dict(type_totals),
        monthly_labels=monthly_labels,
        monthly_values=monthly_values,
        top_expenses=top_expenses,
        user_id=user_id or "",
        credit_total=credit_total,
        debit_total=debit_total
    )


# ----------------------------
# Run the app
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
