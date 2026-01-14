import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {title}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground mb-4">
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                {changeType === 'increase' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                  {change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ml-4">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
