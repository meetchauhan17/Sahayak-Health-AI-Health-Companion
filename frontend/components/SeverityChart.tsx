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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            stroke="#475569"
          />
          <YAxis
            domain={[1, 3]}
            ticks={[1, 2, 3]}
            tickFormatter={valueToLabel}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            stroke="#475569"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload as ChartDataItem;
                return (
                  <div className="bg-gray-900 dark:bg-slate-800 border border-gray-700 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                    <p className="font-bold text-teal-300">{d.date}</p>
                    <p className="text-gray-200 truncate max-w-xs">
                      {d.symptom}
                    </p>
                    <p className="font-semibold text-amber-300">
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
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#06b6d4" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
