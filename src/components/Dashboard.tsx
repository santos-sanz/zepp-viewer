'use client';

import { useState } from 'react';
import type { ActivityData, SleepData, BodyData, UserData } from '@/types/zepp';
import type { ActivityAnalytics, SleepAnalytics, BodyAnalytics } from '@/lib/analytics';
import ActivityChart from '@/components/charts/ActivityChart';
import SleepChart from '@/components/charts/SleepChart';
import BodyChart from '@/components/charts/BodyChart';
import ActivityDetails from '@/components/details/ActivityDetails';
import SleepDetails from '@/components/details/SleepDetails';
import BodyDetails from '@/components/details/BodyDetails';
import AIChatPanel from '@/components/AIChatPanel';

interface DashboardProps {
    user: UserData | null;
    activity: ActivityData[];
    sleep: SleepData[];
    body: BodyData[];
    activityAnalytics: ActivityAnalytics;
    sleepAnalytics: SleepAnalytics;
    bodyAnalytics: BodyAnalytics;
}

type TabType = 'activity' | 'sleep' | 'body';

export default function Dashboard({
    user,
    activity,
    sleep,
    body,
    activityAnalytics,
    sleepAnalytics,
    bodyAnalytics,
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('activity');
    const [showDetails, setShowDetails] = useState(true);

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
                                    <span className="text-white">Health Analytics</span>
                                </h1>
                                {user && (
                                    <p className="text-gray-400 text-sm">
                                        {user.nickName} • {user.height}cm • Expert View
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showDetails
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {showDetails ? '📊 Expert View' : '📈 Simple View'}
                            </button>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Total Records</p>
                                <p className="text-white font-semibold">
                                    {activity.length + sleep.length + body.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-300 text-xs uppercase tracking-wide">Avg Steps</p>
                        <p className="text-2xl font-bold text-white">{activityAnalytics.avgDailySteps.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-300 text-xs uppercase tracking-wide">Avg Sleep</p>
                        <p className="text-2xl font-bold text-white">{sleepAnalytics.avgTotalSleep}h</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/20 border border-pink-500/30 rounded-xl p-4">
                        <p className="text-pink-300 text-xs uppercase tracking-wide">Sleep Efficiency</p>
                        <p className="text-2xl font-bold text-white">{sleepAnalytics.sleepEfficiency}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-300 text-xs uppercase tracking-wide">Weight</p>
                        <p className="text-2xl font-bold text-white">{bodyAnalytics.currentWeight}kg</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-300 text-xs uppercase tracking-wide">BMI</p>
                        <p className="text-2xl font-bold text-white">{bodyAnalytics.currentBmi.toFixed(1)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-300 text-xs uppercase tracking-wide">Consistency</p>
                        <p className="text-2xl font-bold text-white">{activityAnalytics.consistencyScore}%</p>
                    </div>
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
                            <span className="text-xs opacity-70">
                                ({tab.id === 'activity' ? activity.length : tab.id === 'sleep' ? sleep.length : body.length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {activeTab === 'activity' && '📊 Activity Trends (Last 30 Days)'}
                        {activeTab === 'sleep' && '💤 Sleep Patterns (Last 30 Days)'}
                        {activeTab === 'body' && '📈 Body Composition Trends'}
                    </h2>

                    {activeTab === 'activity' && <ActivityChart data={activity} showCalories />}
                    {activeTab === 'sleep' && <SleepChart data={sleep} />}
                    {activeTab === 'body' && <BodyChart data={body} />}
                </div>

                {/* Expert Details Section */}
                {showDetails && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                            <h3 className="text-lg font-semibold text-purple-400 px-4">Expert Analytics</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                        </div>

                        {activeTab === 'activity' && <ActivityDetails analytics={activityAnalytics} />}
                        {activeTab === 'sleep' && <SleepDetails analytics={sleepAnalytics} />}
                        {activeTab === 'body' && <BodyDetails analytics={bodyAnalytics} />}
                    </div>
                )}
            </div>

            {/* AI Chat Panel */}
            <AIChatPanel />
        </main>
    );
}
