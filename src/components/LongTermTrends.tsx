'use client';

import { useState } from 'react';
import type { ActivityData, SleepData, BodyData } from '@/types/zepp';
import type { ActivityAnalytics, SleepAnalytics, BodyAnalytics } from '@/lib/analytics';
import type { StressAnalytics } from '@/lib/stress-analytics';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    ReferenceLine,
} from 'recharts';

interface Props {
    activity: ActivityData[];
    sleep: SleepData[];
    body: BodyData[];
    activityAnalytics: ActivityAnalytics;
    sleepAnalytics: SleepAnalytics;
    bodyAnalytics: BodyAnalytics;
    stressAnalytics: StressAnalytics;
}

type TimeInterval = '3m' | '6m' | '1y' | 'all';

interface QuarterlyData {
    quarter: string;
    avgSteps: number;
    avgSleep: number;
    avgWeight: number | null;
    avgHR: number;
}

function calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getQuarter(date: string): string {
    const month = parseInt(date.split('-')[1]);
    const year = date.split('-')[0];
    const q = Math.ceil(month / 3);
    return `${year} Q${q}`;
}

export default function LongTermTrends({
    activity,
    sleep,
    body,
    activityAnalytics,
    sleepAnalytics,
    bodyAnalytics,
    stressAnalytics,
}: Props) {
    const [interval, setInterval] = useState<TimeInterval>('1y');
    const [metric, setMetric] = useState<'steps' | 'sleep' | 'weight' | 'stress'>('steps');

    // Filter data by interval
    const getFilteredData = (intervalType: TimeInterval) => {
        const now = new Date();
        let cutoffDate: Date;

        switch (intervalType) {
            case '3m':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6m':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case '1y':
                cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case 'all':
            default:
                cutoffDate = new Date('1970-01-01');
        }

        return {
            activity: activity.filter((d) => new Date(d.date) >= cutoffDate),
            sleep: sleep.filter((d) => new Date(d.date) >= cutoffDate),
            body: body.filter((d) => new Date(d.time) >= cutoffDate),
        };
    };

    const filtered = getFilteredData(interval);

    // Calculate quarterly aggregates
    const calculateQuarterlyData = (): QuarterlyData[] => {
        const quarterlyMap: Record<string, { steps: number[]; sleep: number[]; weight: number[]; hr: number[] }> = {};

        // Aggregate activity by quarter
        filtered.activity.forEach((d) => {
            const q = getQuarter(d.date);
            if (!quarterlyMap[q]) quarterlyMap[q] = { steps: [], sleep: [], weight: [], hr: [] };
            if (d.steps > 0) quarterlyMap[q].steps.push(d.steps);
        });

        // Aggregate sleep by quarter
        filtered.sleep.forEach((d) => {
            const q = getQuarter(d.date);
            if (!quarterlyMap[q]) quarterlyMap[q] = { steps: [], sleep: [], weight: [], hr: [] };
            const total = (d.deepSleepTime + d.shallowSleepTime + d.REMTime) / 60;
            if (total > 0) quarterlyMap[q].sleep.push(total);
        });

        // Aggregate body by quarter
        filtered.body.forEach((d) => {
            const q = getQuarter(d.time.split(' ')[0]);
            if (!quarterlyMap[q]) quarterlyMap[q] = { steps: [], sleep: [], weight: [], hr: [] };
            if (d.weight > 0) quarterlyMap[q].weight.push(d.weight);
        });

        // Add stress HR by quarter
        stressAnalytics.monthlyAvgHR.forEach((m) => {
            const q = getQuarter(`${m.month}-01`);
            if (!quarterlyMap[q]) quarterlyMap[q] = { steps: [], sleep: [], weight: [], hr: [] };
            quarterlyMap[q].hr.push(m.avgHR);
        });

        return Object.entries(quarterlyMap)
            .map(([quarter, data]) => ({
                quarter,
                avgSteps: Math.round(calculateMean(data.steps)),
                avgSleep: Math.round(calculateMean(data.sleep) * 10) / 10,
                avgWeight: data.weight.length > 0 ? Math.round(calculateMean(data.weight) * 10) / 10 : null,
                avgHR: Math.round(calculateMean(data.hr)),
            }))
            .sort((a, b) => a.quarter.localeCompare(b.quarter));
    };

    const quarterlyData = calculateQuarterlyData();

    // Calculate yearly aggregates
    const calculateYearlyData = () => {
        const yearlyMap: Record<string, { steps: number[]; sleep: number[]; weight: number[]; hr: number[] }> = {};

        activity.forEach((d) => {
            const year = d.date.split('-')[0];
            if (!yearlyMap[year]) yearlyMap[year] = { steps: [], sleep: [], weight: [], hr: [] };
            if (d.steps > 0) yearlyMap[year].steps.push(d.steps);
        });

        sleep.forEach((d) => {
            const year = d.date.split('-')[0];
            if (!yearlyMap[year]) yearlyMap[year] = { steps: [], sleep: [], weight: [], hr: [] };
            const total = (d.deepSleepTime + d.shallowSleepTime + d.REMTime) / 60;
            if (total > 0) yearlyMap[year].sleep.push(total);
        });

        body.forEach((d) => {
            const year = d.time.split('-')[0];
            if (!yearlyMap[year]) yearlyMap[year] = { steps: [], sleep: [], weight: [], hr: [] };
            if (d.weight > 0) yearlyMap[year].weight.push(d.weight);
        });

        stressAnalytics.monthlyAvgHR.forEach((m) => {
            const year = m.month.split('-')[0];
            if (!yearlyMap[year]) yearlyMap[year] = { steps: [], sleep: [], weight: [], hr: [] };
            yearlyMap[year].hr.push(m.avgHR);
        });

        return Object.entries(yearlyMap)
            .map(([year, data]) => ({
                year,
                avgSteps: Math.round(calculateMean(data.steps)),
                avgSleep: Math.round(calculateMean(data.sleep) * 10) / 10,
                avgWeight: data.weight.length > 0 ? Math.round(calculateMean(data.weight) * 10) / 10 : null,
                avgHR: Math.round(calculateMean(data.hr)),
                totalSteps: data.steps.reduce((a, b) => a + b, 0),
                daysTracked: data.steps.length,
            }))
            .sort((a, b) => a.year.localeCompare(b.year));
    };

    const yearlyData = calculateYearlyData();

    // Calculate all-time stats
    const allTimeStats = {
        totalSteps: activityAnalytics.totalSteps,
        totalDistance: activityAnalytics.totalDistance,
        totalCalories: activityAnalytics.totalCalories,
        totalNights: sleepAnalytics.totalNights,
        avgTotalSleep: sleepAnalytics.avgTotalSleep,
        totalMeasurements: bodyAnalytics.totalMeasurements,
        weightChange: bodyAnalytics.weightChange,
        totalHRReadings: stressAnalytics.totalReadings,
        dateRange: {
            activity: { start: activity[0]?.date, end: activity[activity.length - 1]?.date },
            sleep: { start: sleep[0]?.date, end: sleep[sleep.length - 1]?.date },
            body: bodyAnalytics.dateRange,
            stress: stressAnalytics.dateRange,
        },
    };

    // Best and worst years
    const bestStepsYear = yearlyData.reduce((best, curr) => curr.avgSteps > best.avgSteps ? curr : best, yearlyData[0]);
    const bestSleepYear = yearlyData.reduce((best, curr) => curr.avgSleep > best.avgSleep ? curr : best, yearlyData[0]);

    const getMetricData = () => {
        switch (metric) {
            case 'steps':
                return quarterlyData.map((d) => ({ ...d, value: d.avgSteps, label: `${(d.avgSteps / 1000).toFixed(1)}k` }));
            case 'sleep':
                return quarterlyData.map((d) => ({ ...d, value: d.avgSleep, label: `${d.avgSleep}h` }));
            case 'weight':
                return quarterlyData.filter((d) => d.avgWeight !== null).map((d) => ({ ...d, value: d.avgWeight!, label: `${d.avgWeight}kg` }));
            case 'stress':
                return quarterlyData.filter((d) => d.avgHR > 0).map((d) => ({ ...d, value: d.avgHR, label: `${d.avgHR}bpm` }));
        }
    };

    const metricData = getMetricData();

    const getMetricColor = () => {
        switch (metric) {
            case 'steps': return '#8b5cf6';
            case 'sleep': return '#3b82f6';
            case 'weight': return '#10b981';
            case 'stress': return '#ec4899';
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {(['3m', '6m', '1y', 'all'] as TimeInterval[]).map((int) => (
                        <button
                            key={int}
                            onClick={() => setInterval(int)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${interval === int
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {int === '3m' ? '3 Months' : int === '6m' ? '6 Months' : int === '1y' ? '1 Year' : 'All Time'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {(['steps', 'sleep', 'weight', 'stress'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMetric(m)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${metric === m
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {m === 'steps' ? '🏃 Steps' : m === 'sleep' ? '😴 Sleep' : m === 'weight' ? '⚖️ Weight' : '🧘 Stress'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quarterly Trend Chart */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📊 Quarterly Trends - {metric.charAt(0).toUpperCase() + metric.slice(1)}</h4>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="quarter" stroke="#888" fontSize={11} angle={-45} textAnchor="end" height={60} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px' }}
                                formatter={(value: number) => [value.toLocaleString(), metric.charAt(0).toUpperCase() + metric.slice(1)]}
                            />
                            <Bar dataKey="value" fill={getMetricColor()} radius={[4, 4, 0, 0]}>
                                {metricData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getMetricColor()} fillOpacity={0.7 + (index / metricData.length) * 0.3} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Yearly Summary Cards */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">📅 Yearly Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {yearlyData.map((year) => (
                        <div key={year.year} className="bg-gray-700/30 rounded-lg p-4">
                            <p className="text-purple-400 font-bold text-lg">{year.year}</p>
                            <div className="space-y-1 mt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Steps/day</span>
                                    <span className="text-white">{year.avgSteps.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Sleep</span>
                                    <span className="text-white">{year.avgSleep}h</span>
                                </div>
                                {year.avgWeight && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Weight</span>
                                        <span className="text-white">{year.avgWeight}kg</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Days</span>
                                    <span className="text-gray-500">{year.daysTracked}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All-Time Records */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-4">🏆 All-Time Totals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-300 text-xs uppercase">Total Steps</p>
                        <p className="text-white text-2xl font-bold">{(allTimeStats.totalSteps / 1000000).toFixed(1)}M</p>
                        <p className="text-gray-500 text-xs">{allTimeStats.totalSteps.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <p className="text-cyan-300 text-xs uppercase">Total Distance</p>
                        <p className="text-white text-2xl font-bold">{allTimeStats.totalDistance.toLocaleString()} km</p>
                        <p className="text-gray-500 text-xs">{(allTimeStats.totalDistance / 1.609).toFixed(0)} miles</p>
                    </div>
                    <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-300 text-xs uppercase">Total Calories</p>
                        <p className="text-white text-2xl font-bold">{(allTimeStats.totalCalories / 1000).toFixed(0)}k</p>
                        <p className="text-gray-500 text-xs">{allTimeStats.totalCalories.toLocaleString()} kcal</p>
                    </div>
                    <div className="text-center p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                        <p className="text-pink-300 text-xs uppercase">HR Readings</p>
                        <p className="text-white text-2xl font-bold">{(allTimeStats.totalHRReadings / 1000).toFixed(0)}k</p>
                        <p className="text-gray-500 text-xs">{allTimeStats.totalHRReadings.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Best Years */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-5 border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-3">🥇 Best Activity Year</h4>
                    <p className="text-white text-3xl font-bold">{bestStepsYear?.year}</p>
                    <p className="text-gray-400">
                        Avg {bestStepsYear?.avgSteps.toLocaleString()} steps/day over {bestStepsYear?.daysTracked} days
                    </p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-5 border border-blue-500/30">
                    <h4 className="text-blue-400 font-semibold mb-3">🥇 Best Sleep Year</h4>
                    <p className="text-white text-3xl font-bold">{bestSleepYear?.year}</p>
                    <p className="text-gray-400">
                        Avg {bestSleepYear?.avgSleep}h sleep per night
                    </p>
                </div>
            </div>

            {/* Weight Journey */}
            {bodyAnalytics.totalMeasurements > 0 && (
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50">
                    <h4 className="text-white font-semibold mb-4">⚖️ Long-Term Weight Journey</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-gray-400 text-xs">First Record</p>
                            <p className="text-white text-xl font-bold">{bodyAnalytics.startWeight}kg</p>
                            <p className="text-gray-500 text-xs">{allTimeStats.dateRange.body.start}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Current</p>
                            <p className="text-white text-xl font-bold">{bodyAnalytics.currentWeight}kg</p>
                            <p className="text-gray-500 text-xs">{allTimeStats.dateRange.body.end}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Total Change</p>
                            <p className={`text-xl font-bold ${bodyAnalytics.weightChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {bodyAnalytics.weightChange > 0 ? '+' : ''}{bodyAnalytics.weightChange}kg
                            </p>
                            <p className="text-gray-500 text-xs">{bodyAnalytics.weightChangePercent}%</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Measurements</p>
                            <p className="text-purple-400 text-xl font-bold">{bodyAnalytics.totalMeasurements}</p>
                            <p className="text-gray-500 text-xs">records</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Coverage */}
            <div className="text-center text-gray-500 text-sm">
                Data spans from {allTimeStats.dateRange.activity.start} to {allTimeStats.dateRange.activity.end} •
                {activityAnalytics.totalDays} days of activity tracked
            </div>
        </div>
    );
}
