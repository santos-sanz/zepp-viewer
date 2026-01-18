'use client';

import type { BodyAnalytics } from '@/lib/analytics';
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

interface Props {
    analytics: BodyAnalytics;
}

export default function BodyDetails({ analytics }: Props) {
    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    };

    const getBmiColor = (category: string) => {
        switch (category) {
            case 'Normal': return 'text-green-400';
            case 'Underweight': return 'text-yellow-400';
            case 'Overweight': return 'text-orange-400';
            default: return 'text-red-400';
        }
    };

    const monthlyData = analytics.monthlyAverages.map((m) => ({
        month: m.month.split('-')[1] + '/' + m.month.split('-')[0].slice(2),
        weight: m.avgWeight,
        bmi: m.avgBmi,
    }));

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Current Weight</p>
                    <p className="text-2xl font-bold text-white">{analytics.currentWeight} kg</p>
                    <p className={`text-sm ${analytics.weightChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {analytics.weightChange >= 0 ? '+' : ''}{analytics.weightChange} kg total
                    </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">BMI</p>
                    <p className={`text-2xl font-bold ${getBmiColor(analytics.bmiCategory)}`}>{analytics.currentBmi.toFixed(1)}</p>
                    <p className="text-gray-500 text-sm">{analytics.bmiCategory}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Weight Range</p>
                    <p className="text-2xl font-bold text-cyan-400">{analytics.weightRange} kg</p>
                    <p className="text-gray-500 text-sm">{analytics.minWeight} - {analytics.maxWeight} kg</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Measurements</p>
                    <p className="text-2xl font-bold text-purple-400">{analytics.totalMeasurements}</p>
                    <p className="text-gray-500 text-sm">Since {analytics.dateRange.start}</p>
                </div>
            </div>

            {/* Trends and Rate of Change */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">📊 Trend Analysis</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">30-Day Trend</span>
                            <span className={`font-medium ${analytics.trend30d.direction === 'down' ? 'text-green-400' : analytics.trend30d.direction === 'up' ? 'text-red-400' : 'text-gray-400'}`}>
                                {getTrendIcon(analytics.trend30d.direction)} {analytics.trend30d.percentChange > 0 ? '+' : ''}{analytics.trend30d.percentChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">90-Day Trend</span>
                            <span className={`font-medium ${analytics.trend90d.direction === 'down' ? 'text-green-400' : analytics.trend90d.direction === 'up' ? 'text-red-400' : 'text-gray-400'}`}>
                                {getTrendIcon(analytics.trend90d.direction)} {analytics.trend90d.percentChange > 0 ? '+' : ''}{analytics.trend90d.percentChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Rate of Change</span>
                            <span className={`font-medium ${analytics.weightChangePerWeek < 0 ? 'text-green-400' : analytics.weightChangePerWeek > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {analytics.weightChangePerWeek >= 0 ? '+' : ''}{analytics.weightChangePerWeek} kg/week
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Variability (σ)</span>
                            <span className="text-white font-medium">±{analytics.stdDevWeight} kg</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">🔬 Body Composition</h4>
                    {analytics.latestFatRate !== null ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Body Fat</span>
                                <span className="text-white font-medium">{analytics.latestFatRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(analytics.latestFatRate * 2.5, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Muscle Rate</span>
                                <span className="text-cyan-400 font-medium">{analytics.latestMuscleRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Metabolism</span>
                                <span className="text-orange-400 font-medium">{analytics.latestMetabolism} kcal</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Visceral Fat</span>
                                <span className={`font-medium ${(analytics.latestVisceralFat || 0) <= 9 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    Level {analytics.latestVisceralFat}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-sm">No body composition data available. Use a smart scale for detailed metrics.</p>
                    )}
                </div>
            </div>

            {/* Weight Journey Summary */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">🎯 Weight Journey Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-gray-400 text-xs">Starting Weight</p>
                        <p className="text-white text-xl font-bold">{analytics.startWeight} kg</p>
                        <p className="text-gray-500 text-xs">{analytics.dateRange.start}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-gray-400 text-xs">Current Weight</p>
                        <p className="text-white text-xl font-bold">{analytics.currentWeight} kg</p>
                        <p className="text-gray-500 text-xs">{analytics.dateRange.end}</p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${analytics.weightChange <= 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                        <p className="text-gray-400 text-xs">Total Change</p>
                        <p className={`text-xl font-bold ${analytics.weightChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {analytics.weightChange >= 0 ? '+' : ''}{analytics.weightChange} kg
                        </p>
                        <p className="text-gray-500 text-xs">{analytics.weightChangePercent > 0 ? '+' : ''}{analytics.weightChangePercent}%</p>
                    </div>
                    <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-gray-400 text-xs">Average Weight</p>
                        <p className="text-purple-400 text-xl font-bold">{analytics.avgWeight} kg</p>
                        <p className="text-gray-500 text-xs">BMI: {analytics.avgBmi}</p>
                    </div>
                </div>
            </div>

            {/* Monthly Weight Chart */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📆 Monthly Weight Progression</h4>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(v) => `${v}kg`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px' }}
                                formatter={(value: number) => [`${value} kg`, 'Avg Weight']}
                            />
                            <ReferenceLine y={analytics.avgWeight} stroke="#8b5cf6" strokeDasharray="5 5" label={{ value: 'Avg', fill: '#8b5cf6', fontSize: 10 }} />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BMI Reference */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📏 BMI Classification</h4>
                <div className="relative h-8 bg-gradient-to-r from-yellow-500 via-green-500 via-50% via-green-500 via-60% to-red-500 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                        style={{ left: `${Math.min(Math.max((analytics.currentBmi - 15) / 25 * 100, 0), 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>15 (Underweight)</span>
                    <span>18.5</span>
                    <span>25 (Normal)</span>
                    <span>30</span>
                    <span>40+ (Obese)</span>
                </div>
                <p className="text-center mt-4 text-gray-400">
                    Your BMI of <span className={`font-bold ${getBmiColor(analytics.bmiCategory)}`}>{analytics.currentBmi.toFixed(1)}</span> is classified as <span className={`font-bold ${getBmiColor(analytics.bmiCategory)}`}>{analytics.bmiCategory}</span>
                </p>
            </div>
        </div>
    );
}
