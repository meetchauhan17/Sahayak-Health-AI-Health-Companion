"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface ChartDataItem {
  date: string;
  severityVal: number;
  symptom: string;
}

interface SeverityChartProps {
  data: ChartDataItem[];
  valueToLabel: (val: number) => string;
}

export default function SeverityChart({ data, valueToLabel }: SeverityChartProps) {
  return (
    <div className="h-48 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.8} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 600 }}
            stroke="#e5e7eb"
          />
          <YAxis
            domain={[1, 3]}
            ticks={[1, 2, 3]}
            tickFormatter={valueToLabel}
            tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 600 }}
            stroke="#e5e7eb"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload as ChartDataItem;
                return (
                  <div className="bg-gray-900 border border-gray-800 text-white p-3 rounded-md text-xs space-y-1">
                    <p className="font-bold text-blue-400">{d.date}</p>
                    <p className="text-gray-300 truncate max-w-xs font-medium">
                      {d.symptom}
                    </p>
                    <p className="font-bold text-amber-400">
                      Severity: {valueToLabel(d.severityVal)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="severityVal"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
