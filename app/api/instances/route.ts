import { NextResponse } from 'next/server';
import { getStoredInstances, saveInstance } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const instances = await getStoredInstances();
    return NextResponse.json(instances);
}

export async function POST(request: Request) {
    const body = await request.json();

    const newInstance = {
        id: body.id || uuidv4(),
        name: body.name,
        url: body.url,
        apiKey: body.apiKey,
    };

    await saveInstance(newInstance);
    return NextResponse.json(newInstance);
}
