import { NextResponse } from 'next/server';
import { deleteInstance } from '@/lib/storage';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await deleteInstance(id);
    return NextResponse.json({ success: true });
}
