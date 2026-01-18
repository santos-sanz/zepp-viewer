'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { SleepData } from '@/types/zepp';

interface Props {
    data: SleepData[];
}

export default function SleepChart({ data }: Props) {
    // Take last 30 days with sleep data
    const chartData = data.slice(-30).map((d) => ({
        date: d.date.split('-').slice(1).join('/'),
        deep: Math.round(d.deepSleepTime / 60 * 10) / 10, // hours
        light: Math.round(d.shallowSleepTime / 60 * 10) / 10,
        rem: Math.round(d.REMTime / 60 * 10) / 10,
        total: Math.round((d.deepSleepTime + d.shallowSleepTime + d.REMTime) / 60 * 10) / 10,
    }));

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                        tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #4a4a6a',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}h`, '']}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="deep"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        name="Deep Sleep"
                    />
                    <Area
                        type="monotone"
                        dataKey="light"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        name="Light Sleep"
                    />
                    <Area
                        type="monotone"
                        dataKey="rem"
                        stackId="1"
                        stroke="#ec4899"
                        fill="#ec4899"
                        name="REM"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
