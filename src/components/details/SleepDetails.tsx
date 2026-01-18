'use client';

import type { SleepAnalytics } from '@/lib/analytics';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

interface Props {
    analytics: SleepAnalytics;
}

export default function SleepDetails({ analytics }: Props) {
    const sleepArchitecture = [
        { name: 'Deep Sleep', value: analytics.deepSleepPercent, color: '#3b82f6' },
        { name: 'Light Sleep', value: analytics.lightSleepPercent, color: '#8b5cf6' },
        { name: 'REM', value: analytics.remSleepPercent, color: '#ec4899' },
    ];

    const weeklyData = Object.entries(analytics.avgByDayOfWeek).map(([day, mins]) => ({
        day: day.substring(0, 3),
        hours: Math.round(mins / 60 * 10) / 10,
        fullDay: day,
    }));

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

    const getSleepQualityLabel = (efficiency: number) => {
        if (efficiency >= 90) return { label: 'Excellent', color: 'text-green-400' };
        if (efficiency >= 80) return { label: 'Good', color: 'text-cyan-400' };
        if (efficiency >= 70) return { label: 'Fair', color: 'text-yellow-400' };
        return { label: 'Poor', color: 'text-red-400' };
    };

    const quality = getSleepQualityLabel(analytics.sleepEfficiency);

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Avg Total Sleep</p>
                    <p className="text-2xl font-bold text-white">{analytics.avgTotalSleep}h</p>
                    <p className="text-gray-500 text-sm">{analytics.totalNights} nights</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Sleep Efficiency</p>
                    <p className={`text-2xl font-bold ${quality.color}`}>{analytics.sleepEfficiency}%</p>
                    <p className="text-gray-500 text-sm">{quality.label}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Avg Bedtime</p>
                    <p className="text-2xl font-bold text-purple-400">{analytics.avgBedtime}</p>
                    <p className="text-gray-500 text-sm">Wake: {analytics.avgWakeTime}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Consistency</p>
                    <p className="text-2xl font-bold text-cyan-400">{analytics.consistencyScore}%</p>
                    <p className="text-gray-500 text-sm">±{analytics.stdDevTotalSleep}h std dev</p>
                </div>
            </div>

            {/* Sleep Architecture Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">🧠 Sleep Architecture</h4>
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sleepArchitecture}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={50}
                                        strokeWidth={0}
                                    >
                                        {sleepArchitecture.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }}
                                        formatter={(value: number) => [`${value}%`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-gray-400 text-sm">Deep: {analytics.avgDeepSleep}h ({analytics.deepSleepPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-gray-400 text-sm">Light: {analytics.avgLightSleep}h ({analytics.lightSleepPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                                <span className="text-gray-400 text-sm">REM: {analytics.avgRemSleep}h ({analytics.remSleepPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                <span className="text-gray-400 text-sm">Wake: {analytics.avgWakeTime}min ({analytics.wakePercent}%)</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3 italic">
                        Ideal: Deep 15-20%, REM 20-25%, Light 50-60%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">📊 Trends & Analysis</h4>
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
                        <div className="border-t border-gray-700 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Recommended Sleep</span>
                                <span className="text-white font-medium">{analytics.recommendedSleep}h</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Avg Sleep Debt</span>
                                <span className={`font-medium ${analytics.avgSleepDebt > 1 ? 'text-red-400' : 'text-green-400'}`}>
                                    {analytics.avgSleepDebt > 0 ? '-' : ''}{analytics.avgSleepDebt}h
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Under-slept Nights</span>
                                <span className="text-yellow-400 font-medium">{analytics.nightsUnderRecommended}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Percentile Distribution */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📈 Sleep Duration Distribution</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-lg px-4 py-3 text-center">
                        <p className="text-gray-400 text-xs">P25 (Short nights)</p>
                        <p className="text-white font-bold text-xl">{analytics.p25TotalSleep}h</p>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-3 text-center">
                        <p className="text-purple-400 text-xs">Median (Typical)</p>
                        <p className="text-white font-bold text-xl">{analytics.p50TotalSleep}h</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg px-4 py-3 text-center">
                        <p className="text-gray-400 text-xs">P75 (Long nights)</p>
                        <p className="text-white font-bold text-xl">{analytics.p75TotalSleep}h</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Best Night</p>
                        <p className="text-green-400 font-bold">{Math.round(analytics.bestNight.totalMinutes / 60 * 10) / 10}h</p>
                        <p className="text-gray-500 text-xs">{analytics.bestNight.date}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Shortest Night</p>
                        <p className="text-red-400 font-bold">{Math.round(analytics.shortestNight.totalMinutes / 60 * 10) / 10}h</p>
                        <p className="text-gray-500 text-xs">{analytics.shortestNight.date}</p>
                    </div>
                </div>
            </div>

            {/* Weekly Pattern */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📅 Weekly Sleep Pattern</h4>
                <p className="text-gray-400 text-sm mb-4">
                    Best sleep: <span className="text-green-400 font-medium">{analytics.bestSleepDay}</span> •
                    Worst sleep: <span className="text-red-400 font-medium">{analytics.worstSleepDay}</span>
                </p>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v}h`} domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px' }}
                                formatter={(value: number) => [`${value}h`, 'Avg Sleep']}
                                labelFormatter={(label) => weeklyData.find(d => d.day === label)?.fullDay}
                            />
                            <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Progression */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📆 Monthly Sleep Trends</h4>
                <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-min">
                        {analytics.monthlyAverages.map((m) => (
                            <div
                                key={m.month}
                                className={`rounded-lg px-3 py-2 text-center min-w-[80px] ${m.avgHours >= analytics.recommendedSleep
                                        ? 'bg-green-500/20 border border-green-500/30'
                                        : 'bg-gray-700/30'
                                    }`}
                            >
                                <p className="text-gray-400 text-xs">{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</p>
                                <p className="text-white font-bold text-sm">{m.avgHours}h</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
