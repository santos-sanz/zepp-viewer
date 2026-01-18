import {
  loadActivityData,
  loadSleepData,
  loadBodyData,
  loadUserData,
} from '@/lib/data-loader';
import {
  calculateActivityAnalytics,
  calculateSleepAnalytics,
  calculateBodyAnalytics,
} from '@/lib/analytics';
import {
  loadHeartRateAutoData,
  calculateStressAnalytics,
} from '@/lib/stress-analytics';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  // Load data on the server
  const user = loadUserData();
  const activity = loadActivityData();
  const sleep = loadSleepData();
  const body = loadBodyData();
  const heartRate = loadHeartRateAutoData();

  // Calculate advanced analytics
  const activityAnalytics = calculateActivityAnalytics(activity);
  const sleepAnalytics = calculateSleepAnalytics(sleep);
  const bodyAnalytics = calculateBodyAnalytics(body);
  const stressAnalytics = calculateStressAnalytics(heartRate);

  return (
    <Dashboard
      user={user}
      activity={activity}
      sleep={sleep}
      body={body}
      activityAnalytics={activityAnalytics}
      sleepAnalytics={sleepAnalytics}
      bodyAnalytics={bodyAnalytics}
      stressAnalytics={stressAnalytics}
    />
  );
}
