'use client';

import { useState } from 'react';
import type { ActivityData, SleepData, BodyData, UserData } from '@/types/zepp';
import ActivityChart from '@/components/charts/ActivityChart';
import SleepChart from '@/components/charts/SleepChart';
import BodyChart from '@/components/charts/BodyChart';
import StatCard from '@/components/ui/StatCard';
import AIChatPanel from '@/components/AIChatPanel';

interface DashboardProps {
    user: UserData | null;
    activity: ActivityData[];
    sleep: SleepData[];
    body: BodyData[];
    stats: {
        avgSteps: number;
        avgSleep: number;
        totalCaloriesWeek: number;
        workoutsThisMonth: number;
        todaySteps: number;
        todayCalories: number;
        latestWeight: number;
        latestBmi: number;
    };
}

type TabType = 'activity' | 'sleep' | 'body';

export default function Dashboard({ user, activity, sleep, body, stats }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('activity');

    const tabs: { id: TabType; name: string; icon: string }[] = [
        { id: 'activity', name: 'Activity', icon: '🏃' },
        { id: 'sleep', name: 'Sleep', icon: '😴' },
        { id: 'body', name: 'Body', icon: '⚖️' },
    ];

    return (
        <main className="min-h-screen pb-20">
            {/* Header */}
            <header className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {user?.avatar && (
                                <img
                                    src={user.avatar}
                                    alt={user.nickName}
                                    className="w-12 h-12 rounded-full border-2 border-purple-500/50"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">
                                    <span className="gradient-text">Zepp</span>{' '}
                                    <span className="text-white">Health Viewer</span>
                                </h1>
                                {user && (
                                    <p className="text-gray-400 text-sm">
                                        Welcome back, {user.nickName}!
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Total Records</p>
                            <p className="text-white font-semibold">
                                {activity.length + sleep.length + body.length}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Avg Steps (7d)"
                        value={stats.avgSteps.toLocaleString()}
                        subtitle="per day"
                        icon={<span className="text-2xl">👟</span>}
                    />
                    <StatCard
                        title="Avg Sleep (7d)"
                        value={`${(stats.avgSleep / 60).toFixed(1)}h`}
                        subtitle="per night"
                        icon={<span className="text-2xl">🌙</span>}
                    />
                    <StatCard
                        title="Calories (7d)"
                        value={stats.totalCaloriesWeek.toLocaleString()}
                        subtitle="kcal burned"
                        icon={<span className="text-2xl">🔥</span>}
                    />
                    <StatCard
                        title="Weight"
                        value={`${stats.latestWeight.toFixed(1)} kg`}
                        subtitle={`BMI: ${stats.latestBmi.toFixed(1)}`}
                        icon={<span className="text-2xl">⚖️</span>}
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {activeTab === 'activity' && '📊 Activity Trends (Last 30 Days)'}
                        {activeTab === 'sleep' && '💤 Sleep Patterns (Last 30 Days)'}
                        {activeTab === 'body' && '📈 Body Composition Trends'}
                    </h2>

                    {activeTab === 'activity' && (
                        <>
                            <ActivityChart data={activity} showCalories />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/50">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Today&apos;s Steps</p>
                                    <p className="text-2xl font-bold text-white">{stats.todaySteps.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Today&apos;s Calories</p>
                                    <p className="text-2xl font-bold text-white">{stats.todayCalories} kcal</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Total Days Tracked</p>
                                    <p className="text-2xl font-bold text-white">{activity.length}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'sleep' && (
                        <>
                            <SleepChart data={sleep} />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/50">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Avg Deep Sleep</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {sleep.length > 0
                                            ? `${(sleep.slice(-7).reduce((sum, d) => sum + d.deepSleepTime, 0) / 7 / 60).toFixed(1)}h`
                                            : '0h'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Avg REM Sleep</p>
                                    <p className="text-2xl font-bold text-pink-400">
                                        {sleep.length > 0
                                            ? `${(sleep.slice(-7).reduce((sum, d) => sum + d.REMTime, 0) / 7 / 60).toFixed(1)}h`
                                            : '0h'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Nights Tracked</p>
                                    <p className="text-2xl font-bold text-white">{sleep.length}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'body' && (
                        <>
                            <BodyChart data={body} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700/50">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Current Weight</p>
                                    <p className="text-2xl font-bold text-white">{stats.latestWeight.toFixed(1)} kg</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">BMI</p>
                                    <p className="text-2xl font-bold text-green-400">{stats.latestBmi.toFixed(1)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Height</p>
                                    <p className="text-2xl font-bold text-white">{user?.height || body[0]?.height || 'N/A'} cm</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">Measurements</p>
                                    <p className="text-2xl font-bold text-white">{body.length}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* AI Chat Panel */}
            <AIChatPanel />
        </main>
    );
}
