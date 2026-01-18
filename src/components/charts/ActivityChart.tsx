'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { ActivityData } from '@/types/zepp';

interface Props {
    data: ActivityData[];
    showCalories?: boolean;
}

export default function ActivityChart({ data, showCalories = false }: Props) {
    // Take last 30 days
    const chartData = data.slice(-30).map((d) => ({
        date: d.date.split('-').slice(1).join('/'), // Format as MM/DD
        steps: d.steps,
        calories: d.calories,
        distance: Math.round(d.distance / 1000 * 10) / 10, // km
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
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #4a4a6a',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="steps"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="Steps"
                    />
                    {showCalories && (
                        <Line
                            type="monotone"
                            dataKey="calories"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="Calories"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
