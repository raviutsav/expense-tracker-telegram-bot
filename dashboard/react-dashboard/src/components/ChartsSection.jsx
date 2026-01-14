import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from './ThemeContext';

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

const ChartsSection = ({ data }) => {
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff', // Slate 900 for dark mode
    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, // Slate 800 border
    borderRadius: '8px',
    padding: '8px 12px',
    color: isDark ? '#f1f5f9' : '#0f172a', // Slate 100 text
  };

  const categoryData = Object.entries(data.category_totals || {})
    .map(([name, value]) => ({
      name,
      value: parseFloat(value),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const typeData = Object.entries(data.type_totals || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value),
  }));

  const monthlyData = (data.monthly_labels || []).map((label, index) => ({
    month: label,
    amount: data.monthly_values?.[index] || 0,
  }));

  const dayOfWeekData = Object.entries(data.insights?.day_of_week_pattern || {})
    .map(([name, value]) => ({
      name: name.slice(0, 3),
      value: parseFloat(value),
    }))
    .sort((a, b) => {
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category Breakdown */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={tooltipStyle}
                cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
              />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Debit vs Credit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === 'credit' ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="border-border shadow-sm bg-card md:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Monthly Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="month"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Day of Week Pattern */}
      {dayOfWeekData.length > 0 && (
        <Card className="border-border shadow-sm bg-card md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Spending by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartsSection;
