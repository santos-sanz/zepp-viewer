import { NextResponse } from 'next/server';
import {
    loadActivityData,
    loadSleepData,
    loadHeartRateData,
    loadSportData,
    loadBodyData,
    loadUserData,
    getLatestData,
} from '@/lib/data-loader';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    try {
        let data;

        switch (type) {
            case 'activity':
                data = loadActivityData();
                break;
            case 'sleep':
                data = loadSleepData();
                break;
            case 'heartrate':
                data = loadHeartRateData();
                break;
            case 'sport':
                data = loadSportData();
                break;
            case 'body':
                data = loadBodyData();
                break;
            case 'user':
                data = loadUserData();
                break;
            case 'latest':
                data = getLatestData();
                break;
            default:
                return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error loading ${type} data:`, error);
        return NextResponse.json(
            { error: 'Failed to load data' },
            { status: 500 }
        );
    }
}
