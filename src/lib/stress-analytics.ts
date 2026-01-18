import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'personal_data');

interface HeartRateReadingRaw {
    date: string;
    time: string;
    heartRate: number;
}

export interface HeartRateReading {
    date: string;
    time: string;
    heartRate: number;
    timestamp: Date;
}

export function loadHeartRateAutoData(): HeartRateReading[] {
    const folderPath = path.join(DATA_DIR, 'HEARTRATE_AUTO');
    if (!fs.existsSync(folderPath)) return [];

    const files = fs.readdirSync(folderPath);
    const csvFile = files.find((f) => f.endsWith('.csv'));
    if (!csvFile) return [];

    const content = fs.readFileSync(path.join(folderPath, csvFile), 'utf-8');
    const result = Papa.parse<HeartRateReadingRaw>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    return result.data
        .filter((d) => d.heartRate > 0)
        .map((d) => ({
            ...d,
            timestamp: new Date(`${d.date}T${d.time}:00`),
        }));
}

// Stress Analytics Types
export interface StressAnalytics {
    totalReadings: number;
    dateRange: { start: string; end: string };

    // Resting Heart Rate Analysis
    avgRestingHR: number;
    minRestingHR: number;
    maxRestingHR: number;
    restingHRTrend: { direction: 'up' | 'down' | 'stable'; percentChange: number };

    // Heart Rate Zones (approximate stress levels)
    zoneDistribution: {
        relaxed: number;     // < 60 bpm  
        normal: number;      // 60-80 bpm
        elevated: number;    // 80-100 bpm
        high: number;        // 100-120 bpm
        veryHigh: number;    // > 120 bpm
    };

    // Stress Score (derived from HRV proxy)
    avgStressScore: number;  // 0-100, higher = more stressed
    stressLevel: 'Low' | 'Moderate' | 'High' | 'Very High';

    // HRV Proxy (SDNN estimation from consecutive readings)
    estimatedHRV: number;   // ms, higher = better  
    hrvCategory: 'Poor' | 'Below Average' | 'Average' | 'Good' | 'Excellent';

    // Daily patterns
    avgHRByHour: Record<number, number>;
    peakStressHour: number;
    lowestStressHour: number;

    // Weekly patterns
    avgHRByDayOfWeek: Record<string, number>;
    mostStressfulDay: string;
    leastStressfulDay: string;

    // Recovery analysis (sleep hours HR)
    avgSleepHR: number;
    avgDaytimeHR: number;
    recoveryScore: number;  // 0-100, sleep HR vs daytime difference

    // Peaks and anomalies
    highHREvents: number;   // HR > 100 during non-active periods
    daysWithHighStress: number;

    // Monthly trends
    monthlyAvgHR: { month: string; avgHR: number; stressScore: number }[];
}

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

function calculateTrend(values: number[]): { direction: 'up' | 'down' | 'stable'; percentChange: number } {
    if (values.length < 2) return { direction: 'stable', percentChange: 0 };
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
        direction: Math.abs(percentChange) < 3 ? 'stable' : slope > 0 ? 'up' : 'down',
        percentChange,
    };
}

function getHRVCategory(hrv: number): 'Poor' | 'Below Average' | 'Average' | 'Good' | 'Excellent' {
    // Based on general population HRV ranges (SDNN in ms)
    if (hrv < 20) return 'Poor';
    if (hrv < 40) return 'Below Average';
    if (hrv < 60) return 'Average';
    if (hrv < 100) return 'Good';
    return 'Excellent';
}

function getStressLevel(score: number): 'Low' | 'Moderate' | 'High' | 'Very High' {
    if (score < 25) return 'Low';
    if (score < 50) return 'Moderate';
    if (score < 75) return 'High';
    return 'Very High';
}

export function calculateStressAnalytics(data: HeartRateReading[]): StressAnalytics {
    if (data.length === 0) {
        return {
            totalReadings: 0,
            dateRange: { start: '', end: '' },
            avgRestingHR: 0,
            minRestingHR: 0,
            maxRestingHR: 0,
            restingHRTrend: { direction: 'stable', percentChange: 0 },
            zoneDistribution: { relaxed: 0, normal: 0, elevated: 0, high: 0, veryHigh: 0 },
            avgStressScore: 0,
            stressLevel: 'Low',
            estimatedHRV: 0,
            hrvCategory: 'Average',
            avgHRByHour: {},
            peakStressHour: 12,
            lowestStressHour: 4,
            avgHRByDayOfWeek: {},
            mostStressfulDay: '',
            leastStressfulDay: '',
            avgSleepHR: 0,
            avgDaytimeHR: 0,
            recoveryScore: 0,
            highHREvents: 0,
            daysWithHighStress: 0,
            monthlyAvgHR: [],
        };
    }

    const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const allHRs = sorted.map((d) => d.heartRate);

    // Resting HR estimation (lowest 10% of readings, exclude exercise)
    const sortedByHR = [...allHRs].sort((a, b) => a - b);
    const restingHRs = sortedByHR.slice(0, Math.floor(sortedByHR.length * 0.1));

    // Zone distribution
    const zones = { relaxed: 0, normal: 0, elevated: 0, high: 0, veryHigh: 0 };
    allHRs.forEach((hr) => {
        if (hr < 60) zones.relaxed++;
        else if (hr < 80) zones.normal++;
        else if (hr < 100) zones.elevated++;
        else if (hr < 120) zones.high++;
        else zones.veryHigh++;
    });
    const totalZone = allHRs.length;
    const zoneDistribution = {
        relaxed: Math.round((zones.relaxed / totalZone) * 100),
        normal: Math.round((zones.normal / totalZone) * 100),
        elevated: Math.round((zones.elevated / totalZone) * 100),
        high: Math.round((zones.high / totalZone) * 100),
        veryHigh: Math.round((zones.veryHigh / totalZone) * 100),
    };

    // HRV estimation (RMSSD-like from consecutive differences)
    const consecutiveDiffs: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
        const timeDiff = (sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime()) / 1000 / 60;
        // Only use consecutive readings (within 2 minutes)
        if (timeDiff <= 2 && timeDiff > 0) {
            const rrDiff = Math.abs(
                (60000 / sorted[i].heartRate) - (60000 / sorted[i - 1].heartRate)
            );
            consecutiveDiffs.push(rrDiff);
        }
    }
    const estimatedHRV = Math.round(calculateMean(consecutiveDiffs));

    // Stress score (inverse of HRV, normalized to 0-100)
    // Higher HR and lower HRV = higher stress
    const avgHR = calculateMean(allHRs);
    const hrComponent = Math.min(((avgHR - 50) / 70) * 50, 50); // HR contribution
    const hrvComponent = Math.max(50 - (estimatedHRV / 2), 0); // HRV contribution (inverse)
    const avgStressScore = Math.round(Math.min(hrComponent + hrvComponent, 100));

    // Hourly patterns
    const byHour: Record<number, number[]> = {};
    for (let i = 0; i < 24; i++) byHour[i] = [];
    sorted.forEach((d) => {
        const hour = d.timestamp.getHours();
        byHour[hour].push(d.heartRate);
    });
    const avgHRByHour: Record<number, number> = {};
    let maxHourAvg = 0, minHourAvg = 200;
    let peakStressHour = 12, lowestStressHour = 4;
    for (let h = 0; h < 24; h++) {
        const avg = calculateMean(byHour[h]);
        avgHRByHour[h] = Math.round(avg);
        if (avg > maxHourAvg && byHour[h].length > 0) { maxHourAvg = avg; peakStressHour = h; }
        if (avg < minHourAvg && byHour[h].length > 0) { minHourAvg = avg; lowestStressHour = h; }
    }

    // Weekly patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDayOfWeek: Record<string, number[]> = {};
    dayNames.forEach((d) => (byDayOfWeek[d] = []));
    sorted.forEach((d) => {
        const dayOfWeek = d.timestamp.getDay();
        byDayOfWeek[dayNames[dayOfWeek]].push(d.heartRate);
    });
    const avgHRByDayOfWeek: Record<string, number> = {};
    let maxDayAvg = 0, minDayAvg = 200;
    let mostStressfulDay = '', leastStressfulDay = '';
    dayNames.forEach((day) => {
        const avg = calculateMean(byDayOfWeek[day]);
        avgHRByDayOfWeek[day] = Math.round(avg);
        if (avg > maxDayAvg && byDayOfWeek[day].length > 0) { maxDayAvg = avg; mostStressfulDay = day; }
        if (avg < minDayAvg && byDayOfWeek[day].length > 0) { minDayAvg = avg; leastStressfulDay = day; }
    });

    // Sleep vs daytime HR (sleep = 23:00-07:00)
    const sleepHRs = sorted
        .filter((d) => d.timestamp.getHours() >= 23 || d.timestamp.getHours() < 7)
        .map((d) => d.heartRate);
    const daytimeHRs = sorted
        .filter((d) => d.timestamp.getHours() >= 9 && d.timestamp.getHours() < 21)
        .map((d) => d.heartRate);
    const avgSleepHR = Math.round(calculateMean(sleepHRs));
    const avgDaytimeHR = Math.round(calculateMean(daytimeHRs));
    const recoveryScore = avgDaytimeHR > 0
        ? Math.round(Math.min(((avgDaytimeHR - avgSleepHR) / avgDaytimeHR) * 100 * 2, 100))
        : 0;

    // High HR events (>100 during non-active hours, 00:00-06:00)
    const nightHighHR = sorted.filter((d) => {
        const hour = d.timestamp.getHours();
        return hour >= 0 && hour < 6 && d.heartRate > 100;
    });

    // Days with high stress (avg HR > 85)
    const byDate: Record<string, number[]> = {};
    sorted.forEach((d) => {
        if (!byDate[d.date]) byDate[d.date] = [];
        byDate[d.date].push(d.heartRate);
    });
    const daysWithHighStress = Object.values(byDate).filter((hrs) =>
        calculateMean(hrs) > 85
    ).length;

    // Monthly trends
    const byMonth: Record<string, number[]> = {};
    sorted.forEach((d) => {
        const month = d.date.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(d.heartRate);
    });
    const monthlyAvgHR = Object.entries(byMonth)
        .map(([month, hrs]) => {
            const avg = calculateMean(hrs);
            const score = Math.round(Math.min(((avg - 50) / 50) * 100, 100));
            return { month, avgHR: Math.round(avg), stressScore: Math.max(0, score) };
        })
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

    // Resting HR trend (last 30 days of daily minimums)
    const dailyMins = Object.entries(byDate)
        .map(([, hrs]) => Math.min(...hrs))
        .slice(-30);

    return {
        totalReadings: data.length,
        dateRange: {
            start: sorted[0].date,
            end: sorted[sorted.length - 1].date,
        },
        avgRestingHR: Math.round(calculateMean(restingHRs)),
        minRestingHR: Math.min(...restingHRs),
        maxRestingHR: Math.max(...restingHRs),
        restingHRTrend: calculateTrend(dailyMins),
        zoneDistribution,
        avgStressScore,
        stressLevel: getStressLevel(avgStressScore),
        estimatedHRV,
        hrvCategory: getHRVCategory(estimatedHRV),
        avgHRByHour,
        peakStressHour,
        lowestStressHour,
        avgHRByDayOfWeek,
        mostStressfulDay,
        leastStressfulDay,
        avgSleepHR,
        avgDaytimeHR,
        recoveryScore,
        highHREvents: nightHighHR.length,
        daysWithHighStress,
        monthlyAvgHR,
    };
}
