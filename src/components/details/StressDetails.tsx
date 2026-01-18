'use client';

import type { StressAnalytics } from '@/lib/stress-analytics';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';

interface Props {
    analytics: StressAnalytics;
}

export default function StressDetails({ analytics }: Props) {
    const weeklyData = Object.entries(analytics.avgHRByDayOfWeek).map(([day, avgHR]) => ({
        day: day.substring(0, 3),
        avgHR,
        fullDay: day,
    }));

    const zoneData = [
        { name: 'Relaxed (<60)', value: analytics.zoneDistribution.relaxed, color: '#22c55e' },
        { name: 'Normal (60-80)', value: analytics.zoneDistribution.normal, color: '#3b82f6' },
        { name: 'Elevated (80-100)', value: analytics.zoneDistribution.elevated, color: '#eab308' },
        { name: 'High (100-120)', value: analytics.zoneDistribution.high, color: '#f97316' },
        { name: 'Very High (>120)', value: analytics.zoneDistribution.veryHigh, color: '#ef4444' },
    ].filter((z) => z.value > 0);

    const getStressColor = (level: string) => {
        switch (level) {
            case 'Low': return 'text-green-400';
            case 'Moderate': return 'text-yellow-400';
            case 'High': return 'text-orange-400';
            case 'Very High': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getHRVColor = (category: string) => {
        switch (category) {
            case 'Excellent': return 'text-green-400';
            case 'Good': return 'text-cyan-400';
            case 'Average': return 'text-yellow-400';
            case 'Below Average': return 'text-orange-400';
            case 'Poor': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    };

    const formatHour = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}:00 ${ampm}`;
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Stress Score</p>
                    <p className={`text-2xl font-bold ${getStressColor(analytics.stressLevel)}`}>
                        {analytics.avgStressScore}/100
                    </p>
                    <p className={`text-sm ${getStressColor(analytics.stressLevel)}`}>{analytics.stressLevel}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Est. HRV (SDNN)</p>
                    <p className={`text-2xl font-bold ${getHRVColor(analytics.hrvCategory)}`}>{analytics.estimatedHRV}ms</p>
                    <p className="text-gray-500 text-sm">{analytics.hrvCategory}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Resting HR</p>
                    <p className="text-2xl font-bold text-purple-400">{analytics.avgRestingHR} bpm</p>
                    <p className="text-gray-500 text-sm">{analytics.minRestingHR}-{analytics.maxRestingHR} range</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Recovery Score</p>
                    <p className={`text-2xl font-bold ${analytics.recoveryScore >= 70 ? 'text-green-400' : analytics.recoveryScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {analytics.recoveryScore}%
                    </p>
                    <p className="text-gray-500 text-sm">Sleep vs day HR</p>
                </div>
            </div>

            {/* HR Zones and Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">💓 Heart Rate Zone Distribution</h4>
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={zoneData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={50}
                                        strokeWidth={0}
                                    >
                                        {zoneData.map((entry) => (
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
                        <div className="flex-1 space-y-1.5">
                            {zoneData.map((zone) => (
                                <div key={zone.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }}></div>
                                    <span className="text-gray-400 text-xs">{zone.name}</span>
                                    <span className="text-white text-xs ml-auto">{zone.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">📊 Stress Indicators</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Resting HR Trend</span>
                            <span className={`font-medium ${analytics.restingHRTrend.direction === 'down' ? 'text-green-400' : analytics.restingHRTrend.direction === 'up' ? 'text-red-400' : 'text-gray-400'}`}>
                                {getTrendIcon(analytics.restingHRTrend.direction)} {analytics.restingHRTrend.percentChange > 0 ? '+' : ''}{analytics.restingHRTrend.percentChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Peak Stress Hour</span>
                            <span className="text-orange-400 font-medium">{formatHour(analytics.peakStressHour)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Most Relaxed Hour</span>
                            <span className="text-green-400 font-medium">{formatHour(analytics.lowestStressHour)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">High Stress Days</span>
                            <span className="text-yellow-400 font-medium">{analytics.daysWithHighStress} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Night High HR Events</span>
                            <span className={`font-medium ${analytics.highHREvents > 50 ? 'text-red-400' : 'text-gray-400'}`}>
                                {analytics.highHREvents}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sleep vs Daytime Recovery */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">😴 Sleep & Recovery Analysis</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-xs">Sleep HR (23:00-07:00)</p>
                        <p className="text-white text-2xl font-bold">{analytics.avgSleepHR} bpm</p>
                    </div>
                    <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-300 text-xs">Daytime HR (09:00-21:00)</p>
                        <p className="text-white text-2xl font-bold">{analytics.avgDaytimeHR} bpm</p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${analytics.recoveryScore >= 70 ? 'bg-green-500/10 border border-green-500/30' : analytics.recoveryScore >= 40 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <p className="text-gray-300 text-xs">Recovery Difference</p>
                        <p className={`text-2xl font-bold ${analytics.recoveryScore >= 70 ? 'text-green-400' : analytics.recoveryScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            -{analytics.avgDaytimeHR - analytics.avgSleepHR} bpm
                        </p>
                    </div>
                </div>
                <p className="text-gray-500 text-xs mt-3 italic">
                    Good recovery: Sleep HR should be 15-20+ bpm lower than daytime HR
                </p>
            </div>

            {/* Weekly Stress Pattern */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📅 Weekly Stress Pattern</h4>
                <p className="text-gray-400 text-sm mb-4">
                    Most stressed: <span className="text-red-400 font-medium">{analytics.mostStressfulDay}</span> •
                    Most relaxed: <span className="text-green-400 font-medium">{analytics.leastStressfulDay}</span>
                </p>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} domain={[50, 90]} tickFormatter={(v) => `${v} bpm`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px' }}
                                formatter={(value: number) => [`${value} bpm`, 'Avg HR']}
                                labelFormatter={(label) => weeklyData.find(d => d.day === label)?.fullDay}
                            />
                            <Bar dataKey="avgHR" radius={[4, 4, 0, 0]}>
                                {weeklyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.avgHR > 75 ? '#ef4444' : entry.avgHR > 65 ? '#eab308' : '#22c55e'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📆 Monthly Stress Trends</h4>
                <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-min">
                        {analytics.monthlyAvgHR.map((m) => (
                            <div
                                key={m.month}
                                className={`rounded-lg px-3 py-2 text-center min-w-[80px] ${m.stressScore < 40
                                        ? 'bg-green-500/20 border border-green-500/30'
                                        : m.stressScore < 60
                                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                                            : 'bg-red-500/20 border border-red-500/30'
                                    }`}
                            >
                                <p className="text-gray-400 text-xs">{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</p>
                                <p className="text-white font-bold text-sm">{m.avgHR} bpm</p>
                                <p className="text-gray-500 text-xs">Score: {m.stressScore}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Summary */}
            <div className="text-center text-gray-500 text-sm">
                Based on {analytics.totalReadings.toLocaleString()} heart rate readings from {analytics.dateRange.start} to {analytics.dateRange.end}
            </div>
        </div>
    );
}
