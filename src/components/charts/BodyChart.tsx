'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { BodyData } from '@/types/zepp';

interface Props {
    data: BodyData[];
}

export default function BodyChart({ data }: Props) {
    // Take last 30 entries with weight data
    const chartData = data.slice(-30).map((d) => ({
        date: d.time.split(' ')[0].split('-').slice(1).join('/'),
        weight: Math.round(d.weight * 10) / 10,
        bmi: Math.round(d.bmi * 10) / 10,
    }));

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tickFormatter={(value) => `${value} kg`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #4a4a6a',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number, name: string) => [
                            name === 'weight' ? `${value} kg` : value,
                            name === 'weight' ? 'Weight' : 'BMI'
                        ]}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                        name="Weight"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
