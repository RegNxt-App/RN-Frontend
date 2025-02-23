'use client';

import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const data = [
  {name: 'Customer Transactions', queries: 1200},
  {name: 'Financial Summary', queries: 900},
  {name: 'Risk Assessment', queries: 800},
  {name: 'Regulatory Reporting', queries: 1600},
  {name: 'Product Performance', queries: 1000},
];

export function DataViewUsageChart() {
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar
          dataKey="queries"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
