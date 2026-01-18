'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import type { StressAnalytics } from '@/lib/stress-analytics';

interface Props {
    analytics: StressAnalytics;
}

export default function StressChart({ analytics }: Props) {
    // Get hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString().padStart(2, '0') + ':00',
        avgHR: analytics.avgHRByHour[hour] || 0,
        isNight: hour >= 23 || hour < 7,
    }));

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="hour"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        interval={2}
                    />
                    <YAxis
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        domain={[40, 100]}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #4a4a6a',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value} bpm`, 'Avg Heart Rate']}
                    />
                    <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Relaxed', fill: '#22c55e', fontSize: 10 }} />
                    <ReferenceLine y={80} stroke="#eab308" strokeDasharray="5 5" label={{ value: 'Normal', fill: '#eab308', fontSize: 10 }} />
                    <ReferenceLine y={100} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'Elevated', fill: '#f97316', fontSize: 10 }} />
                    <Line
                        type="monotone"
                        dataKey="avgHR"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={false}
                        name="Heart Rate"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
