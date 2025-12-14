import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteInstance } from '@/lib/storage';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteInstance(session.user.id, id);
    return NextResponse.json({ success: true });
}
