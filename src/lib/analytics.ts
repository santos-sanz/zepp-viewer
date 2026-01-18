import type { ActivityData, SleepData, BodyData } from '@/types/zepp';

// Statistical utility functions
function calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = calculateMean(values);
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

function calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function calculateTrend(values: number[]): { slope: number; direction: 'up' | 'down' | 'stable'; percentChange: number } {
    if (values.length < 2) return { slope: 0, direction: 'stable', percentChange: 0 };

    // Simple linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = calculateMean(values);

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (values[i] - yMean);
        denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const percentChange = yMean !== 0 ? ((slope * n) / yMean) * 100 : 0;

    return {
        slope,
        direction: Math.abs(percentChange) < 3 ? 'stable' : slope > 0 ? 'up' : 'down',
        percentChange,
    };
}

function calculateConsistency(values: number[]): number {
    // Coefficient of variation (lower = more consistent)
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);
    if (mean === 0) return 0;
    return 100 - Math.min((stdDev / mean) * 100, 100);
}

// Activity Analytics
export interface ActivityAnalytics {
    // Basic Stats
    totalDays: number;
    totalSteps: number;
    totalDistance: number; // km
    totalCalories: number;

    // Averages
    avgDailySteps: number;
    avgDailyDistance: number; // km
    avgDailyCalories: number;

    // Variability
    stdDevSteps: number;
    consistencyScore: number; // 0-100

    // Percentiles (for benchmarking)
    p25Steps: number;
    p50Steps: number; // median
    p75Steps: number;
    p90Steps: number;
    p95Steps: number;

    // Records
    bestDay: { date: string; steps: number };
    worstActiveDay: { date: string; steps: number };

    // Trends (7-day, 30-day)
    trend7d: { direction: 'up' | 'down' | 'stable'; percentChange: number };
    trend30d: { direction: 'up' | 'down' | 'stable'; percentChange: number };

    // Streaks
    currentStreak: number; // days above goal
    longestStreak: number;

    // Distribution
    daysAbove10k: number;
    daysAbove5k: number;
    daysBelow2k: number;

    // Weekly patterns
    avgByDayOfWeek: Record<string, number>;
    mostActiveDay: string;
    leastActiveDay: string;

    // Monthly progression
    monthlyAverages: { month: string; avgSteps: number }[];
}

export function calculateActivityAnalytics(data: ActivityData[], stepGoal = 10000): ActivityAnalytics {
    const activeData = data.filter((d) => d.steps > 0);
    const steps = activeData.map((d) => d.steps);
    const distances = activeData.map((d) => d.distance / 1000); // km
    const calories = activeData.map((d) => d.calories);

    // Calculate trends
    const last7 = steps.slice(-7);
    const last30 = steps.slice(-30);

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = activeData.length - 1; i >= 0; i--) {
        if (activeData[i].steps >= stepGoal) {
            tempStreak++;
            if (i === activeData.length - 1) currentStreak = tempStreak;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
            if (i === activeData.length - 1) currentStreak = 0;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek: Record<string, number[]> = {};
    dayNames.forEach((d) => (byDayOfWeek[d] = []));

    activeData.forEach((d) => {
        const dayOfWeek = new Date(d.date).getDay();
        byDayOfWeek[dayNames[dayOfWeek]].push(d.steps);
    });

    const avgByDayOfWeek: Record<string, number> = {};
    let maxAvg = 0, minAvg = Infinity;
    let mostActiveDay = '', leastActiveDay = '';

    dayNames.forEach((day) => {
        const avg = calculateMean(byDayOfWeek[day]);
        avgByDayOfWeek[day] = Math.round(avg);
        if (avg > maxAvg) { maxAvg = avg; mostActiveDay = day; }
        if (avg < minAvg && byDayOfWeek[day].length > 0) { minAvg = avg; leastActiveDay = day; }
    });

    // Monthly averages
    const byMonth: Record<string, number[]> = {};
    activeData.forEach((d) => {
        const month = d.date.substring(0, 7); // YYYY-MM
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(d.steps);
    });

    const monthlyAverages = Object.entries(byMonth)
        .map(([month, values]) => ({
            month,
            avgSteps: Math.round(calculateMean(values)),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // last 12 months

    const sortedBySteps = [...activeData].sort((a, b) => b.steps - a.steps);

    return {
        totalDays: activeData.length,
        totalSteps: steps.reduce((sum, v) => sum + v, 0),
        totalDistance: Math.round(distances.reduce((sum, v) => sum + v, 0) * 10) / 10,
        totalCalories: calories.reduce((sum, v) => sum + v, 0),

        avgDailySteps: Math.round(calculateMean(steps)),
        avgDailyDistance: Math.round(calculateMean(distances) * 10) / 10,
        avgDailyCalories: Math.round(calculateMean(calories)),

        stdDevSteps: Math.round(calculateStdDev(steps)),
        consistencyScore: Math.round(calculateConsistency(steps)),

        p25Steps: Math.round(calculatePercentile(steps, 25)),
        p50Steps: Math.round(calculatePercentile(steps, 50)),
        p75Steps: Math.round(calculatePercentile(steps, 75)),
        p90Steps: Math.round(calculatePercentile(steps, 90)),
        p95Steps: Math.round(calculatePercentile(steps, 95)),

        bestDay: { date: sortedBySteps[0]?.date || '', steps: sortedBySteps[0]?.steps || 0 },
        worstActiveDay: { date: sortedBySteps[sortedBySteps.length - 1]?.date || '', steps: sortedBySteps[sortedBySteps.length - 1]?.steps || 0 },

        trend7d: calculateTrend(last7),
        trend30d: calculateTrend(last30),

        currentStreak,
        longestStreak,

        daysAbove10k: steps.filter((s) => s >= 10000).length,
        daysAbove5k: steps.filter((s) => s >= 5000).length,
        daysBelow2k: steps.filter((s) => s < 2000).length,

        avgByDayOfWeek,
        mostActiveDay,
        leastActiveDay,
        monthlyAverages,
    };
}

// Sleep Analytics
export interface SleepAnalytics {
    totalNights: number;

    // Duration averages (in hours)
    avgTotalSleep: number;
    avgDeepSleep: number;
    avgLightSleep: number;
    avgRemSleep: number;
    avgWakeTime: number;

    // Sleep architecture (percentages)
    deepSleepPercent: number;
    lightSleepPercent: number;
    remSleepPercent: number;
    wakePercent: number;

    // Sleep efficiency estimate
    sleepEfficiency: number; // (sleep time / time in bed) * 100

    // Variability
    stdDevTotalSleep: number;
    consistencyScore: number;

    // Percentiles
    p25TotalSleep: number;
    p50TotalSleep: number;
    p75TotalSleep: number;

    // Records
    bestNight: { date: string; totalMinutes: number };
    shortestNight: { date: string; totalMinutes: number };

    // Trends
    trend7d: { direction: 'up' | 'down' | 'stable'; percentChange: number };
    trend30d: { direction: 'up' | 'down' | 'stable'; percentChange: number };

    // Sleep debt analysis
    recommendedSleep: number; // hours
    avgSleepDebt: number; // hours below recommended
    nightsUnderRecommended: number;

    // Weekly patterns
    avgByDayOfWeek: Record<string, number>;
    bestSleepDay: string;
    worstSleepDay: string;

    // Bedtime analysis
    avgBedtime: string;
    avgWakeTime: string;

    // Monthly progression
    monthlyAverages: { month: string; avgHours: number }[];
}

export function calculateSleepAnalytics(data: SleepData[], recommendedHours = 7.5): SleepAnalytics {
    const validData = data.filter((d) => d.deepSleepTime > 0 || d.shallowSleepTime > 0);

    const totals = validData.map((d) => d.deepSleepTime + d.shallowSleepTime + d.REMTime);
    const deepTimes = validData.map((d) => d.deepSleepTime);
    const lightTimes = validData.map((d) => d.shallowSleepTime);
    const remTimes = validData.map((d) => d.REMTime);
    const wakeTimes = validData.map((d) => d.wakeTime);

    const avgTotal = calculateMean(totals);
    const avgDeep = calculateMean(deepTimes);
    const avgLight = calculateMean(lightTimes);
    const avgRem = calculateMean(remTimes);
    const avgWake = calculateMean(wakeTimes);

    // Calculate bedtime/wake time averages
    const bedtimes = validData.map((d) => {
        const match = d.start.match(/(\d{2}):(\d{2})/);
        if (!match) return 0;
        let hours = parseInt(match[1]);
        const mins = parseInt(match[2]);
        // Adjust for times after midnight
        if (hours < 12) hours += 24;
        return hours * 60 + mins;
    }).filter((t) => t > 0);

    const wakeTimesOfDay = validData.map((d) => {
        const match = d.stop.match(/(\d{2}):(\d{2})/);
        if (!match) return 0;
        return parseInt(match[1]) * 60 + parseInt(match[2]);
    }).filter((t) => t > 0);

    const avgBedtimeMins = calculateMean(bedtimes) % (24 * 60);
    const avgWakeTimeMins = calculateMean(wakeTimesOfDay);

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60) % 24;
        const m = Math.round(mins % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Weekly patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek: Record<string, number[]> = {};
    dayNames.forEach((d) => (byDayOfWeek[d] = []));

    validData.forEach((d) => {
        const dayOfWeek = new Date(d.date).getDay();
        const total = d.deepSleepTime + d.shallowSleepTime + d.REMTime;
        byDayOfWeek[dayNames[dayOfWeek]].push(total);
    });

    const avgByDayOfWeek: Record<string, number> = {};
    let maxAvg = 0, minAvg = Infinity;
    let bestSleepDay = '', worstSleepDay = '';

    dayNames.forEach((day) => {
        const avg = calculateMean(byDayOfWeek[day]);
        avgByDayOfWeek[day] = Math.round(avg);
        if (avg > maxAvg && byDayOfWeek[day].length > 0) { maxAvg = avg; bestSleepDay = day; }
        if (avg < minAvg && byDayOfWeek[day].length > 0) { minAvg = avg; worstSleepDay = day; }
    });

    // Monthly averages
    const byMonth: Record<string, number[]> = {};
    validData.forEach((d) => {
        const month = d.date.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(d.deepSleepTime + d.shallowSleepTime + d.REMTime);
    });

    const monthlyAverages = Object.entries(byMonth)
        .map(([month, values]) => ({
            month,
            avgHours: Math.round(calculateMean(values) / 60 * 10) / 10,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

    const sortedByTotal = validData.map((d, i) => ({
        ...d,
        total: totals[i],
    })).sort((a, b) => b.total - a.total);

    const recommendedMins = recommendedHours * 60;
    const sleepDebts = totals.map((t) => Math.max(0, recommendedMins - t));

    const last7 = totals.slice(-7);
    const last30 = totals.slice(-30);

    return {
        totalNights: validData.length,

        avgTotalSleep: Math.round(avgTotal / 60 * 10) / 10,
        avgDeepSleep: Math.round(avgDeep / 60 * 10) / 10,
        avgLightSleep: Math.round(avgLight / 60 * 10) / 10,
        avgRemSleep: Math.round(avgRem / 60 * 10) / 10,
        avgWakeTime: Math.round(avgWake),

        deepSleepPercent: avgTotal > 0 ? Math.round((avgDeep / avgTotal) * 100) : 0,
        lightSleepPercent: avgTotal > 0 ? Math.round((avgLight / avgTotal) * 100) : 0,
        remSleepPercent: avgTotal > 0 ? Math.round((avgRem / avgTotal) * 100) : 0,
        wakePercent: avgTotal > 0 ? Math.round((avgWake / (avgTotal + avgWake)) * 100) : 0,

        sleepEfficiency: avgTotal > 0 ? Math.round((avgTotal / (avgTotal + avgWake)) * 100) : 0,

        stdDevTotalSleep: Math.round(calculateStdDev(totals) / 60 * 10) / 10,
        consistencyScore: Math.round(calculateConsistency(totals)),

        p25TotalSleep: Math.round(calculatePercentile(totals, 25) / 60 * 10) / 10,
        p50TotalSleep: Math.round(calculatePercentile(totals, 50) / 60 * 10) / 10,
        p75TotalSleep: Math.round(calculatePercentile(totals, 75) / 60 * 10) / 10,

        bestNight: { date: sortedByTotal[0]?.date || '', totalMinutes: sortedByTotal[0]?.total || 0 },
        shortestNight: { date: sortedByTotal[sortedByTotal.length - 1]?.date || '', totalMinutes: sortedByTotal[sortedByTotal.length - 1]?.total || 0 },

        trend7d: calculateTrend(last7),
        trend30d: calculateTrend(last30),

        recommendedSleep: recommendedHours,
        avgSleepDebt: Math.round(calculateMean(sleepDebts) / 60 * 10) / 10,
        nightsUnderRecommended: sleepDebts.filter((d) => d > 0).length,

        avgByDayOfWeek,
        bestSleepDay,
        worstSleepDay,

        avgBedtime: formatTime(avgBedtimeMins),
        avgWakeTime: formatTime(avgWakeTimeMins),

        monthlyAverages,
    };
}

// Body Analytics
export interface BodyAnalytics {
    totalMeasurements: number;
    dateRange: { start: string; end: string };

    // Current vs historical
    currentWeight: number;
    startWeight: number;
    weightChange: number;
    weightChangePercent: number;

    currentBmi: number;
    bmiCategory: string;

    // Averages
    avgWeight: number;
    avgBmi: number;

    // Variability
    stdDevWeight: number;
    minWeight: number;
    maxWeight: number;
    weightRange: number;

    // Trends
    trend30d: { direction: 'up' | 'down' | 'stable'; percentChange: number };
    trend90d: { direction: 'up' | 'down' | 'stable'; percentChange: number };

    // Body composition (if available)
    latestFatRate: number | null;
    latestMuscleRate: number | null;
    latestMetabolism: number | null;
    latestVisceralFat: number | null;

    // Monthly progression
    monthlyAverages: { month: string; avgWeight: number; avgBmi: number }[];

    // Rate of change
    weightChangePerWeek: number; // kg per week (recent)
}

function getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese Class I';
    if (bmi < 40) return 'Obese Class II';
    return 'Obese Class III';
}

export function calculateBodyAnalytics(data: BodyData[]): BodyAnalytics {
    const validData = data.filter((d) => d.weight > 0).sort((a, b) =>
        new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const weights = validData.map((d) => d.weight);
    const bmis = validData.filter((d) => d.bmi > 0).map((d) => d.bmi);

    const latest = validData[validData.length - 1];
    const first = validData[0];

    // Rate of change (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentData = validData.filter((d) => new Date(d.time) >= fourWeeksAgo);
    let weightChangePerWeek = 0;
    if (recentData.length >= 2) {
        const firstRecent = recentData[0].weight;
        const lastRecent = recentData[recentData.length - 1].weight;
        const daysDiff = (new Date(recentData[recentData.length - 1].time).getTime() -
            new Date(recentData[0].time).getTime()) / (1000 * 60 * 60 * 24);
        weightChangePerWeek = daysDiff > 0 ? ((lastRecent - firstRecent) / daysDiff) * 7 : 0;
    }

    // Monthly averages
    const byMonth: Record<string, { weights: number[]; bmis: number[] }> = {};
    validData.forEach((d) => {
        const month = d.time.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { weights: [], bmis: [] };
        byMonth[month].weights.push(d.weight);
        if (d.bmi > 0) byMonth[month].bmis.push(d.bmi);
    });

    const monthlyAverages = Object.entries(byMonth)
        .map(([month, { weights, bmis }]) => ({
            month,
            avgWeight: Math.round(calculateMean(weights) * 10) / 10,
            avgBmi: Math.round(calculateMean(bmis) * 10) / 10,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

    const last30Weights = weights.slice(-30);
    const last90Weights = weights.slice(-90);

    // Find latest body composition data
    const latestWithComposition = [...validData]
        .reverse()
        .find((d) => d.fatRate !== null && d.fatRate > 0);

    return {
        totalMeasurements: validData.length,
        dateRange: {
            start: first?.time.split(' ')[0] || '',
            end: latest?.time.split(' ')[0] || '',
        },

        currentWeight: latest?.weight || 0,
        startWeight: first?.weight || 0,
        weightChange: Math.round(((latest?.weight || 0) - (first?.weight || 0)) * 10) / 10,
        weightChangePercent: first?.weight ? Math.round(((latest.weight - first.weight) / first.weight) * 1000) / 10 : 0,

        currentBmi: latest?.bmi || 0,
        bmiCategory: getBmiCategory(latest?.bmi || 0),

        avgWeight: Math.round(calculateMean(weights) * 10) / 10,
        avgBmi: Math.round(calculateMean(bmis) * 10) / 10,

        stdDevWeight: Math.round(calculateStdDev(weights) * 10) / 10,
        minWeight: Math.min(...weights),
        maxWeight: Math.max(...weights),
        weightRange: Math.round((Math.max(...weights) - Math.min(...weights)) * 10) / 10,

        trend30d: calculateTrend(last30Weights),
        trend90d: calculateTrend(last90Weights),

        latestFatRate: latestWithComposition?.fatRate || null,
        latestMuscleRate: latestWithComposition?.muscleRate || null,
        latestMetabolism: latestWithComposition?.metabolism || null,
        latestVisceralFat: latestWithComposition?.visceralFat || null,

        monthlyAverages,
        weightChangePerWeek: Math.round(weightChangePerWeek * 100) / 100,
    };
}
