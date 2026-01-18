// TypeScript types for Zepp health data

export interface ActivityData {
  date: string;
  steps: number;
  distance: number;
  runDistance: number;
  calories: number;
}

export interface SleepData {
  date: string;
  deepSleepTime: number;
  shallowSleepTime: number;
  wakeTime: number;
  start: string;
  stop: string;
  REMTime: number;
  naps: string;
}

export interface HeartRateData {
  time: string;
  heartRate: number;
}

export interface SportData {
  type: number;
  startTime: string;
  sportTime: number; // seconds
  maxPace: number;
  minPace: number;
  distance: number; // meters
  avgPace: number;
  calories: number;
}

export interface BodyData {
  time: string;
  weight: number;
  height: number;
  bmi: number;
  fatRate: number | null;
  bodyWaterRate: number | null;
  boneMass: number | null;
  metabolism: number | null;
  muscleRate: number | null;
  visceralFat: number | null;
}

export interface UserData {
  userId: string;
  gender: number; // 1 = male, 0 = female
  height: number;
  weight: number;
  nickName: string;
  avatar: string;
  birthday: string;
}

// Summary types for dashboard
export interface TodaySummary {
  steps: number;
  distance: number;
  calories: number;
  sleepMinutes: number;
  lastHeartRate: number | null;
  lastWeight: number | null;
}

export interface WeeklySummary {
  avgSteps: number;
  avgSleep: number;
  totalCalories: number;
  workouts: number;
}
