import { NextResponse } from 'next/server';
import {
    loadActivityData,
    loadSleepData,
    loadBodyData,
    loadUserData,
} from '@/lib/data-loader';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function buildHealthContext() {
    const user = loadUserData();
    const activity = loadActivityData();
    const sleep = loadSleepData();
    const body = loadBodyData();

    // Get recent data (last 30 entries)
    const recentActivity = activity.slice(-30);
    const recentSleep = sleep.slice(-30);
    const latestBody = body[body.length - 1];

    // Calculate averages
    const avgSteps = recentActivity.length > 0
        ? Math.round(recentActivity.reduce((sum, d) => sum + d.steps, 0) / recentActivity.length)
        : 0;

    const avgSleep = recentSleep.length > 0
        ? Math.round(recentSleep.reduce((sum, d) => sum + d.deepSleepTime + d.shallowSleepTime + d.REMTime, 0) / recentSleep.length)
        : 0;

    const avgCalories = recentActivity.length > 0
        ? Math.round(recentActivity.reduce((sum, d) => sum + d.calories, 0) / recentActivity.length)
        : 0;

    // Best/worst days
    const bestStepsDay = recentActivity.reduce((best, d) =>
        d.steps > best.steps ? d : best, recentActivity[0] || { date: 'N/A', steps: 0 });

    const bestSleepDay = recentSleep.reduce((best, d) => {
        const total = d.deepSleepTime + d.shallowSleepTime + d.REMTime;
        const bestTotal = best.deepSleepTime + best.shallowSleepTime + best.REMTime;
        return total > bestTotal ? d : best;
    }, recentSleep[0] || { date: 'N/A', deepSleepTime: 0, shallowSleepTime: 0, REMTime: 0 });

    return `
User Profile:
- Name: ${user?.nickName || 'User'}
- Height: ${user?.height || latestBody?.height || 'Unknown'} cm
- Current Weight: ${latestBody?.weight || 'Unknown'} kg
- BMI: ${latestBody?.bmi?.toFixed(1) || 'Unknown'}

Recent Activity (Last 30 days):
- Average Steps: ${avgSteps.toLocaleString()} per day
- Average Calories Burned: ${avgCalories} kcal per day
- Best Day: ${bestStepsDay?.date || 'N/A'} with ${(bestStepsDay?.steps || 0).toLocaleString()} steps
- Total Records: ${activity.length}

Recent Sleep (Last 30 days):
- Average Total Sleep: ${Math.round(avgSleep)} minutes per night
- Average in hours: ${(avgSleep / 60).toFixed(1)} hours
- Best Sleep Night: ${bestSleepDay?.date || 'N/A'} with ${Math.round((bestSleepDay?.deepSleepTime || 0) + (bestSleepDay?.shallowSleepTime || 0) + (bestSleepDay?.REMTime || 0))} minutes
- Total Records: ${sleep.length}

Body Composition (Latest):
- Weight: ${latestBody?.weight || 'N/A'} kg
- Body Fat: ${latestBody?.fatRate || 'N/A'}%
- Muscle Rate: ${latestBody?.muscleRate || 'N/A'}%
- Metabolism: ${latestBody?.metabolism || 'N/A'} kcal
`.trim();
}

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        const modelId = process.env.MODEL_ID || 'xiaomi/mimo-v2-flash:free';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API key not configured' },
                { status: 500 }
            );
        }

        const healthContext = buildHealthContext();

        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://zepp-viewer.local',
                'X-Title': 'Zepp Health Viewer',
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful health assistant analyzing the user's Zepp fitness/health data. Be encouraging and provide actionable insights. Here is the user's health data summary:

${healthContext}

Answer questions about their health data. Be specific with numbers when available. If asked about trends, use the available data. Keep responses concise and friendly.`,
                    },
                    {
                        role: 'user',
                        content: message,
                    },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenRouter error:', error);
            return NextResponse.json(
                { error: 'Failed to get AI response' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content || 'No response generated';

        return NextResponse.json({ message: aiMessage });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
