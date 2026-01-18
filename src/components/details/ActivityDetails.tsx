'use client';

import type { ActivityAnalytics } from '@/lib/analytics';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

interface Props {
    analytics: ActivityAnalytics;
}

export default function ActivityDetails({ analytics }: Props) {
    const weeklyData = Object.entries(analytics.avgByDayOfWeek).map(([day, steps]) => ({
        day: day.substring(0, 3),
        steps,
        fullDay: day,
    }));

    const percentileData = [
        { label: 'P25', value: analytics.p25Steps, color: '#6b7280' },
        { label: 'P50 (Median)', value: analytics.p50Steps, color: '#8b5cf6' },
        { label: 'P75', value: analytics.p75Steps, color: '#06b6d4' },
        { label: 'P90', value: analytics.p90Steps, color: '#10b981' },
        { label: 'P95', value: analytics.p95Steps, color: '#f59e0b' },
    ];

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    };

    const getTrendColor = (direction: string) => {
        switch (direction) {
            case 'up': return 'text-green-400';
            case 'down': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total Steps</p>
                    <p className="text-2xl font-bold text-white">{analytics.totalSteps.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{analytics.totalDays} days tracked</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Daily Average</p>
                    <p className="text-2xl font-bold text-purple-400">{analytics.avgDailySteps.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">±{analytics.stdDevSteps.toLocaleString()} std dev</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total Distance</p>
                    <p className="text-2xl font-bold text-cyan-400">{analytics.totalDistance.toLocaleString()} km</p>
                    <p className="text-gray-500 text-sm">{analytics.avgDailyDistance} km/day avg</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total Calories</p>
                    <p className="text-2xl font-bold text-orange-400">{analytics.totalCalories.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{analytics.avgDailyCalories} kcal/day avg</p>
                </div>
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        📊 Trend Analysis
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">7-Day Trend</span>
                            <span className={`font-medium ${getTrendColor(analytics.trend7d.direction)}`}>
                                {getTrendIcon(analytics.trend7d.direction)} {analytics.trend7d.percentChange > 0 ? '+' : ''}{analytics.trend7d.percentChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">30-Day Trend</span>
                            <span className={`font-medium ${getTrendColor(analytics.trend30d.direction)}`}>
                                {getTrendIcon(analytics.trend30d.direction)} {analytics.trend30d.percentChange > 0 ? '+' : ''}{analytics.trend30d.percentChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Consistency Score</span>
                            <span className="font-medium text-white">{analytics.consistencyScore}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        🏆 Records & Streaks
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Best Day</span>
                            <span className="font-medium text-green-400">{analytics.bestDay.steps.toLocaleString()} steps</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Current Streak (10k+)</span>
                            <span className="font-medium text-white">{analytics.currentStreak} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Longest Streak (10k+)</span>
                            <span className="font-medium text-purple-400">{analytics.longestStreak} days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Percentile Distribution */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📈 Step Distribution (Percentiles)</h4>
                <div className="flex flex-wrap gap-3">
                    {percentileData.map((p) => (
                        <div key={p.label} className="bg-gray-700/30 rounded-lg px-4 py-2 flex-1 min-w-[120px]">
                            <p className="text-gray-400 text-xs">{p.label}</p>
                            <p className="text-white font-bold">{p.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-400 text-2xl font-bold">{analytics.daysAbove10k}</p>
                        <p className="text-gray-400 text-xs">Days &gt;10k</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-2xl font-bold">{analytics.daysAbove5k}</p>
                        <p className="text-gray-400 text-xs">Days &gt;5k</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-2xl font-bold">{analytics.daysBelow2k}</p>
                        <p className="text-gray-400 text-xs">Days &lt;2k</p>
                    </div>
                </div>
            </div>

            {/* Weekly Pattern */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📅 Weekly Activity Pattern</h4>
                <p className="text-gray-400 text-sm mb-4">
                    Most active: <span className="text-green-400 font-medium">{analytics.mostActiveDay}</span> •
                    Least active: <span className="text-red-400 font-medium">{analytics.leastActiveDay}</span>
                </p>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px' }}
                                formatter={(value: number) => [value.toLocaleString(), 'Avg Steps']}
                                labelFormatter={(label) => weeklyData.find(d => d.day === label)?.fullDay}
                            />
                            <ReferenceLine y={analytics.avgDailySteps} stroke="#8b5cf6" strokeDasharray="5 5" />
                            <Bar dataKey="steps" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Progression */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📆 Monthly Progression</h4>
                <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-min">
                        {analytics.monthlyAverages.map((m) => (
                            <div key={m.month} className="bg-gray-700/30 rounded-lg px-3 py-2 text-center min-w-[80px]">
                                <p className="text-gray-400 text-xs">{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</p>
                                <p className="text-white font-bold text-sm">{(m.avgSteps / 1000).toFixed(1)}k</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
