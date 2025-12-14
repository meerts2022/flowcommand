import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStoredInstances, saveInstance } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await getStoredInstances(session.user.id);
    return NextResponse.json(instances);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const newInstance = {
        id: body.id || uuidv4(),
        name: body.name,
        url: body.url,
        apiKey: body.apiKey,
    };

    await saveInstance(session.user.id, newInstance);
    return NextResponse.json(newInstance);
}
