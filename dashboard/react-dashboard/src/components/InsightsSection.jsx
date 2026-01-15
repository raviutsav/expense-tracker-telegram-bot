import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Target, Zap, Calendar, DollarSign } from 'lucide-react';

const InsightCard = ({ icon: Icon, title, value, subtitle, trend }) => {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                  {trend.value}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InsightsSection = ({ insights }) => {
  if (!insights) return null;

  const formatCurrency = (value) => {
    return `₹${Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <InsightCard
        icon={DollarSign}
        title="Net Balance"
        value={formatCurrency(insights.net_balance)}
        subtitle={insights.net_balance >= 0 ? 'Positive' : 'Negative'}
        trend={
          insights.net_balance >= 0
            ? { direction: 'up', value: 'In credit' }
            : { direction: 'down', value: 'In debt' }
        }
      />
      <InsightCard
        icon={Zap}
        title="Spending Velocity"
        value={insights.spending_velocity || 'Stable'}
        subtitle="Based on recent trends"
      />
      <InsightCard
        icon={Target}
        title="Top Category"
        value={insights.top_category || 'N/A'}
        subtitle={`${formatCurrency(insights.top_category_amount || 0)} (${(
          insights.top_category_pct || 0
        ).toFixed(1)}%)`}
      />
      <InsightCard
        icon={Calendar}
        title="Avg Transaction"
        value={formatCurrency(insights.avg_transaction || 0)}
        subtitle={`Over ${insights.days_tracked || 0} days`}
      />
    </div>
  );
};

export default InsightsSection;
