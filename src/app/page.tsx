import {
  loadActivityData,
  loadSleepData,
  loadBodyData,
  loadSportData,
  loadUserData,
} from '@/lib/data-loader';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  // Load data on the server
  const user = loadUserData();
  const activity = loadActivityData();
  const sleep = loadSleepData();
  const body = loadBodyData();
  const sport = loadSportData();

  // Calculate summary stats
  const recentActivity = activity.slice(-7);
  const avgSteps = recentActivity.length > 0
    ? Math.round(recentActivity.reduce((sum, d) => sum + d.steps, 0) / recentActivity.length)
    : 0;

  const recentSleep = sleep.slice(-7);
  const avgSleep = recentSleep.length > 0
    ? Math.round(recentSleep.reduce((sum, d) => sum + d.deepSleepTime + d.shallowSleepTime + d.REMTime, 0) / recentSleep.length)
    : 0;

  const totalCaloriesWeek = recentActivity.reduce((sum, d) => sum + d.calories, 0);
  const workoutsThisMonth = sport.filter((s) => {
    const date = new Date(s.startTime);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const latestActivity = activity[activity.length - 1];
  const latestBody = body[body.length - 1];

  return (
    <Dashboard
      user={user}
      activity={activity}
      sleep={sleep}
      body={body}
      stats={{
        avgSteps,
        avgSleep,
        totalCaloriesWeek,
        workoutsThisMonth,
        todaySteps: latestActivity?.steps || 0,
        todayCalories: latestActivity?.calories || 0,
        latestWeight: latestBody?.weight || 0,
        latestBmi: latestBody?.bmi || 0,
      }}
    />
  );
}
