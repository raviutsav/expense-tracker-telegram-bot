from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime, timedelta
import json

app = Flask(__name__, static_folder='react-dashboard/build', static_url_path='')
CORS(app)
IST_OFFSET = timedelta(hours=5, minutes=30)
load_dotenv()

# ----------------------------
# Supabase Client Setup
# ----------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
EXPENSE_TABLE = os.getenv("EXPENSE_TABLE", "expense")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def calculate_insights(data, user_id):
    """Calculate useful insights from expense data"""
    insights = {}
    
    if not data:
        return {
            "net_balance": 0,
            "daily_avg": 0,
            "weekly_avg": 0,
            "monthly_avg": 0,
            "top_category": None,
            "top_category_pct": 0,
            "mom_change": 0,
            "mom_change_pct": 0,
            "avg_transaction": 0,
            "savings_rate": 0,
            "day_of_week_pattern": {},
            "spending_velocity": "No data"
        }
    
    # Net balance (credit - debit)
    credit_total = sum(row["amount"] for row in data if row.get("type") == "credit")
    debit_total = sum(row["amount"] for row in data if row.get("type") == "debit")
    net_balance = credit_total - debit_total
    
    # Time-based calculations
    now = datetime.now()
    dates = [datetime.fromisoformat(row["created_at"]) for row in data]
    if dates:
        oldest_date = min(dates)
        newest_date = max(dates)
        days_diff = (now - oldest_date).days or 1
        
        # Daily, weekly, monthly averages
        daily_avg = debit_total / days_diff if days_diff > 0 else 0
        weekly_avg = daily_avg * 7
        monthly_avg = daily_avg * 30
    else:
        daily_avg = weekly_avg = monthly_avg = 0
    
    # Category analysis
    category_totals = defaultdict(float)
    for row in data:
        cat = row.get("category") or "Uncategorized"
        category_totals[cat] += row.get("amount", 0)
    
    if category_totals:
        top_category = max(category_totals.items(), key=lambda x: x[1])
        top_category_pct = (top_category[1] / debit_total * 100) if debit_total > 0 else 0
    else:
        top_category = (None, 0)
        top_category_pct = 0
    
    # Month-over-month comparison
    monthly_totals = defaultdict(float)
    for row in data:
        dt_utc = datetime.fromisoformat(row["created_at"])
        month = (dt_utc + IST_OFFSET).strftime("%b %Y")
        monthly_totals[month] += row.get("amount", 0)
    
    sorted_months = sorted(monthly_totals.keys(), key=lambda d: datetime.strptime(d, "%b %Y"))
    if len(sorted_months) >= 2:
        current_month = sorted_months[-1]
        prev_month = sorted_months[-2]
        current_total = monthly_totals[current_month]
        prev_total = monthly_totals[prev_month]
        mom_change = current_total - prev_total
        mom_change_pct = (mom_change / prev_total * 100) if prev_total > 0 else 0
    else:
        mom_change = 0
        mom_change_pct = 0
    
    # Average transaction size
    avg_transaction = debit_total / len(data) if data else 0
    
    # Savings rate (net positive balance as % of total credit)
    savings_rate = (net_balance / credit_total * 100) if credit_total > 0 else 0
    
    # Day of week pattern
    day_of_week_pattern = defaultdict(float)
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for row in data:
        dt_utc = datetime.fromisoformat(row["created_at"])
        dt_ist = dt_utc + IST_OFFSET
        day_name = day_names[dt_ist.weekday()]
        day_of_week_pattern[day_name] += row.get("amount", 0)
    
    # Spending velocity
    if len(sorted_months) >= 2:
        recent_months = sorted_months[-3:]
        recent_avg = sum(monthly_totals[m] for m in recent_months) / len(recent_months)
        if len(sorted_months) >= 4:
            older_avg = sum(monthly_totals[m] for m in sorted_months[-6:-3]) / 3
            if older_avg > 0:
                velocity_pct = ((recent_avg - older_avg) / older_avg * 100)
                if velocity_pct > 10:
                    spending_velocity = "Increasing rapidly"
                elif velocity_pct > 0:
                    spending_velocity = "Increasing"
                elif velocity_pct > -10:
                    spending_velocity = "Stable"
                else:
                    spending_velocity = "Decreasing"
            else:
                spending_velocity = "Stable"
        else:
            spending_velocity = "Stable"
    else:
        spending_velocity = "Insufficient data"
    
    return {
        "net_balance": net_balance,
        "daily_avg": daily_avg,
        "weekly_avg": weekly_avg,
        "monthly_avg": monthly_avg,
        "top_category": top_category[0],
        "top_category_amount": top_category[1],
        "top_category_pct": top_category_pct,
        "mom_change": mom_change,
        "mom_change_pct": mom_change_pct,
        "avg_transaction": avg_transaction,
        "savings_rate": savings_rate,
        "day_of_week_pattern": dict(day_of_week_pattern),
        "spending_velocity": spending_velocity,
        "days_tracked": days_diff
    }

@app.route("/api/data")
def get_dashboard_data():
    """API endpoint to get all dashboard data"""
    user_id = request.args.get("user_id")
    data = []
    
    try:
        query = supabase.table(EXPENSE_TABLE).select("*").order("created_at", desc=True)
        
        if user_id:
            query = query.eq("user_id", user_id)
            
        # Date filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            query = query.gte('created_at', start_date)
        if end_date:
            query = query.lte('created_at', end_date)
            
        result = query.execute()
        data = result.data if result.data else []
    except Exception as e:
        print(f"Error fetching data: {e}")
        data = []

    total_amount = sum(row.get("amount", 0) for row in data)
    total_records = len(data)

    category_totals = defaultdict(float)
    type_totals = defaultdict(float)
    monthly_totals = defaultdict(float)
    
    credit_total = sum(row["amount"] for row in data if row.get("type") == "credit")
    debit_total = sum(row["amount"] for row in data if row.get("type") == "debit")

    for row in data:
        cat = row.get("category") or "Uncategorized"
        typ = row.get("type") or "Other"
        dt_utc = datetime.fromisoformat(row["created_at"])
        month = (dt_utc + IST_OFFSET).strftime("%b %Y")
        
        category_totals[cat] += row.get("amount", 0)
        type_totals[typ] += row.get("amount", 0)
        monthly_totals[month] += row.get("amount", 0)

    # Convert expenses to human-readable IST
    formatted_expenses = []
    for row in data:
        dt_utc = datetime.fromisoformat(row["created_at"])
        dt_ist = dt_utc + IST_OFFSET
        formatted_row = row.copy()
        formatted_row["created_at_readable"] = dt_ist.strftime("%b %d, %Y %I:%M %p")
        formatted_expenses.append(formatted_row)

    monthly_labels = sorted(monthly_totals.keys(), key=lambda d: datetime.strptime(d, "%b %Y"))
    monthly_values = [monthly_totals[m] for m in monthly_labels]
    
    # Calculate insights
    insights = calculate_insights(data, user_id)

    return jsonify({
        "expenses": formatted_expenses,
        "total_amount": total_amount,
        "total_records": total_records,
        "category_totals": dict(category_totals),
        "type_totals": dict(type_totals),
        "monthly_labels": monthly_labels,
        "monthly_values": monthly_values,
        "user_id": user_id or "",
        "credit_total": credit_total,
        "debit_total": debit_total,
        "insights": insights
    })

@app.route("/")
def serve_react():
    """Serve React app"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/<path:path>")
def serve_react_static(path):
    """Serve React static files"""
    return send_from_directory(app.static_folder, path)

@app.route("/api/expense/<expense_id>", methods=["PUT", "PATCH"])
def update_expense(expense_id):
    """Update an expense record"""
    try:
        user_id = request.args.get("user_id")
        data = request.get_json()
        
        # Validate required fields
        update_data = {}
        if "amount" in data:
            update_data["amount"] = float(data["amount"])
        if "category" in data:
            update_data["category"] = str(data["category"])
        if "type" in data:
            if data["type"] not in ["debit", "credit"]:
                return jsonify({"error": "Type must be 'debit' or 'credit'"}), 400
            update_data["type"] = data["type"]
        if "description" in data:
            update_data["description"] = str(data["description"])
        
        # Build query
        query = supabase.table(EXPENSE_TABLE).update(update_data).eq("id", expense_id)
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        
        if not result.data:
            return jsonify({"error": "Expense not found or unauthorized"}), 404
        
        return jsonify({"success": True, "data": result.data[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/expense/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    """Delete an expense record"""
    try:
        user_id = request.args.get("user_id")
        
        # Build query
        query = supabase.table(EXPENSE_TABLE).delete().eq("id", expense_id)
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.execute()
        
        if not result.data:
            return jsonify({"error": "Expense not found or unauthorized"}), 404
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/feature-request", methods=["POST"])
def submit_feature_request():
    """Submit a new feature request"""
    try:
        data = request.get_json()
        feature_text = data.get("text")
        username = data.get("username")
        
        if not feature_text:
            return jsonify({"error": "Feature description is required"}), 400
            
        payload = {
            "text": feature_text,
            "username": username
        }
        
        # Insert into feature_request table
        # Table schema: id, created_at, text, username
        result = supabase.table("feature_request").insert(payload).execute()
        
        if not result.data:
             return jsonify({"error": "Failed to save request"}), 500
             
        return jsonify({"success": True, "data": result.data[0]})
        
    except Exception as e:
        print(f"Error submitting feature request: {e}")
        return jsonify({"error": str(e)}), 500


# ----------------------------
# Run the app
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
