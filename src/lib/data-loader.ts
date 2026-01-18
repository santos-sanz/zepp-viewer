import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type {
    ActivityData,
    SleepData,
    HeartRateData,
    SportData,
    BodyData,
    UserData,
} from '@/types/zepp';

const DATA_DIR = path.join(process.cwd(), 'personal_data');

function findCsvFile(folder: string): string | null {
    const folderPath = path.join(DATA_DIR, folder);
    if (!fs.existsSync(folderPath)) return null;

    const files = fs.readdirSync(folderPath);
    const csvFile = files.find((f) => f.endsWith('.csv'));
    return csvFile ? path.join(folderPath, csvFile) : null;
}

function parseCSV<T>(filePath: string): T[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = Papa.parse<T>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });
    return result.data;
}

export function loadActivityData(): ActivityData[] {
    const file = findCsvFile('ACTIVITY');
    if (!file) return [];

    const data = parseCSV<ActivityData>(file);
    // Filter out entries with zero or no data
    return data.filter((d) => d.steps > 0 || d.calories > 0);
}

export function loadSleepData(): SleepData[] {
    const file = findCsvFile('SLEEP');
    if (!file) return [];

    const data = parseCSV<SleepData>(file);
    // Filter out entries with no sleep recorded
    return data.filter((d) => d.deepSleepTime > 0 || d.shallowSleepTime > 0);
}

export function loadHeartRateData(): HeartRateData[] {
    // Use HEARTRATE_AUTO for more data points
    const file = findCsvFile('HEARTRATE_AUTO');
    if (!file) return [];

    return parseCSV<HeartRateData>(file);
}

export function loadSportData(): SportData[] {
    const file = findCsvFile('SPORT');
    if (!file) return [];

    const data = parseCSV<SportData>(file);
    // Rename fields from CSV format
    return data.map((d) => ({
        type: d.type,
        startTime: d.startTime,
        sportTime: (d as Record<string, number>)['sportTime(s)'] || d.sportTime || 0,
        maxPace: (d as Record<string, number>)['maxPace(/meter)'] || d.maxPace || 0,
        minPace: (d as Record<string, number>)['minPace(/meter)'] || d.minPace || 0,
        distance: (d as Record<string, number>)['distance(m)'] || d.distance || 0,
        avgPace: (d as Record<string, number>)['avgPace(/meter)'] || d.avgPace || 0,
        calories: (d as Record<string, number>)['calories(kcal)'] || d.calories || 0,
    }));
}

export function loadBodyData(): BodyData[] {
    const file = findCsvFile('BODY');
    if (!file) return [];

    const data = parseCSV<BodyData>(file);
    // Filter out entries with no weight
    return data.filter((d) => d.weight > 0);
}

export function loadUserData(): UserData | null {
    const file = findCsvFile('USER');
    if (!file) return null;

    const data = parseCSV<UserData>(file);
    return data[0] || null;
}

export function getLatestData() {
    const activity = loadActivityData();
    const sleep = loadSleepData();
    const heartRate = loadHeartRateData();
    const body = loadBodyData();
    const sport = loadSportData();
    const user = loadUserData();

    // Get the most recent activity with data
    const latestActivity = activity.length > 0 ? activity[activity.length - 1] : null;
    const latestSleep = sleep.length > 0 ? sleep[sleep.length - 1] : null;
    const latestBody = body.length > 0 ? body[body.length - 1] : null;

    return {
        user,
        latestActivity,
        latestSleep,
        latestBody,
        activityCount: activity.length,
        sleepCount: sleep.length,
        heartRateCount: heartRate.length,
        sportCount: sport.length,
        bodyCount: body.length,
    };
}
