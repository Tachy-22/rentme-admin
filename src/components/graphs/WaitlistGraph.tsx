"use client";
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimePeriod = 'day' | 'week' | 'month';

interface WaitlistGraphProps {
  data: {
    id: number;
    name: string;
    email: string;
    joinedDate: string;
    createdAt: string;
  }[];
}

const WaitlistGraph = ({ data }: WaitlistGraphProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');

  const { chartData, averagePerPeriod } = useMemo(() => {
    const today = new Date();
    
    const getPeriodData = () => {
      switch (timePeriod) {
        case 'day':
          return Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (29 - i));
            return format(d, "MMM dd");
          });
        case 'week':
          return Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (11 - i) * 7);
            return format(d, "'Week of' MMM dd");
          });
        case 'month':
          return Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(today.getMonth() - (11 - i));
            return format(d, "MMM yyyy");
          });
      }
    };

    const dates = data.length > 0 ? getPeriodData() : [];

    const groupedByDate = data.reduce((acc, item) => {
      let date;
      const itemDate = new Date(item.createdAt);
      
      switch (timePeriod) {
        case 'day':
          date = format(itemDate, "MMM dd");
          break;
        case 'week':
          const weekStart = new Date(itemDate);
          weekStart.setDate(itemDate.getDate() - itemDate.getDay());
          date = format(weekStart, "'Week of' MMM dd");
          break;
        case 'month':
          date = format(itemDate, "MMM yyyy");
          break;
      }
      
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const filledData = dates.reduce((acc, date) => {
      acc[date] = groupedByDate[date] || 0;
      return acc;
    }, {} as Record<string, number>);

    const counts = Object.values(filledData);
    const averagePerPeriod = counts.length > 0
      ? (counts.reduce((sum, count) => sum + count, 0) / counts.length).toFixed(1)
      : "0";

    return {
      chartData: Object.entries(filledData).map(([date, count]) => ({
        date,
        count,
      })),
      averagePerPeriod,
    };
  }, [data, timePeriod]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg text-gray-700">Waitlist Signups</h3>
            <Select
              value={timePeriod}
              onValueChange={(value: TimePeriod) => setTimePeriod(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            Average: {averagePerPeriod} per {timePeriod}
          </span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm bg-white">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Signups
                            </span>
                            <span className="font-bold">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2d2bca"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default WaitlistGraph;
