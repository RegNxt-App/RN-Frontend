import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const data = [
  {
    date: 'Jan',
    value: 1200,
  },
  {
    date: 'Feb',
    value: 2100,
  },
  {
    date: 'Mar',
    value: 1800,
  },
  {
    date: 'Apr',
    value: 2400,
  },
  {
    date: 'May',
    value: 2800,
  },
  {
    date: 'Jun',
    value: 2600,
  },
];

export function DataViewChart() {
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <LineChart data={data}>
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
