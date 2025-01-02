"use client";
import React, { useMemo } from "react";
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
  const { chartData, averagePerDay } = useMemo(() => {
    // Get all dates between earliest signup and today
    const today = new Date();
    const dates =
      data.length > 0
        ? Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (29 - i));
            return format(d, "MMM dd");
          })
        : [];

    // Group signups by date
    const groupedByDate = data.reduce((acc, item) => {
      const date = format(new Date(item.createdAt), "MMM dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all dates are represented in the chart data
    const filledData = dates.reduce((acc, date) => {
      acc[date] = groupedByDate[date] || 0;
      return acc;
    }, {} as Record<string, number>);

    const counts = Object.values(filledData);
    const averagePerDay =
      counts.length > 0
        ? (
            counts.reduce(
              (sum: number, count: number): number => sum + count,
              0
            ) / counts.length
          ).toFixed(1)
        : "0";

    return {
      chartData: Object.entries(filledData).map(([date, count]) => ({
        date,
        count,
      })),
      averagePerDay,
    };
  }, [data]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-700 font-">
            Daily Waitlist Signups
          </h3>
          <span className="text-sm text-muted-foreground">
            Average: {averagePerDay} per day
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
