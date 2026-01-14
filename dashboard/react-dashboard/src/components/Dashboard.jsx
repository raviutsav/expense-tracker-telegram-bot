import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import MetricCard from './MetricCard';
import TransactionsTable from './TransactionsTable';
import ChartsSection from './ChartsSection';
import InsightsSection from './InsightsSection';
import DateRangePicker from './DateRangePicker';
import { DollarSign, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { subDays } from 'date-fns';

const API_BASE = window.location.origin;

const Dashboard = ({ onNavigate, userId, isAuthenticated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    label: 'Last 30 days',
    start: subDays(new Date(), 30),
    end: new Date()
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // const urlParams = new URLSearchParams(window.location.search);
      // const userId = urlParams.get('user_id');

      const params = { user_id: userId };
      if (dateRange.start) params.start_date = dateRange.start.toISOString();
      if (dateRange.end) params.end_date = dateRange.end.toISOString();

      const response = await axios.get(`${API_BASE}/api/data`, { params });

      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleExpenseUpdate = async (expenseId, updateData) => {
    try {
      await axios.put(`${API_BASE}/api/expense/${expenseId}`, updateData, {
        params: { user_id: userId },
      });

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  const handleExpenseDelete = async (expenseId) => {
    try {
      await axios.delete(`${API_BASE}/api/expense/${expenseId}`, {
        params: { user_id: userId },
      });

      await fetchData();
      return true;
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  const headerAction = (
    <DateRangePicker
      initialRange={dateRange}
      onChange={handleDateRangeChange}
    />
  );

  if (loading) {
    return (
      <Layout currentPage="Dashboard" onNavigate={onNavigate} isAuthenticated={isAuthenticated}>
        <div className="flex items-center justify-center p-12">
          <div className="text-lg text-muted-foreground animate-pulse">Loading dashboard insights...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="Dashboard" onNavigate={onNavigate} isAuthenticated={isAuthenticated}>
        <div className="flex items-center justify-center p-12">
          <div className="text-red-500 font-medium">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout onNavigate={onNavigate} isAuthenticated={isAuthenticated}>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </Layout>
    );
  }

  // Calculate metrics
  const totalSpend = data.debit_total || 0;
  const numTransactions = data.total_records || 0;
  const dailyAvg = data.insights?.daily_avg || 0;
  const momChange = data.insights?.mom_change_pct || 0;
  const momChangeType = momChange >= 0 ? 'increase' : 'decrease';
  const momChangeFormatted = `${Math.abs(momChange).toFixed(1)}%`;

  return (
    <Layout
      currentPage="Dashboard"
      headerAction={headerAction}
      onNavigate={onNavigate}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Spend"
            value={`₹${totalSpend.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            change={momChangeFormatted}
            changeType={momChangeType}
            icon={DollarSign}
          />
          <MetricCard
            title="Transactions"
            value={numTransactions.toLocaleString()}
            icon={Receipt}
          />
          <MetricCard
            title="Avg Daily Spend"
            value={`₹${dailyAvg.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingUp}
          />
          <MetricCard
            title="This Month"
            value={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            icon={Calendar}
          />
        </div>

        {/* Insights */}
        <InsightsSection insights={data.insights} />

        {/* Charts */}
        <ChartsSection data={data} />

        {/* Transactions Table */}
        <TransactionsTable
          expenses={data.expenses}
          onUpdate={handleExpenseUpdate}
          onDelete={handleExpenseDelete}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
